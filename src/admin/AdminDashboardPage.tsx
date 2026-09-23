import React, { useState, useEffect } from 'react';
import { 
  getDashboardStats, 
  DashboardStats, 
  getAdmissionScores,
  getAuditLogs 
} from '../lib/firebase';
import { AdmissionScoreDoc, AuditLogDoc, NavigationTab } from '../types';
import { normalizeOrientationMajorCode } from '../data/orientationData';
import { 
  FileSpreadsheet, 
  School, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Users, 
  Clock, 
  ArrowRight,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface AdminDashboardPageProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onSelectTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScores, setRecentScores] = useState<AdmissionScoreDoc[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [dashStats, allScores, logs] = await Promise.all([
        getDashboardStats(),
        getAdmissionScores(),
        getAuditLogs(),
      ]);
      const latestYear = Math.max(...allScores.map((score) => score.nam), 2026);
      const latestYearMajorCount = new Set(
        allScores
          .filter((score) => score.nam === latestYear && score.ma_nganh)
          .map((score) => normalizeOrientationMajorCode(String(score.ma_nganh).trim()))
      ).size;
      setStats({ ...dashStats, totalMajors: latestYearMajorCount });
      setRecentScores(allScores.slice(0, 5));
      setRecentLogs(logs.slice(0, 5));
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute records count per year for chart
  const yearDistributionData = React.useMemo(() => {
    if (!stats || !recentScores.length) return [];
    const counts: Record<number, number> = {};
    recentScores.forEach((s) => {
      counts[s.nam] = (counts[s.nam] || 0) + 1;
    });
    return Object.entries(counts).map(([year, count]) => ({
      year: `Năm ${year}`,
      count,
    }));
  }, [stats, recentScores]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-blue-100 text-[var(--ussh-blue-dark)] text-xs font-bold mb-1.5">
            <Database className="w-3.5 h-3.5 text-blue-700" />
            <span>Trung tâm chỉ huy & Điều hành tuyển sinh</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            TỔNG QUAN HỆ THỐNG DỮ LIỆU USSH
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp từ các bộ sưu tập Firestore tuyển sinh
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Main Metric Cards Grid (Part G: Thống kê từ Firestore) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tổng số bản ghi điểm chuẩn */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Tổng bản ghi điểm chuẩn</span>
            <div className="text-2xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading ? '...' : (stats?.totalScores.toLocaleString() ?? 'Chưa có dữ liệu')}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>admission_scores</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[var(--ussh-blue-dark)] flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Số ngành */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Số ngành đào tạo</span>
            <div className="text-2xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading ? '...' : (stats?.totalMajors ?? 'Chưa có dữ liệu')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Dữ liệu năm 2026
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#f8e9ec] text-[#8f1d2c] flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Số năm dữ liệu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Số năm dữ liệu</span>
            <div className="text-2xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading ? '...' : (stats?.totalYears ?? 'Chưa có dữ liệu')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block truncate max-w-[140px]">
              {stats?.yearsList.join(', ') || 'Chưa có năm'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#edf3fa] text-[var(--ussh-blue-dark)] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Số thành viên Admin */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Tài khoản quản trị</span>
            <div className="text-2xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading ? '...' : (stats?.totalAdmins ?? 0)}
            </div>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
              Phân quyền 3 cấp
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#f8e9ec] text-[#8f1d2c] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row (Lượt dự đoán & Lượt truy cập) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Số lượt dự đoán */}
        <div className="bg-white p-4 rounded-2xl border border-[#c9d8e8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Lượt dự đoán đã ghi nhận</span>
            <div className="text-xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading
                ? 'Đang tải...'
                : loadError
                  ? 'Không thể tải dữ liệu'
                : stats?.predictionsError
                  ? 'Không thể tải dữ liệu'
                  : stats?.totalPredictions
                    ? stats.totalPredictions.toLocaleString()
                    : 'Chưa có dữ liệu'}
            </div>
            <span className="text-[10px] text-[#8f1d2c] font-medium">
              {loadError || stats?.predictionsError ? 'Kiểm tra kết nối và quyền truy cập Firestore' : 'Lượt ghi nhận từ user_score_distribution'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#edf3fa] text-[var(--ussh-blue-dark)] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Access totals are intentionally not presented as a business metric. */}
        <div className="bg-white p-4 rounded-2xl border border-[#e7c6cd] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Dữ liệu lượt truy cập</span>
            <div className="text-xl font-bold text-[#8f1d2c] mt-1">
              {loading
                ? 'Đang tải...'
                : loadError
                  ? 'Không thể tải dữ liệu'
                : stats?.pageViewsError
                  ? 'Không thể tải dữ liệu'
                  : stats?.pageViewsTracked && stats.totalPageViews
                    ? stats.totalPageViews.toLocaleString()
                    : 'Chưa có dữ liệu lượt truy cập'}
            </div>
            <span className="text-[10px] text-[#8f1d2c] font-medium">
              {loadError || stats?.pageViewsError ? 'Kiểm tra kết nối và quyền truy cập Firestore' : 'Hệ thống chưa có cơ chế ghi nhận lượt truy cập'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#f8e9ec] text-[#8f1d2c] flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        {/* Cập nhật gần nhất */}
        <div className="bg-white p-4 rounded-2xl border border-[#c9d8e8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Lần đồng bộ gần nhất</span>
            <div className="text-xl font-bold text-[var(--ussh-blue-dark)] mt-1">
              {loading ? 'Đang tải...' : loadError ? 'Không thể tải dữ liệu' : (stats?.lastUpdatedText || 'Chưa có thông tin đồng bộ')}
            </div>
            <span className="text-[10px] text-[var(--ussh-blue-dark)] font-medium">Cập nhật từ dữ liệu admission_scores</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#edf3fa] text-[var(--ussh-blue-dark)] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onSelectTab('admin-scores')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--ussh-blue-dark)]">Quản lý điểm chuẩn</h3>
            <p className="text-xs text-slate-500">Tra cứu, chỉnh sửa, xóa và thêm mới các bản ghi</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        <div 
          onClick={() => onSelectTab('admin-import')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--ussh-blue-dark)]">Nhập dữ liệu Excel/CSV</h3>
            <p className="text-xs text-slate-500">Tải lên file, preview, validate lỗi chi tiết và import</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

      </div>

      {/* Two Column Section: Recent Admission Scores & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Admission Scores */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-[var(--ussh-blue-dark)] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              Điểm chuẩn cập nhật gần đây
            </h2>
            <button
              onClick={() => onSelectTab('admin-scores')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentScores.map((score) => (
              <div key={score.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{score.ten_nganh}</div>
                  <div className="text-slate-500 text-[11px]">
                    Năm {score.nam} • Tổ hợp {score.to_hop} • {score.he_dao_tao}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--ussh-red)] text-sm">{score.diem_chuan.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{score.ma_nganh}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Audit Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-[var(--ussh-blue-dark)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Nhật ký hoạt động gần đây
            </h2>
            <button
              onClick={() => onSelectTab('admin-audit-logs')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{log.admin_email}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-tight">{log.details}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-mono uppercase">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.collection_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
