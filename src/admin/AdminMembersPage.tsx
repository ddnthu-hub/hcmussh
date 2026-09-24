import React, { useState, useEffect } from 'react';
import { getAdminMembers, addAdminMember, saveAdminMember, deleteAdminMember } from '../lib/firebase';
import { AdminMemberDoc, AdminRole } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AdminMembersPageProps {
  currentAdminEmail: string;
  currentAdminRole: AdminRole;
}

export const AdminMembersPage: React.FC<AdminMembersPageProps> = ({
  currentAdminEmail,
  currentAdminRole,
}) => {
  const [members, setMembers] = useState<AdminMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<AdminMemberDoc> | null>(null);
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isSuperadmin = currentAdminRole === 'superadmin';
  const isProtectedSuperadmin = (member: Partial<AdminMemberDoc>) => {
    const role = String(member.role || '').toLowerCase().replace(/[-\s]+/g, '_');
    return role === 'superadmin' || role === 'super_admin';
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const list = await getAdminMembers();
      setMembers(list);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !isSuperadmin) return;

    if (!editingMember.email || !editingMember.name) {
      alert('Vui lòng nhập đầy đủ Email và Họ tên cán bộ.');
      return;
    }

    if (isProtectedSuperadmin(editingMember)) {
      const originalMember = members.find((member) => member.id === editingMember.id);
      if (
        !originalMember
        || editingMember.email.trim().toLowerCase() !== originalMember.email.trim().toLowerCase()
        || editingMember.role !== originalMember.role
        || editingMember.status !== originalMember.status
      ) {
        alert('Không được đổi email, role hoặc trạng thái của Super Admin duy nhất.');
        return;
      }
    } else if (String(editingMember.role || '').toLowerCase().replace(/[-\s]+/g, '_') === 'super_admin') {
      alert('Không thể tạo hoặc cấp role Super Admin cho tài khoản khác.');
      return;
    }

    try {
      if (!editingMember.id) {
        if (newMemberPassword.length < 6) {
          alert('Mật khẩu phải có ít nhất 6 ký tự.');
          return;
        }
        await addAdminMember({
          email: editingMember.email.trim().toLowerCase(),
          name: editingMember.name.trim(),
          password: newMemberPassword,
          role: editingMember.role === 'admin' ? 'admin' : 'editor',
        });
      } else {
        await saveAdminMember(editingMember, currentAdminEmail);
      }
      setEditingMember(null);
      setNewMemberPassword('');
      await loadMembers();
    } catch (err) {
      console.error('Error saving member:', err);
      alert(err instanceof Error ? err.message : 'Không thể thêm thành viên quản trị.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperadmin) {
      alert('Chỉ Superadmin mới có quyền xóa tài khoản quản trị.');
      return;
    }
    const target = members.find((member) => member.id === id);
    if (target && isProtectedSuperadmin(target)) {
      alert('Không thể xóa hoặc hạ quyền Super Admin duy nhất.');
      return;
    }
    try {
      await deleteAdminMember(id, currentAdminEmail);
      setDeleteConfirmId(null);
      await loadMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Lỗi khi xóa tài khoản.');
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'superadmin':
        return <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold uppercase">Super Admin</span>;
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold uppercase">Admin</span>;
      case 'editor':
        return <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold uppercase">Editor</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Firestore: admins</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            QUẢN LÝ THÀNH VIÊN & PHÂN QUYỀN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân quyền 3 cấp (Superadmin, Admin, Editor) theo quy chuẩn an toàn dữ liệu tuyển sinh
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start xl:self-auto">
          <button
            onClick={loadMembers}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role permission matrix overview card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
          Bảng phân cấp quyền hạn hệ thống (RBAC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
            <div className="font-bold text-purple-900 flex items-center justify-between">
              <span>SUPERADMIN</span>
              <ShieldCheck className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Toàn quyền quản trị hệ thống: Thêm/xóa thành viên, đổi vai trò, quản lý và xóa dữ liệu điểm chuẩn, xem toàn bộ audit logs, cấu hình cài đặt.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="font-bold text-blue-900 flex items-center justify-between">
              <span>ADMIN</span>
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Quản lý nghiệp vụ: Xem dashboard, thêm/sửa/xóa điểm chuẩn, import file Excel/CSV, quản lý danh mục và xem nhật ký hoạt động.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="font-bold text-emerald-900 flex items-center justify-between">
              <span>EDITOR</span>
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cán bộ cập nhật dữ liệu: Chỉnh sửa thông tin điểm chuẩn được phép. Không được xóa bản ghi, không được quản lý thành viên hoặc phân quyền.
            </p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="min-w-40 py-3.5 px-4">HỌ TÊN CÁN BỘ</th>
                <th className="min-w-60 py-3.5 px-4">EMAIL TÀI KHOẢN</th>
                <th className="min-w-28 py-3.5 px-4 text-center">VAI TRÒ</th>
                <th className="min-w-36 py-3.5 px-4 text-center">TRẠNG THÁI</th>
                <th className="min-w-32 py-3.5 px-4">NGÀY CẬP NHẬT</th>
                <th className="sticky right-0 z-10 py-3.5 px-4 text-center w-36 min-w-36 bg-[#f4f7fb]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="min-w-40 whitespace-nowrap py-3.5 px-4 font-bold text-slate-900">{member.name}</td>
                  <td className="min-w-60 whitespace-nowrap py-3.5 px-4 font-mono text-slate-700">{member.email}</td>
                  <td className="py-3.5 px-4 text-center">{getRoleBadge(String(member.role).toLowerCase().replace(/[-\s]+/g, '_') === 'super_admin' ? 'superadmin' : member.role)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {member.status === 'active'
                        ? 'Active'
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(member.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="sticky right-0 z-[1] py-3.5 px-4 text-center bg-white group-hover:bg-slate-50">
                    {isSuperadmin ? (
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setEditingMember({ ...member })}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-50"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        {member.email !== currentAdminEmail && !isProtectedSuperadmin(member) && (
                          <button
                            onClick={() => setDeleteConfirmId(member.id)}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chỉ xem</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[var(--ussh-blue-dark)]">
                {editingMember.id ? 'Cập nhật thông tin cán bộ' : 'Thêm tài khoản quản trị'}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  placeholder="Nhập email tài khoản"
                  required
                />
              </div>

              <div>
                {!editingMember.id && (
                  <>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu *</label>
                    <input
                      type="password"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                      placeholder="Ít nhất 6 ký tự"
                      minLength={6}
                      required
                    />
                  </>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={editingMember.role || 'editor'}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as AdminRole })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    disabled={isProtectedSuperadmin(editingMember)}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái *</label>
                  <select
                    value={editingMember.status || 'pending'}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as AdminMemberDoc['status'] })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                    disabled={isProtectedSuperadmin(editingMember)}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--ussh-blue)] text-white font-bold"
                >
                  {editingMember.id ? 'Lưu thay đổi' : 'Thêm thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Xác nhận thu hồi tài khoản</span>
            </div>
            <p className="text-slate-600">
              Bạn có chắc chắn muốn xóa tài khoản này khỏi danh sách quản trị viên?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
