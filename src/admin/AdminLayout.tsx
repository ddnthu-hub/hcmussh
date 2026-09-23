import React, { useEffect, useState } from 'react';
import { NavigationTab, AdminRole } from '../types';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Upload, 
  Users, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Shield,
  UserCheck
  ,Mail
} from 'lucide-react';
import { getAllUserMessages } from '../lib/userMessages';

interface AdminLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
  currentAdminEmail: string;
  currentAdminName: string;
  currentAdminRole: AdminRole;
  onChangeAdminRole?: (role: AdminRole) => void;
  onLogout?: () => void;
  onGoToPublic?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  currentAdminEmail,
  currentAdminName,
  currentAdminRole,
  onChangeAdminRole,
  onLogout,
  onGoToPublic,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unansweredMessages, setUnansweredMessages] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnansweredMessages = async () => {
      try {
        const messages = await getAllUserMessages();
        if (active) setUnansweredMessages(messages.filter((message) => message.status === 'unanswered').length);
      } catch {
        if (active) setUnansweredMessages(0);
      }
    };

    void loadUnansweredMessages();
    const intervalId = window.setInterval(() => void loadUnansweredMessages(), 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const navItems: { tab: NavigationTab; path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'admin', path: '/admin/dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { tab: 'admin-scores', path: '/admin/admission-scores', label: 'Quản lý điểm chuẩn', icon: FileSpreadsheet },
    { tab: 'admin-import', path: '/admin/upload', label: 'Nhập dữ liệu', icon: Upload },
    { tab: 'admin-members', path: '/admin/members', label: 'Quản lý thành viên', icon: Users },
    { tab: 'admin-audit-logs', path: '/admin/audit-logs', label: 'Nhật ký hoạt động', icon: History },
    { tab: 'admin-messages', path: '/admin/user-messages', label: 'Câu hỏi người dùng', icon: Mail },
    { tab: 'admin-settings', path: '/admin/settings', label: 'Cài đặt & cấu hình', icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.tab === 'admin-members' || item.tab === 'admin-settings') return currentAdminRole === 'superadmin';
    if (item.tab === 'admin-import') return currentAdminRole === 'superadmin' || currentAdminRole === 'admin';
    return true;
  });

  const displayAdminName = currentAdminName.trim()
    && currentAdminName.trim().toLowerCase() !== currentAdminEmail.trim().toLowerCase()
    ? currentAdminName.trim()
    : 'Quản trị viên';
  const displayAdminRole = currentAdminRole === 'superadmin'
    ? 'Super Admin'
    : currentAdminRole === 'admin'
      ? 'Admin'
      : 'Editor';

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-[#f4f8fc] text-[#173b63] flex flex-col font-sans"
      style={{
        fontFamily: '"Segoe UI", SegoeUI, Tahoma, Geneva, Verdana, sans-serif',
        '--ussh-blue': '#123b69',
        '--ussh-blue-dark': '#0b2a4a',
        '--ussh-blue-light': '#1d568d',
        '--ussh-blue-subtle': '#eaf3fb',
        '--ussh-red': '#8f1d2c',
        '--ussh-yellow': '#f5b700',
      } as React.CSSProperties}
    >
      {/* Admin Top Header */}
      <header className="fixed inset-x-0 top-0 z-40 bg-white/95 text-[#0b2a4a] border-b border-[#dfeaf5] shadow-[0_6px_18px_rgba(15,43,92,0.06)] backdrop-blur-sm">
        <div className="w-full px-3 sm:px-4 lg:px-5 h-16 flex items-center justify-between">
          {/* Left branding */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('admin')}>
              <div className="flex items-center gap-2 shrink-0">
                <img src="/logo-dhqg.jpg" alt="Logo Đại học Quốc gia Thành phố Hồ Chí Minh" className="h-8 w-auto rounded-sm object-contain" />
                <img src="/logo_ussh.png" alt="Logo Trường Đại học Khoa học Xã hội và Nhân văn" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#8f1d2c] leading-tight">
                  KHU VỰC QUẢN TRỊ VIÊN
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#0b2a4a] leading-tight">
                  HỆ THỐNG QUẢN TRỊ DỮ LIỆU USSH
                </div>
              </div>
            </div>
          </div>

          {/* Right admin account and exit */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Account Info Pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#edf5ff] px-3 py-1.5 rounded-lg border border-[#d2e5f6]">
              <UserCheck className="w-4 h-4 text-[#8f1d2c] shrink-0" />
              <div className="text-left">
                <span className="block font-medium text-[#173b63] truncate max-w-[180px]">
                  {displayAdminName}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200 bg-white text-[#173b63]">
                {displayAdminRole}
              </span>
            </div>

            {/* Back to Candidate Portal */}
            <button
              onClick={() => {
                if (onGoToPublic) onGoToPublic();
                else handleNavClick('home');
              }}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#edf5ff] hover:bg-[#dfeeff] text-[#0b2a4a] font-semibold transition-colors cursor-pointer"
              title="Về website dành cho thí sinh"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Về cổng hệ thống</span>
              <span className="sm:hidden">Cổng hệ thống</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#8f1d2c] hover:bg-[#731624] text-white font-semibold transition-colors cursor-pointer"
                title="Đăng xuất quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#0b2a4a] hover:text-[#8f1d2c] hover:bg-[#e8f1f8]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-5 pt-20 pb-6 flex gap-5">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 shrink-0 sticky top-20 self-start h-fit">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs sticky top-22">
            <div className="px-3 py-2 text-sm font-extrabold text-[#8f1d2c] uppercase tracking-wider">
              Danh mục quản trị
            </div>
            <nav className="space-y-1 mt-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleNavClick(item.tab)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#123b69] text-white font-extrabold shadow-[0_6px_16px_rgba(18,59,105,0.25)]'
                        : 'text-[#173b63] hover:-translate-y-0.5 hover:bg-[#e8f1f8] hover:text-[#8f1d2c] hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="flex min-w-0 items-center gap-2">
                      <span>{item.label}</span>
                      {item.tab === 'admin-messages' && unansweredMessages > 0 && <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{unansweredMessages > 99 ? '99+' : unansweredMessages}</span>}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* System Info Footnote */}
            <div className="mt-6 pt-4 border-t border-slate-100 px-3 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center space-x-1 text-slate-600 font-medium">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>USSH Admin v2.6.4</span>
              </div>
              <p className="text-[10px] text-slate-400">
                ĐHQG TP.HCM • Bảo mật cấp 3
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-row-reverse">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo-dhqg.jpg" alt="Logo ĐHQG" className="h-6 w-auto rounded-sm" />
                      <img src="/logo_ussh.png" alt="Logo USSH" className="h-6 w-auto" />
                    </div>
                    <span className="font-bold text-xs text-[var(--ussh-blue-dark)]">USSH Admin</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1 mt-4">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => handleNavClick(item.tab)}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive ? 'bg-[#123b69] text-white font-extrabold shadow-sm' : 'text-[#173b63] hover:bg-[#e8f1f8] hover:text-[#8f1d2c]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="flex min-w-0 items-center gap-2">
                          <span>{item.label}</span>
                          {item.tab === 'admin-messages' && unansweredMessages > 0 && <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{unansweredMessages > 99 ? '99+' : unansweredMessages}</span>}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#8f1d2c] text-white text-xs font-semibold hover:bg-[#731624] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onGoToPublic) onGoToPublic();
                    else handleNavClick('home');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Về cổng hệ thống</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Routed Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
