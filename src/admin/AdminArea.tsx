import React from 'react';
import { useAdminAuth } from './auth/AdminAuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminScoresPage } from './AdminScoresPage';
import { AdminMessagesPage } from './AdminMessagesPage';
import { AdminImportPage } from './AdminImportPage';
import { AdminMembersPage } from './AdminMembersPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminLoginPage } from './AdminLoginPage';
import { AccessDeniedPage } from './AccessDeniedPage';
import { BackToTop } from '../components/BackToTop';
import { AdminSubRoute, adminSubRouteToNavTab, resolvePath, navigateTo } from '../lib/router';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { NavigationTab } from '../types';

interface AdminAreaProps {
  subRoute: AdminSubRoute;
}

export const AdminArea: React.FC<AdminAreaProps> = ({ subRoute }) => {
  const { 
    adminUser, 
    adminRole, 
    isAuthenticated, 
    isAuthorized, 
    loading, 
    logout, 
    setAdminRole 
  } = useAdminAuth();

  // 1. Loading state during auth verification
  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#edf6ff_0%,_#f6f9fc_32%,_#eef4fb_100%)] text-slate-800 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="p-3 bg-white/90 rounded-2xl border border-[#dfeaf5] shadow-[0_12px_28px_rgba(15,43,92,0.12)] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <img src="/logo-dhqg.jpg" alt="Logo ĐHQG" className="h-8 w-auto rounded-sm" />
              <img src="/logo_ussh.png" alt="Logo USSH" className="h-8 w-auto" />
            </div>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c]" />
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-[#0f2b5c]">
              Hệ thống Quản trị Dữ liệu USSH
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Đang xác thực thông tin & quyền truy cập cán bộ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user accessing admin routes -> display Admin Login
  if (!isAuthenticated || subRoute === 'login') {
    return <AdminLoginPage />;
  }

  // 3. Authenticated but unauthorized (no admin role or disabled status)
  if (!isAuthorized) {
    return <AccessDeniedPage />;
  }

  const isSuperadminOnlyRoute = subRoute === 'members' || subRoute === 'settings' || subRoute === 'messages';
  const canAccessImport = adminRole === 'superadmin' || adminRole === 'admin';
  if (isSuperadminOnlyRoute && adminRole !== 'superadmin') {
    return <AccessDeniedPage />;
  }
  if (subRoute === 'import' && !canAccessImport) {
    return <AccessDeniedPage />;
  }

  // 4. Authenticated & Authorized admin officer -> render AdminLayout with sub-page
  const currentTab: NavigationTab = adminSubRouteToNavTab(subRoute);

  const handleSelectTab = (tab: NavigationTab | string) => {
    navigateTo(tab);
  };

  const handleLogout = async () => {
    await logout();
    navigateTo('/admin/login');
  };

  const handleGoToPublic = () => {
    navigateTo('/');
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      currentAdminEmail={adminUser?.email || 'admin@ussh.edu.vn'}
      currentAdminName={adminUser?.name || ''}
      currentAdminRole={adminRole}
      onChangeAdminRole={setAdminRole}
      onLogout={handleLogout}
      onGoToPublic={handleGoToPublic}
    >
      {subRoute === 'dashboard' && (
        <AdminDashboardPage onSelectTab={handleSelectTab} currentAdminRole={adminRole} />
      )}
      {subRoute === 'scores' && (
        <AdminScoresPage
          currentAdminEmail={adminUser?.email || ''}
          currentAdminRole={adminRole}
        />
      )}
      {subRoute === 'messages' && (
        <AdminMessagesPage
          currentAdminEmail={adminUser?.email || ''}
          currentAdminRole={adminRole}
        />
      )}
      {subRoute === 'import' && (
        <AdminImportPage
          currentAdminEmail={adminUser?.email || ''}
          currentAdminRole={adminRole}
        />
      )}
      {subRoute === 'members' && (
        <AdminMembersPage
          currentAdminEmail={adminUser?.email || ''}
          currentAdminRole={adminRole}
        />
      )}
      {subRoute === 'audit-logs' && (
        <AdminAuditLogsPage />
      )}
      {subRoute === 'settings' && (
        <AdminSettingsPage />
      )}
      <BackToTop />
    </AdminLayout>
  );
};
