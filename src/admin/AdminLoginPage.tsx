import React, { useState } from 'react';
import { useAdminAuth } from './auth/AdminAuthContext';
import { navigateTo } from '../lib/router';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, error, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      navigateTo('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#edf6ff_0%,_#f7fafc_42%,_#eef4fb_100%)] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8" style={{ fontFamily: '"Segoe UI", SegoeUI, Tahoma, Geneva, Verdana, sans-serif' }}>
      {/* Top Bar with Return Link */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => navigateTo('/')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#0f2b5c] hover:text-[#0b2a4a] bg-white/80 hover:bg-[#edf5ff] px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer border border-[#dfeaf5] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Cổng thông tin Tuyển sinh</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-[#0f2b5c]/80 font-mono bg-white/70 border border-[#dfeaf5] rounded-full px-3 py-1.5 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-[#8f1d2c]" />
          <span>Hệ thống nội bộ USSH</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white text-slate-900 rounded-3xl shadow-[0_18px_45px_rgba(15,43,92,0.12)] p-6 sm:p-8 border border-[#e5edf7]">
        {/* Header Branding */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex p-3 rounded-2xl bg-white border border-blue-100 shadow-xs">
            <div className="flex items-center gap-2">
              <img src="/logo-dhqg.jpg" alt="Logo ĐHQG" className="h-8 w-auto rounded-sm" />
              <img src="/logo_ussh.png" alt="Logo USSH" className="h-8 w-auto" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0f2d59] tracking-tight uppercase">
              Hệ thống Quản trị Dữ liệu USSH
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Trường ĐH KHXH&NV – ĐHQG TP.HCM
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-[var(--ussh-blue)] text-[11px] font-bold border border-blue-100">
            <Lock className="w-3 h-3 text-[var(--ussh-blue)]" />
            <span>Khu vực bảo mật • Xác thực phân quyền</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email đăng nhập
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[var(--ussh-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu xác thực
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[var(--ussh-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full mt-2 py-3 px-4 bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Đang kiểm tra quyền truy cập...</span>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-blue-200/60 py-2">
        © 2026 – 2027 Trường Đại học Khoa học Xã hội và Nhân văn – ĐHQG TP.HCM • Hệ thống Quản trị Bảo mật
      </div>
    </div>
  );
};
