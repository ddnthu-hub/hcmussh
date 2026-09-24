import React, { useState, useEffect, useMemo } from 'react';
import { 
  Major, 
  NavigationTab, 
  CriteriaKey, 
  CriteriaProfile, 
  MajorFitResult, 
  OrientationHistoryItem 
} from '../types';
import { 
  ORIENTATION_QUESTIONS, 
  CRITERIA_METADATA, 
  CRITERIA_KEYS,
  calculateUserProfile, 
  rankAllMajors, 
  getOrientationMajorProfiles,
  saveDraftSurvey, 
  loadDraftSurvey, 
  clearDraftSurvey, 
  saveSurveyHistory,
  loadSurveyHistory,
  clearSurveyHistory,
  deleteSurveyHistoryItem
} from '../data/orientationData';
import { getAdmissionScores, AdmissionScoreDoc } from '../lib/firebase';
import { Pagination } from '../components/Pagination';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Lightbulb,
  History,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Award,
  Layers,
  BookOpen,
  Calendar,
  ExternalLink,
  Database,
  Trash2
} from 'lucide-react';

interface MajorOrientationPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onViewMajor: (major: Major) => void;
  onSelectMajorForPrediction: (majorId: string) => void;
}

export const MajorOrientationPage: React.FC<MajorOrientationPageProps> = ({
  onSelectTab,
  onViewMajor,
  onSelectMajorForPrediction,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'quiz' | 'history'>('quiz');

  // Firestore Real Data State
  const [firestoreScores, setFirestoreScores] = useState<AdmissionScoreDoc[]>([]);

  // Load Firestore admission scores on mount
  useEffect(() => {
    let isMounted = true;
    getAdmissionScores()
      .then((records) => {
        if (isMounted) {
          setFirestoreScores(records);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải dữ liệu ngành từ Firestore:', err);
        if (isMounted) {
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Quiz Engine State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<{
    userRawProfile: CriteriaProfile;
    userProfile: CriteriaProfile;
    rankedMajors: MajorFitResult[];
  } | null>(null);

  // Draft & History State
  const [hasDraftNotice, setHasDraftNotice] = useState(false);
  const [historyList, setHistoryList] = useState<OrientationHistoryItem[]>([]);
  const [showAllRankedMajors, setShowAllRankedMajors] = useState(false);
  const [rankingPage, setRankingPage] = useState(1);
  const RANKING_PER_PAGE = 8;

  const orientationMajorProfiles = useMemo(
    () => getOrientationMajorProfiles(firestoreScores),
    [firestoreScores]
  );

  // Load draft & history on initial mount
  useEffect(() => {
    const savedDraft = loadDraftSurvey();
    if (savedDraft && Object.keys(savedDraft.answers).length > 0) {
      setHasDraftNotice(true);
    }
    const savedHistory = loadSurveyHistory();
    setHistoryList(savedHistory);
  }, []);

  // Current Question details
  const currentQuestion = ORIENTATION_QUESTIONS[currentQuestionIndex];
  const maxSelectForCurrent = currentQuestion?.maxSelect || 1;
  const currentSelectedOptions = answers[currentQuestion?.id] || [];

  // Toggle selection for an option
  const handleToggleOption = (optionId: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const current = answers[qId] || [];

    let next: string[];
    if (current.includes(optionId)) {
      // Bỏ chọn
      next = current.filter((id) => id !== optionId);
    } else {
      if (maxSelectForCurrent === 1) {
        // Chọn 1 đáp án: thay thế luôn
        next = [optionId];
      } else {
        // Chọn tối đa N đáp án
        if (current.length < maxSelectForCurrent) {
          next = [...current, optionId];
        } else {
          // Đã đủ giới hạn: giữ nguyên lựa chọn hiện tại.
          return;
        }
      }
    }

    const nextAnswers = { ...answers, [qId]: next };
    setAnswers(nextAnswers);
    saveDraftSurvey(nextAnswers, currentQuestionIndex);
  };

  // Next question / Submit
  const isCurrentSelectionValid = currentSelectedOptions.length <= maxSelectForCurrent;

  const handleNextQuestion = () => {
    if (!currentQuestion || currentSelectedOptions.length === 0 || !isCurrentSelectionValid) return;

    if (currentQuestionIndex < ORIENTATION_QUESTIONS.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      saveDraftSurvey(answers, nextIdx);
    } else {
      // Hoàn thành khảo sát: tính toán hồ sơ và % phù hợp
      finishSurvey(answers);
    }
  };

  // Previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      saveDraftSurvey(answers, prevIdx);
    }
  };

  const handleExitSurvey = () => {
    saveDraftSurvey(answers, currentQuestionIndex);
    setHasDraftNotice(Object.keys(answers).length > 0);
    setQuizStarted(false);
  };

  // Calculate & Finish
  const finishSurvey = (finalAnswers: Record<number, string[]>) => {
    const { userRawProfile, userProfile } = calculateUserProfile(finalAnswers);
    const rankedMajors = rankAllMajors(userProfile, orientationMajorProfiles, firestoreScores);
    const top3 = rankedMajors.slice(0, 3);

    // Lưu vào lịch sử và dọn draft
    saveSurveyHistory(finalAnswers, userRawProfile, userProfile, top3);
    clearDraftSurvey();

    setCalculatedResults({
      userRawProfile,
      userProfile,
      rankedMajors,
    });
    setRankingPage(1);
    setQuizCompleted(true);
    setHasDraftNotice(false);
    setHistoryList(loadSurveyHistory());
  };

  // Restore draft
  const handleRestoreDraft = () => {
    const savedDraft = loadDraftSurvey();
    if (savedDraft) {
      setAnswers(savedDraft.answers);
      setCurrentQuestionIndex(Math.min(savedDraft.currentQuestionIndex, ORIENTATION_QUESTIONS.length - 1));
      setQuizStarted(true);
      setActiveViewMode('quiz');
      setHasDraftNotice(false);
    }
  };

  // Discard draft
  const handleDiscardDraft = () => {
    clearDraftSurvey();
    setHasDraftNotice(false);
  };

  const handleClearSurveyHistory = () => {
    if (historyList.length === 0) return;
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử khảo sát định hướng không?')) return;
    clearSurveyHistory();
    setHistoryList([]);
    setActiveViewMode('quiz');
  };

  const handleDeleteSurveyHistoryItem = (historyId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa lần khảo sát này không?')) return;
    deleteSurveyHistoryItem(historyId);
    const nextHistory = loadSurveyHistory();
    setHistoryList(nextHistory);
    if (nextHistory.length === 0) setActiveViewMode('quiz');
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    clearDraftSurvey();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizStarted(true);
    setQuizCompleted(false);
    setCalculatedResults(null);
    setShowAllRankedMajors(false);
    setRankingPage(1);
    setActiveViewMode('quiz');
  };

  // Load a historical survey result
  const handleLoadHistoryItem = (item: OrientationHistoryItem) => {
    const rankedMajors = rankAllMajors(item.userProfile, orientationMajorProfiles, firestoreScores);
    setCalculatedResults({
      userRawProfile: item.userRawProfile,
      userProfile: item.userProfile,
      rankedMajors,
    });
    setRankingPage(1);
    setAnswers(item.answers);
    setQuizStarted(true);
    setQuizCompleted(true);
    setActiveViewMode('quiz');
  };

  const totalRankingPages = calculatedResults
    ? Math.ceil(calculatedResults.rankedMajors.length / RANKING_PER_PAGE) || 1
    : 1;
  const paginatedRankedMajors = useMemo(() => {
    if (!calculatedResults) return [];
    const start = (rankingPage - 1) * RANKING_PER_PAGE;
    return calculatedResults.rankedMajors.slice(start, start + RANKING_PER_PAGE);
  }, [calculatedResults, rankingPage]);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5 text-[var(--ussh-blue-dark)]" />
            <span>Tư vấn định hướng ngành học 2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Định hướng ngành học & Khám phá tiềm năng
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Hệ thống phân tích mức độ tương đồng giữa đặc điểm sở thích, phản xạ tư duy cá nhân và hồ sơ yêu cầu đặc trưng của từng ngành học tại Trường ĐH KHXH&NV – ĐHQG TP.HCM.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap rounded-xl bg-slate-100 p-1.5 border border-slate-200 shrink-0 gap-1">
          {historyList.length > 0 && (
            <button
              id="orientation-history-tab-btn"
              onClick={() => setActiveViewMode('history')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                activeViewMode === 'history'
                  ? 'bg-white text-[var(--ussh-blue-dark)] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Lịch sử ({historyList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Draft Notification Banner */}
      {hasDraftNotice && (activeViewMode !== 'quiz' || !quizStarted) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center space-x-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Bạn đang có một bài khảo sát định hướng đang làm dở. Bạn có muốn tiếp tục hoàn thành không?
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Tiếp tục làm bài
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors"
            >
              Hủy bài cũ
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          ORIENTATION SURVEY & RESULTS
         ==================================================================== */}
      {activeViewMode === 'quiz' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {!quizStarted ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-md space-y-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 space-y-2">
                <div className="flex items-center gap-2 text-[var(--ussh-blue-dark)]">
                  <Info className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Khảo sát định hướng ngành</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Bộ khảo sát gồm {ORIENTATION_QUESTIONS.length} câu hỏi ngắn về sở thích, năng lực và cách học để xây dựng hồ sơ phù hợp với các ngành hiện có trong dữ liệu USSH.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-sm text-[var(--ussh-blue-dark)]">9 tiêu chí</strong>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">Phân tích, giao tiếp, nghiên cứu, ngôn ngữ và các nhóm năng lực liên quan.</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-sm text-[var(--ussh-blue-dark)]">Thang 1–5</strong>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">Mỗi lựa chọn thể hiện mức độ phù hợp của bạn với hoạt động được mô tả.</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-sm text-[var(--ussh-blue-dark)]">Fit %</strong>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">So sánh hồ sơ của bạn với hồ sơ tiêu chí từng ngành, không phải xác suất trúng tuyển.</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setQuizStarted(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--ussh-blue-dark)] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--ussh-blue)]"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Bắt đầu khảo sát định hướng
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : !quizCompleted ? (
            /* ACTIVE QUIZ QUESTION */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={handleExitSurvey}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Dừng làm</span>
                </button>
              </div>
              {/* Progress & Question Counter */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[var(--ussh-blue-dark)]">
                    Câu hỏi {currentQuestionIndex + 1} / {ORIENTATION_QUESTIONS.length}
                  </span>
                  <span className="text-slate-500">
                    Tiến độ: {Math.round(((currentQuestionIndex + 1) / ORIENTATION_QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--ussh-blue-dark)] h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / ORIENTATION_QUESTIONS.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--ussh-blue-dark)] leading-snug">
                    {currentQuestion.text}
                  </h3>
                  {currentQuestion.hint && (
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{currentQuestion.hint} (Đã chọn: <strong className="text-[var(--ussh-blue-dark)]">{currentSelectedOptions.length}/{maxSelectForCurrent}</strong>)</span>
                    </p>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = currentSelectedOptions.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleToggleOption(option.id)}
                        aria-pressed={isSelected}
                        disabled={maxSelectForCurrent > 1 && !isSelected && currentSelectedOptions.length >= maxSelectForCurrent}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all text-xs sm:text-sm flex items-start space-x-3.5 ${
                          isSelected
                            ? 'border-[var(--ussh-blue)] bg-blue-50/60 shadow-xs text-slate-900 font-medium'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-[var(--ussh-blue)] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + idx)}
                        </div>
                        <span className="leading-relaxed mt-0.5 flex-1">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Survey Navigation Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                      currentQuestionIndex === 0
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>

                  <div className="text-[11px] text-slate-500 hidden sm:block">
                    Tự động lưu tiến độ khảo sát
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentSelectedOptions.length === 0 || !isCurrentSelectionValid}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      currentSelectedOptions.length === 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white shadow-xs'
                    }`}
                  >
                    <span>
                      {currentQuestionIndex === ORIENTATION_QUESTIONS.length - 1
                        ? 'Hoàn thành & Xem kết quả'
                        : 'Câu tiếp theo'}
                    </span>
                    {currentQuestionIndex === ORIENTATION_QUESTIONS.length - 1 ? (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* QUIZ COMPLETED RESULT VIEW */
            calculatedResults && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Khảo sát định hướng hoàn tất</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
                        Kết quả định hướng ngành học
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                        Dựa trên hồ sơ 9 tiêu chí được tổng hợp từ {ORIENTATION_QUESTIONS.length} câu trả lời của bạn, hệ thống đã đo lường mức độ tương đồng và xếp hạng các ngành đào tạo tại USSH.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleResetQuiz}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Làm lại khảo sát</span>
                      </button>
                    </div>
                  </div>

                  {/* Scientific Disclaimer Note */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-[var(--ussh-blue)] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Lưu ý về thuật toán định hướng:</strong> Điểm số <span className="font-bold text-[var(--ussh-blue-dark)]">% phù hợp</span> biểu thị mức độ tương đồng giữa hồ sơ trả lời của bạn với hồ sơ yêu cầu do hệ thống thiết kế cho từng ngành. Đây là công cụ tham khảo định hướng học tập, <strong>không phải xác suất trúng tuyển</strong> và không thay thế kết quả xét tuyển chính thức của Hội đồng Tuyển sinh Nhà trường.
                    </div>
                  </div>
                </div>

                {/* Section 1: User Profile - 9 Criteria Normalized Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--ussh-blue-dark)] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[var(--ussh-blue)]" />
                        <span>Hồ sơ năng khiếu & đặc điểm cá nhân (Thang 0 – 100)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Điểm số chuẩn hóa của 9 tiêu chí từ các đáp án bạn đã chọn
                      </p>
                    </div>
                  </div>

                  {/* 9 Criteria Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                    {CRITERIA_KEYS.map((key) => {
                      const score = calculatedResults.userProfile[key] || 0;
                      const meta = CRITERIA_METADATA[key];
                      return (
                        <div
                          key={key}
                          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2 hover:bg-white hover:border-slate-200 hover:shadow-2xs transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{meta.name}</span>
                            <span className="text-xs font-extrabold text-[var(--ussh-blue-dark)]">
                              {score}/100
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${score}%`, backgroundColor: meta.color }}
                            ></div>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {meta.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Top 3 Recommended Majors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--ussh-blue-dark)] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Top 3 ngành học có mức độ phù hợp cao nhất</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Được xếp hạng dựa trên độ tương đồng có trọng số giữa hồ sơ của bạn và hồ sơ ngành
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {calculatedResults.rankedMajors.slice(0, 3).map((result, idx) => {
                      const rankBadges = [
                        { label: '#1 Phù hợp nhất', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                        { label: '#2 Phù hợp cao', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
                        { label: '#3 Phù hợp cao', bg: 'bg-blue-50 text-blue-900 border-blue-200' },
                      ];
                      const badge = rankBadges[idx] || rankBadges[2];

                      return (
                        <div
                          key={result.majorCode}
                          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                                  Mã ngành: {result.majorCode}
                                </span>
                              </div>
                              <h4 className="text-xl font-bold text-[var(--ussh-blue-dark)]">
                                {result.majorName}
                              </h4>
                              {result.majorData && (
                                <p className="text-xs text-slate-500 mt-0.5">{result.majorData.faculty}</p>
                              )}
                              {result.majorData && (
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 max-w-2xl leading-relaxed">
                                  {result.majorData.description}
                                </p>
                              )}
                            </div>

                            {/* Prominent Fit Score Badge */}
                            <div className="bg-[var(--ussh-blue)]/5 border border-[var(--ussh-blue)]/20 rounded-xl p-4 text-center shrink-0 min-w-[140px]">
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Mức độ phù hợp
                              </span>
                              <div className="text-3xl font-extrabold text-[var(--ussh-blue-dark)]">
                                {result.fitScore}%
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Điểm thô: {result.rawWeightedScore.toFixed(1)}/100
                              </span>
                            </div>
                          </div>

                          {/* Matching Explanation */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-700 block">
                              Các tiêu chí có mức độ tương đồng nổi bật với bạn:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {result.topMatchingCriteria.map((critKey) => {
                                const meta = CRITERIA_METADATA[critKey];
                                const breakdown = result.criteriaBreakdown.find((b) => b.criterion === critKey);
                                return (
                                  <div
                                    key={critKey}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-semibold">{meta.name}</span>
                                    {breakdown && (
                                      <span className="text-emerald-700 text-[11px]">
                                        (Tương đồng {breakdown.similarity}%)
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-500 italic mt-1">
                              Ngành có mức độ phù hợp cao với hồ sơ trả lời của bạn ở các đặc điểm hoạt động học tập và kỹ năng trên.
                            </p>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                            {result.majorData && (
                              <button
                                onClick={() => onSelectMajorForPrediction(result.majorCode)}
                                className="px-4 py-2 text-xs font-bold text-white bg-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue)] rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                              >
                                <span>Dự đoán trúng tuyển ngành này</span>
                              </button>
                            )}
                          </div>

                          {/* Separate 2026 Admissions Info Block (Distinct from FitScore) */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-[var(--ussh-blue)]" />
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Thông tin tuyển sinh năm 2026 (Tham khảo)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-slate-500 block text-[11px] mb-0.5">Hình thức xét tuyển:</span>
                                <span className="font-semibold text-slate-800">
                                  {result.admissions2026?.methods.slice(0, 2).join(', ') || 'THPT, ĐGNL, Kết hợp'}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-slate-500 block text-[11px] mb-0.5">Tổ hợp môn xét tuyển:</span>
                                <span className="font-semibold text-slate-800">
                                  {result.admissions2026?.combinations.join(', ') || 'D01, C00, D14'}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="text-slate-500 block text-[11px] mb-0.5">Mẫu điểm chuẩn 2026:</span>
                                <span className="font-semibold text-[var(--ussh-blue-dark)]">
                                  {result.admissions2026?.benchmarkSample ? `${result.admissions2026.benchmarkSample} đ` : 'Đang cập nhật'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                            {result.majorData && (
                              <>
                                <button
                                  onClick={() => onSelectMajorForPrediction(result.majorCode)}
                                  className="px-4 py-2 text-xs font-bold text-white bg-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue)] rounded-lg transition-colors flex items-center space-x-1.5"
                                >
                                  <span>Dự đoán trúng tuyển ngành này</span>
                                </button>
                                <button
                                  onClick={() => onViewMajor(result.majorData!)}
                                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1.5"
                                >
                                  <span>Xem chi tiết ngành</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Expand / View All Ranked Majors */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Bảng xếp hạng đầy đủ tất cả các ngành đào tạo
                      </h4>
                      <p className="text-xs text-slate-500">
                        Xem vị trí và mức độ phù hợp của toàn bộ các ngành tại USSH theo kết quả khảo sát
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAllRankedMajors(!showAllRankedMajors)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                    >
                      {showAllRankedMajors ? 'Thu gọn' : `Xem tất cả (${calculatedResults.rankedMajors.length} ngành)`}
                    </button>
                  </div>

                  {showAllRankedMajors && (
                    <div id="orientation-ranking-table" className="overflow-x-auto pt-2">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Hạng</th>
                            <th className="p-3">Mã ngành</th>
                            <th className="p-3">Tên ngành</th>
                            <th className="p-3 text-right">% Phù hợp</th>
                            <th className="p-3">Tiêu chí tương đồng nổi bật</th>
                            <th className="p-3 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedRankedMajors.map((item) => (
                            <tr key={item.majorCode} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold text-slate-700">#{item.rank}</td>
                              <td className="p-3 font-mono text-slate-600">{item.majorCode}</td>
                              <td className="p-3 font-semibold text-slate-900">{item.majorName}</td>
                              <td className="p-3 text-right">
                                <span className="font-bold text-[var(--ussh-blue-dark)] px-2 py-0.5 rounded-md bg-blue-50">
                                  {item.fitScore}%
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">
                                {item.topMatchingCriteria.map(k => CRITERIA_METADATA[k].name).join(', ')}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  {item.majorData && (
                                    <>
                                      <button
                                        onClick={() => onSelectMajorForPrediction(item.majorCode)}
                                        className="text-[var(--ussh-blue-dark)] hover:underline font-bold text-xs"
                                      >
                                        Dự đoán
                                      </button>
                                      <button
                                        onClick={() => onViewMajor(item.majorData!)}
                                        className="text-blue-700 hover:underline font-bold text-xs"
                                      >
                                        Chi tiết
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {calculatedResults.rankedMajors.length > RANKING_PER_PAGE && (
                        <Pagination
                          currentPage={rankingPage}
                          totalPages={totalRankingPages}
                          onPageChange={setRankingPage}
                          scrollTargetId="orientation-ranking-table"
                          totalRecords={calculatedResults.rankedMajors.length}
                          startIndex={(rankingPage - 1) * RANKING_PER_PAGE}
                          endIndex={Math.min(rankingPage * RANKING_PER_PAGE, calculatedResults.rankedMajors.length)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ====================================================================
          MODE 3: SURVEY HISTORY VIEWER
         ==================================================================== */}
      {activeViewMode === 'history' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--ussh-blue-dark)] whitespace-nowrap">
                  <History className="w-5 h-5 shrink-0 text-[var(--ussh-blue)]" />
                  <span className="truncate">Lịch sử các lần làm khảo sát định hướng</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Lưu trữ kết quả các lần làm khảo sát để bạn tiện theo dõi và so sánh
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Làm lại khảo sát</span>
              </button>
              <button
                type="button"
                onClick={handleClearSurveyHistory}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa lịch sử</span>
              </button>
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Chưa có kết quả khảo sát nào được lưu.
              </div>
            ) : (
              <div className="space-y-4">
                {historyList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Lần khảo sát #{historyList.length - idx}</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.completedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <span className="font-bold block mb-1">Top 3 ngành phù hợp tại lần làm này:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {item.top3Majors.map((m, mIdx) => (
                          <div key={m.majorCode} className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                            <div className="text-[11px] text-slate-500 font-mono">{m.majorCode}</div>
                            <div className="font-bold text-slate-800 truncate">{m.majorName}</div>
                            <div className="text-[var(--ussh-blue-dark)] font-extrabold mt-0.5">
                              {m.fitScore}% phù hợp
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteSurveyHistoryItem(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadHistoryItem(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--ussh-blue)] text-white text-xs font-bold hover:bg-[var(--ussh-blue-dark)] transition-colors flex items-center space-x-1"
                      >
                        <span>Xem lại chi tiết kết quả</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
