import React from 'react';
import { useAdminAuth } from './auth/AdminAuthContext';
import { navigateTo } from '../lib/router';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { USSHLogo } from '../components/USSHLogo';

export const AccessDeniedPage: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigateTo('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Truy cập bị từ chối (403 Forbidden)
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Tài khoản <strong className="text-slate-800">{adminUser?.email || 'hiện tại'}</strong> không có quyền truy cập vào Khu vực Quản trị Hệ thống USSH.
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900">
          <p className="font-semibold">Lưu ý bảo mật:</p>
          <p className="mt-1 text-amber-800">
            Chỉ những cán bộ có tên trong danh sách phân quyền của Trường ĐH KHXH&NV mới được phép đăng nhập. Vui lòng liên hệ Trưởng phòng Đào tạo nếu đây là sự nhầm lẫn.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản này</span>
          </button>

          <button
            onClick={() => navigateTo('/')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về Cổng thông tin Tuyển sinh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
