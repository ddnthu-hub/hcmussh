import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { NavigationTab, Major } from '../types';
import { 
  getPredictionHistory, 
  getLatestPrediction, 
  PredictionHistoryRecord 
} from '../lib/predictionHistory';
import { 
  hasCompletedPrediction,
  getUserScoreDistribution,
  calculateScoreDistribution,
  calculateUserScoreStatistics,
  findBucketForScore,
  getValidDistributionUserCount,
  DistributionBucket,
  UserScoreStatistics,
  UserScoreRecord
} from '../lib/userScoreDistribution';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area,
  Cell,
  ReferenceDot
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Target, 
  ArrowRight, 
  Sparkles,
  Calculator,
  Lock,
  RotateCcw,
  AlertCircle,
  BarChart3,
  Percent,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ScoreDistributionPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onViewMajor?: (major: Major) => void;
  onSelectMajorForPrediction?: (majorId: string) => void;
}

export const ScoreDistributionPage: React.FC<ScoreDistributionPageProps> = ({
  onSelectTab,
}) => {
  // 1. Quản lý trạng thái quyền truy cập & lịch sử dự đoán của người dùng hiện tại
  const [historyList, setHistoryList] = useState<PredictionHistoryRecord[]>(() => getPredictionHistory());
  const [selectedPredictionId, setSelectedPredictionId] = useState<string>(() => {
    const latest = getLatestPrediction();
    return latest ? latest.id : '';
  });
  const [isPredictionMenuOpen, setIsPredictionMenuOpen] = useState(false);
  const predictionMenuRef = useRef<HTMLDivElement>(null);

  const [hasAccess, setHasAccess] = useState<boolean>(() => hasCompletedPrediction());
  const [activeChartType, setActiveChartType] = useState<'bar' | 'area'>('bar');

  // 2. Community chỉ chứa REAL mới nhất của mỗi thiết bị.
  const [communityScores, setCommunityScores] = useState<number[]>([]);
  const [communityRecords, setCommunityRecords] = useState<UserScoreRecord[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Đồng bộ lịch sử dự đoán khi có cập nhật
  useEffect(() => {
    const syncHistory = () => {
      const updated = getPredictionHistory();
      setHistoryList(updated);
      if (updated.length > 0) {
        setHasAccess(true);
        setSelectedPredictionId(updated[0].id);
      }
    };

    window.addEventListener('ussh_prediction_updated', syncHistory);
    return () => window.removeEventListener('ussh_prediction_updated', syncHistory);
  }, []);

  useEffect(() => {
    const closePredictionMenu = (event: MouseEvent) => {
      if (predictionMenuRef.current && !predictionMenuRef.current.contains(event.target as Node)) {
        setIsPredictionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closePredictionMenu);
    return () => document.removeEventListener('mousedown', closePredictionMenu);
  }, []);

  // Tải dữ liệu điểm xét tuyển người dùng từ Firestore (năm 2026)
  const fetchScoresData = useCallback(async (forceRefresh = false) => {
    setIsLoadingScores(true);
    setFetchError(null);
    try {
      const records = await getUserScoreDistribution(2026, forceRefresh);
      const scores = records.map((r) => r.userAdmissionScore);
      setCommunityRecords(records);
      setCommunityScores(scores);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phân bố điểm người dùng:', err);
      setFetchError('Không thể tải dữ liệu phân bố điểm người dùng lúc này.');
      setCommunityRecords([]);
      setCommunityScores([]);
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  // Tải dữ liệu khi có quyền xem
  useEffect(() => {
    if (hasAccess) {
      fetchScoresData();
    }
  }, [hasAccess, fetchScoresData]);

  // Lắng nghe sự kiện có điểm mới được lưu vào hệ thống
  useEffect(() => {
    const handleDistributionUpdated = () => {
      fetchScoresData(true);
    };
    window.addEventListener('ussh_score_distribution_updated', handleDistributionUpdated);
    return () => window.removeEventListener('ussh_score_distribution_updated', handleDistributionUpdated);
  }, [fetchScoresData]);

  // Record dự đoán đang được chọn của thí sinh
  const activePrediction = useMemo<PredictionHistoryRecord | null>(() => {
    if (historyList.length === 0) return null;
    return historyList.find((r) => r.id === selectedPredictionId) || historyList[0];
  }, [historyList, selectedPredictionId]);

  const getMajorDisplayName = (prediction: PredictionHistoryRecord) => (
    prediction.majorCode === 'ALL' ? 'Tất cả các ngành' : prediction.majorName
  );

  const getScoreTypeDotClass = (scoreType?: PredictionHistoryRecord['scoreType']) => {
    if (scoreType === 'real') return 'bg-emerald-500';
    if (scoreType === 'fake') return 'bg-rose-500';
    return 'bg-slate-400';
  };

  const getScoreTypeTitle = (scoreType?: PredictionHistoryRecord['scoreType']) => {
    if (scoreType === 'real') return 'Điểm thực tế';
    if (scoreType === 'fake') return 'Điểm giả định';
    return 'Loại điểm chưa xác định';
  };

  // Điểm xét tuyển dự kiến của thí sinh đang xem (thang 100)
  const userScore = activePrediction ? activePrediction.finalAdmissionScore : 0;
  const userBucketRange = useMemo(() => {
    return userScore > 0 ? findBucketForScore(userScore) : null;
  }, [userScore]);

  const validUserCount = useMemo(() => getValidDistributionUserCount(communityRecords), [communityRecords]);
  const hasEnoughDistributionUsers = validUserCount >= 2;

  // 3. Tính toán các khoảng phân bố điểm (8 khoảng chuẩn thang 100) từ dữ liệu người dùng
  const distributionBuckets: DistributionBucket[] = useMemo(() => {
    return calculateScoreDistribution(communityScores);
  }, [communityScores]);

  // 4. Tính toán 5 chỉ số thống kê thực tế từ dữ liệu người dùng
  const stats: UserScoreStatistics = useMemo(() => {
    return calculateUserScoreStatistics(communityScores);
  }, [communityScores]);

  // 5. Thống kê vị trí tương đối của thí sinh so với cộng đồng người dùng
  const candidatePositionInfo = useMemo(() => {
    if (communityScores.length === 0 || userScore <= 0) {
      return null;
    }
    const lowerCount = communityScores.filter((s) => s < userScore).length;
    const sameOrLowerCount = communityScores.filter((s) => s <= userScore).length;
    const percentile = Math.round((lowerCount / communityScores.length) * 100);

    return {
      percentile,
      lowerCount,
      sameOrLowerCount,
      totalUsers: communityScores.length,
      userBucket: userBucketRange,
    };
  }, [communityScores, userScore, userBucketRange]);

  // Điểm đang chọn chỉ là điểm đối chiếu; không cộng vào dữ liệu cộng đồng.
  const selectedScoreMarker = useMemo(() => {
    if (!activePrediction || !userBucketRange || userScore <= 0) return null;
    const bucket = distributionBuckets.find((item) => item.range === userBucketRange);
    return {
      bucket: userBucketRange,
      score: userScore,
      scoreType: activePrediction.scoreType,
      y: Math.max(bucket?.userCount || 0, 1),
    };
  }, [activePrediction, distributionBuckets, userBucketRange, userScore]);

  // =========================================================================
  // GATE STATE: Người dùng CHƯA thực hiện dự báo trúng tuyển
  // =========================================================================
  if (!hasAccess && historyList.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--ussh-blue-dark)]" />
            <span>Cộng đồng thí sinh 2026 (Thang 100 điểm)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Phân bố điểm xét tuyển của người dùng
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            Phân bố được tổng hợp từ điểm xét tuyển dự kiến của những người dùng đã thực hiện dự báo trên hệ thống.
          </p>
        </div>

        {/* Lock Notice Card */}
        <div className="bg-white rounded-2xl border border-amber-200 p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Yêu cầu hoàn thành dự báo
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bạn cần thực hiện dự báo trúng tuyển trước khi xem phân bố điểm.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dữ liệu phân bố được tổng hợp trực tiếp từ điểm xét tuyển dự kiến do chính các thí sinh tính toán trên hệ thống. Để mở khóa biểu đồ phân bố và đối chiếu vị trí điểm số của bạn, vui lòng hoàn thành ít nhất một lượt phân tích dự báo.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="goto-prediction-gate-btn"
              type="button"
              onClick={() => onSelectTab('prediction')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue)] text-white font-bold text-sm sm:text-base shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Calculator className="w-5 h-5 text-amber-300" />
              <span>Đến trang Dự báo trúng tuyển</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL STATE: Người dùng ĐÃ dự báo -> Hiển thị phân bố điểm người dùng
  // =========================================================================
  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-[var(--ussh-blue-dark)]" />
            <span>Dữ liệu cộng đồng thí sinh 2027 (Thang 100 điểm)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Phân bố điểm xét tuyển của người dùng
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Dữ liệu được tổng hợp từ các thiết bị đã dự báo thành công trên hệ thống.
          </p>
        </div>

        {/* Controls & Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {historyList.length > 1 && (
            <div ref={predictionMenuRef} className="relative w-full sm:w-auto">
              <span id="select-prediction-run-label" className="sr-only">Chọn lần dự đoán</span>
              <button
                id="select-prediction-run"
                type="button"
                aria-labelledby="select-prediction-run-label"
                aria-expanded={isPredictionMenuOpen}
                onClick={() => setIsPredictionMenuOpen((current) => !current)}
                className="relative inline-flex w-full min-w-64 items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 pt-5 text-left text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0f2b5c] cursor-pointer"
              >
                <span className="absolute left-3 top-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Dữ liệu điểm của bạn</span>
                {(() => {
                  const selected = activePrediction || historyList[0];
                  return (
                    <span className="mt-1 flex min-w-0 items-center gap-2 truncate">
                      <span aria-label={getScoreTypeTitle(selected.scoreType)} title={getScoreTypeTitle(selected.scoreType)} className={`h-2.5 w-2.5 shrink-0 rounded-full ${getScoreTypeDotClass(selected.scoreType)}`} />
                      <span className="flex min-w-0 flex-col truncate leading-tight">
                        <strong className="truncate text-sm text-slate-900">{selected.finalAdmissionScore.toFixed(2)} điểm</strong>
                        <span className="truncate text-[10px] font-medium text-slate-500">{selected.formattedDate}</span>
                      </span>
                    </span>
                  );
                })()}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isPredictionMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPredictionMenuOpen && (
                <div className="absolute right-0 z-30 mt-1 max-h-72 w-full min-w-80 overflow-y-auto rounded-lg border border-slate-300 bg-white p-1 shadow-lg">
                  {historyList.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelectedPredictionId(h.id);
                        setIsPredictionMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${h.id === selectedPredictionId ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span aria-label={getScoreTypeTitle(h.scoreType)} title={getScoreTypeTitle(h.scoreType)} className={`h-2.5 w-2.5 shrink-0 rounded-full ${getScoreTypeDotClass(h.scoreType)}`} />
                      <span className="flex min-w-0 flex-col truncate leading-tight">
                        <span className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Dữ liệu điểm của bạn</span>
                        <strong className="truncate text-sm text-slate-900">{h.finalAdmissionScore.toFixed(2)} điểm</strong>
                        <span className="truncate text-[10px] font-medium text-slate-500">{h.formattedDate}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 2. Top Summary Card: Candidate Selected Prediction Overview */}
      {activePrediction && (
        <div className="bg-gradient-to-r from-[#0f2b5c] to-[#1e3a8a] text-white rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-blue-200">
              {activePrediction.formattedDate}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-100">
              <span aria-label={getScoreTypeTitle(activePrediction.scoreType)} title={getScoreTypeTitle(activePrediction.scoreType)} className={`h-2.5 w-2.5 shrink-0 rounded-full ${getScoreTypeDotClass(activePrediction.scoreType)}`} />
              <span>{getScoreTypeTitle(activePrediction.scoreType)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-bold text-blue-100">
                {activePrediction.formLabel || activePrediction.admissionForm}
              </span>
              <span>Tổ hợp: {activePrediction.combination === 'all' ? 'Tất cả' : activePrediction.combination || 'Chung'}</span>
            </div>
            <h2 className="text-xs font-extrabold text-white">
              {getMajorDisplayName(activePrediction)}
              {activePrediction.majorCode !== 'ALL' && ` (${activePrediction.majorCode})`}
            </h2>
            <p className="text-xs text-blue-100/90">
              Điểm chuẩn tham chiếu 2026: <strong>{activePrediction.cutoffScore ? activePrediction.cutoffScore.toFixed(2) : '—'}/100</strong>
              {activePrediction.scoreGap !== null && (
                <span className="ml-2 font-bold">
                  (Chênh lệch: {activePrediction.scoreGap >= 0 ? `+${activePrediction.scoreGap.toFixed(2)}` : activePrediction.scoreGap.toFixed(2)} điểm)
                </span>
              )}
            </p>
          </div>

          {/* Candidate Expected Score */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-center md:col-start-4">
            <span className="text-xs text-blue-200 font-semibold block">Điểm xét tuyển dự kiến của bạn</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight mt-0.5">
              {userScore.toFixed(2)}
              <span className="text-sm font-normal text-blue-200 ml-1">/ 100</span>
            </div>
            <span className="text-[11px] text-blue-200 block mt-0.5">
              Khoảng điểm: <strong>{userBucketRange || '—'}</strong>
            </span>
          </div>

        </div>
      )}

      {/* 3. Empty State or Loading State handling */}
      {isLoadingScores ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-[var(--ussh-blue-dark)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-700">Đang tổng hợp dữ liệu phân bố điểm người dùng từ hệ thống...</p>
          <p className="text-xs text-slate-500 mt-1">Vui lòng chờ trong giây lát.</p>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Không thể tải dữ liệu phân bố điểm.</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{fetchError}</p>
          </div>
          <button type="button" onClick={() => fetchScoresData(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ussh-blue-dark)] px-4 py-2.5 text-xs font-bold text-white">
            <RotateCcw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      ) : !hasEnoughDistributionUsers ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Chưa có đủ dữ liệu người dùng để xây dựng phân bố điểm.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {validUserCount === 1
                ? 'Hiện có 1 người dùng đã cung cấp dữ liệu điểm. Cần ít nhất 2 người dùng hợp lệ để hiển thị phân bố điểm.'
                : 'Hệ thống chưa ghi nhận đủ số lượng người dùng hợp lệ để vẽ biểu đồ phân bố. Biểu đồ sẽ tự động xuất hiện khi có ít nhất 2 người dùng hoàn thành dự đoán và lưu dữ liệu điểm thành công.'}
            </p>
          </div>
        </div>
      ) : (
        /* Khi ĐÃ có dữ liệu người dùng */
        <div className="space-y-6">
          {/* Main Visual Section: Metric Summary + Recharts Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 5 Statistics Cards (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-[#0f2b5c] flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span>Thống kê điểm xét tuyển người dùng</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu được tổng hợp từ {stats.totalCount} người dùng.
                  </p>
                </div>

                {/* 5 Real Metrics from user scores */}
                <div className="space-y-3">
                  {/* Metric 1: Số người dùng */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Tổng số người dùng:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {stats.totalCount}
                    </span>
                  </div>

                  {/* Metric 2: Điểm trung bình */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span>Điểm trung bình người dùng:</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {stats.averageScore.toFixed(2)} / 100
                    </span>
                  </div>

                  {/* Metric 3: Điểm thấp nhất */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                      <span>Điểm thấp nhất:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {stats.minScore.toFixed(2)}
                    </span>
                  </div>

                  {/* Metric 4: Điểm cao nhất */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Điểm cao nhất:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800 text-sm">
                      {stats.maxScore.toFixed(2)}
                    </span>
                  </div>

                  {/* Metric 5: Khoảng điểm phổ biến nhất */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Khoảng điểm nhiều người nhất:</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-900 text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      {stats.mostCommonRange}
                    </span>
                  </div>
                </div>

                {/* Candidate position commentary */}
                {candidatePositionInfo && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-blue-950">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Vị trí điểm của bạn trong cộng đồng:</span>
                    </div>
                    <p className="leading-relaxed">
                      Với mức điểm xét tuyển <strong>{userScore.toFixed(2)}/100</strong>, bạn thuộc khoảng điểm <strong>{userBucketRange}</strong> và cao hơn <strong>{candidatePositionInfo.percentile}%</strong> số thiết bị hợp lệ đã ghi nhận trên hệ thống.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Dữ liệu điểm được dùng cho thống kê cộng đồng và không hiển thị thông tin cá nhân của người dùng.
              </div>
            </div>

            {/* Right Column: Recharts Visual Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#0f2b5c] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Phân bố điểm xét tuyển của người dùng</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu cộng đồng chỉ gồm REAL mới nhất của mỗi thiết bị. Điểm đang chọn ({userScore.toFixed(2)}đ) được đánh dấu riêng để đối chiếu.
                  </p>
                </div>

                {/* Chart Type Toggle: Histogram / Area */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  <button
                    id="chart-toggle-histogram"
                    type="button"
                    onClick={() => setActiveChartType('bar')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeChartType === 'bar'
                        ? 'bg-white text-[#0f2b5c] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cột (Histogram)
                  </button>
                  <button
                    id="chart-toggle-area"
                    type="button"
                    onClick={() => setActiveChartType('area')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeChartType === 'area'
                        ? 'bg-white text-[#0f2b5c] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đường miền (Area)
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="w-full h-84 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === 'bar' ? (
                    <BarChart 
                      data={distributionBuckets} 
                      margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="range" 
                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        allowDecimals={false}
                        name="Số người dùng"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as DistributionBucket;
                            const isUserBucket = data.range === userBucketRange;
                            return (
                              <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5 max-w-xs">
                                <div className="font-bold text-[#0f2b5c] flex items-center justify-between gap-4">
                                  <span>Khoảng điểm: {data.range}</span>
                                  {isUserBucket && (
                                    <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                                      Điểm của bạn ({userScore.toFixed(2)}đ)
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-700">
                                  Số người dùng: <strong>{data.userCount} thiết bị</strong> ({data.percentage}%)
                                </div>
                                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                  Chiếm {data.percentage}% trên tổng số {stats.totalCount} người dùng
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="userCount" radius={[6, 6, 0, 0]} name="Số người dùng">
                        {distributionBuckets.map((bucket, index) => {
                          const isUserBucket = bucket.range === userBucketRange;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isUserBucket ? '#f59e0b' : '#0f2b5c'}
                              className={isUserBucket ? 'stroke-amber-600 stroke-2' : ''}
                            />
                          );
                        })}
                      </Bar>
                      {selectedScoreMarker && (
                        <ReferenceDot
                          x={selectedScoreMarker.bucket}
                          y={selectedScoreMarker.y}
                          r={7}
                          fill={selectedScoreMarker.scoreType === 'fake' ? '#e11d48' : '#f59e0b'}
                          stroke="#ffffff"
                          strokeWidth={2}
                          label={{
                            value: `${selectedScoreMarker.scoreType === 'fake' ? 'Giả định' : 'Đang chọn'} ${selectedScoreMarker.score.toFixed(2)}`,
                            position: 'top',
                            fill: selectedScoreMarker.scoreType === 'fake' ? '#be123c' : '#92400e',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </BarChart>
                  ) : (
                    <AreaChart 
                      data={distributionBuckets} 
                      margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                    >
                      <defs>
                        <linearGradient id="userAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f2b5c" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0f2b5c" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="range" 
                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        allowDecimals={false}
                        name="Số người dùng"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as DistributionBucket;
                            const isUserBucket = data.range === userBucketRange;
                            return (
                              <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5 max-w-xs">
                                <div className="font-bold text-[#0f2b5c] flex items-center justify-between gap-4">
                                  <span>Khoảng điểm: {data.range}</span>
                                  {isUserBucket && (
                                    <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                                      Điểm của bạn ({userScore.toFixed(2)}đ)
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-700">
                                  Số thiết bị: <strong>{data.userCount} thiết bị</strong> ({data.percentage}%)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="userCount" 
                        name="Số người dùng"
                        stroke="#0f2b5c" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#userAreaGradient)" 
                      />
                      {selectedScoreMarker && (
                        <ReferenceDot
                          x={selectedScoreMarker.bucket}
                          y={selectedScoreMarker.y}
                          r={7}
                          fill={selectedScoreMarker.scoreType === 'fake' ? '#e11d48' : '#f59e0b'}
                          stroke="#ffffff"
                          strokeWidth={2}
                          label={{
                            value: `${selectedScoreMarker.scoreType === 'fake' ? 'Giả định' : 'Đang chọn'} ${selectedScoreMarker.score.toFixed(2)}`,
                            position: 'top',
                            fill: selectedScoreMarker.scoreType === 'fake' ? '#be123c' : '#92400e',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Legend Indicator & Status */}
              <div className="flex flex-col items-start text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#0f2b5c] inline-block"></span>
                    <span>Số người dùng trong khoảng</span>
                  </div>
                  {userBucketRange && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
                      <span className="font-bold text-slate-800">Khoảng điểm của bạn ({userBucketRange})</span>
                    </div>
                  )}
                  {selectedScoreMarker?.scoreType === 'fake' && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                      <span className="font-bold text-rose-700">Điểm giả định đang xem ({userScore.toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-[#0f2b5c]">Bạn có muốn điều chỉnh điểm và dự đoán lại không?</h4>
          <p className="mt-0.5 text-xs text-slate-500">Bạn có thể cập nhật điểm thành phần để xem lại kết quả dự đoán.</p>
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('prediction')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ussh-blue-dark)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--ussh-blue)] cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Dự đoán lại</span>
        </button>
      </div>

    </div>
  );
};
