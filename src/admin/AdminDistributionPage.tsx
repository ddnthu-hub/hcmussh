import React, { useEffect, useMemo, useState } from 'react';
import { Check, Edit3, Filter, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { AdminRole } from '../types';
import {
  UserScoreRecord,
  createManagedUserScoreDistribution,
  deleteManagedUserScoreDistribution,
  getManagedUserScoreDistribution,
  updateManagedUserScoreDistribution,
} from '../lib/userScoreDistribution';

interface AdminDistributionPageProps {
  currentAdminEmail: string;
  currentAdminRole: AdminRole;
}

type DistributionForm = Omit<UserScoreRecord, 'id' | 'createdAt' | 'userId' | 'approvedAt' | 'approvedBy'>;

const emptyForm: DistributionForm = {
  userAdmissionScore: 0,
  year: 2026,
  majorCode: '',
  majorName: '',
  admissionForm: '',
  programType: '',
  combination: '',
  approved: false,
};

export const AdminDistributionPage: React.FC<AdminDistributionPageProps> = ({ currentAdminEmail, currentAdminRole }) => {
  const [records, setRecords] = useState<UserScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [approval, setApproval] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<UserScoreRecord | null>(null);
  const [form, setForm] = useState<DistributionForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const rowsPerPage = 12;
  const canEdit = currentAdminRole === 'superadmin' || currentAdminRole === 'admin' || currentAdminRole === 'editor';
  const canDelete = currentAdminRole === 'superadmin' || currentAdminRole === 'admin';

  const loadRecords = async () => {
    setLoading(true);
    setRecords(await getManagedUserScoreDistribution(true));
    setLoading(false);
  };

  useEffect(() => { loadRecords(); }, []);

  const years = useMemo(() => Array.from(new Set<number>(records.map((record) => Number(record.year)))).sort((a: number, b: number) => b - a), [records]);
  const filtered = useMemo(() => records.filter((record) => {
    const haystack = `${record.majorCode || ''} ${record.majorName || ''} ${record.admissionForm || ''} ${record.programType || ''} ${record.combination || ''}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase()))
      && (year === 'all' || String(record.year) === year)
      && (approval === 'all' || (approval === 'approved' ? record.approved === true : record.approved !== true));
  }), [records, search, year, approval]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const visible = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setIsFormOpen(true); };
  const openEdit = (record: UserScoreRecord) => {
    setEditing(record);
    setIsFormOpen(true);
    setForm({
      userAdmissionScore: record.userAdmissionScore,
      year: record.year,
      majorCode: record.majorCode || '',
      majorName: record.majorName || '',
      admissionForm: record.admissionForm || '',
      programType: record.programType || '',
      combination: record.combination || '',
      approved: record.approved === true,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    const duplicate = records.some((record) => record.id !== editing?.id
      && record.year === Number(form.year)
      && record.majorCode === String(form.majorCode || '').trim()
      && record.admissionForm === String(form.admissionForm || '').trim()
      && record.programType === String(form.programType || '').trim()
      && record.combination === String(form.combination || '').trim()
      && record.userAdmissionScore === Number(form.userAdmissionScore));
    if (duplicate) {
      window.alert('Bản ghi trùng năm, ngành, phương thức, hệ, tổ hợp và điểm.');
      return;
    }
    if (editing?.id) await updateManagedUserScoreDistribution(editing.id, form, currentAdminEmail);
    else await createManagedUserScoreDistribution(form);
    setEditing(null);
    setIsFormOpen(false);
    await loadRecords();
  };

  const remove = async () => {
    if (!deleteId || !canDelete) return;
    await deleteManagedUserScoreDistribution(deleteId);
    setDeleteId(null);
    await loadRecords();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8f1d2c]"><Filter className="h-4 w-4" /> Collection: user_score_distribution</div>
          <h1 className="mt-1 text-xl font-bold text-[#0b2a4a]">Quản trị dữ liệu phân bố điểm</h1>
          <p className="mt-1 text-xs text-slate-500">Dữ liệu riêng cho biểu đồ phân bố, không phải admission_scores và không ảnh hưởng điểm chuẩn.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadRecords} className="rounded-xl border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-50"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /></button>
          {canEdit && <button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-[#123b69] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0b2a4a]"><Plus className="h-4 w-4" />Thêm dữ liệu</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3">
        <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm ngành, mã ngành, phương thức..." className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        <select value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs"><option value="all">Tất cả năm</option>{years.map((item) => <option key={item} value={item}>Năm {item}</option>)}</select>
        <select value={approval} onChange={(event) => { setApproval(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs"><option value="all">Tất cả trạng thái</option><option value="approved">Đã duyệt</option><option value="pending">Chờ duyệt</option></select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#f4f7fb] text-[11px] font-bold uppercase text-slate-700"><tr><th className="p-3">Năm</th><th className="p-3">Ngành</th><th className="p-3">Phương thức / Hệ</th><th className="p-3">Tổ hợp</th><th className="p-3 text-right">Điểm</th><th className="p-3">Trạng thái</th><th className="p-3 text-center">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">
          {visible.map((record) => <tr key={record.id} className="hover:bg-blue-50/30"><td className="p-3 font-semibold">{record.year}</td><td className="p-3"><strong>{record.majorName || 'Chưa cập nhật'}</strong><span className="block font-mono text-[11px] text-slate-500">{record.majorCode || '—'}</span></td><td className="p-3 text-slate-600">{record.admissionForm || '—'}<span className="block text-[11px]">{record.programType || '—'}</span></td><td className="p-3 font-mono">{record.combination || '—'}</td><td className="p-3 text-right font-bold text-[#8f1d2c]">{record.userAdmissionScore.toFixed(2)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${record.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{record.approved ? 'Đã duyệt' : 'Chờ duyệt'}</span></td><td className="p-3 text-center"><div className="flex justify-center gap-1">{canEdit && <button type="button" onClick={() => openEdit(record)} className="rounded p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-700" title="Sửa"><Edit3 className="h-3.5 w-3.5" /></button>}{canDelete && <button type="button" onClick={() => setDeleteId(record.id || null)} className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-[#8f1d2c]" title="Xóa"><Trash2 className="h-3.5 w-3.5" /></button>}</div></td></tr>)}
          {!visible.length && <tr><td colSpan={7} className="p-10 text-center text-slate-400">{loading ? 'Đang tải...' : 'Chưa có dữ liệu phù hợp.'}</td></tr>}
        </tbody></table></div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} scrollTargetId="admin-distribution-table" totalRecords={filtered.length} startIndex={(page - 1) * rowsPerPage} endIndex={Math.min(page * rowsPerPage, filtered.length)} />
      </div>

      {isFormOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={save} className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-base font-bold text-[#0b2a4a]">{editing ? 'Chỉnh sửa dữ liệu phân bố' : 'Thêm dữ liệu phân bố'}</h2><button type="button" onClick={() => { setEditing(null); setIsFormOpen(false); }}><X className="h-5 w-5 text-slate-400" /></button></div><div className="grid grid-cols-2 gap-3 text-xs"><label>Điểm<input required type="number" min="0" max="100" step="0.01" value={form.userAdmissionScore} onChange={(event) => setForm({ ...form, userAdmissionScore: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Năm<input required type="number" value={form.year} onChange={(event) => setForm({ ...form, year: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Mã ngành<input value={form.majorCode} onChange={(event) => setForm({ ...form, majorCode: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Tên ngành<input value={form.majorName} onChange={(event) => setForm({ ...form, majorName: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Phương thức<input value={form.admissionForm} onChange={(event) => setForm({ ...form, admissionForm: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Hệ đào tạo<input value={form.programType} onChange={(event) => setForm({ ...form, programType: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label className="col-span-2">Tổ hợp<input value={form.combination} onChange={(event) => setForm({ ...form, combination: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label></div><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.approved === true} onChange={(event) => setForm({ ...form, approved: event.target.checked })} />Duyệt để hiển thị cho người dùng</label><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditing(null); setIsFormOpen(false); }} className="rounded-lg border px-4 py-2 text-xs font-bold">Hủy</button><button type="submit" className="rounded-lg bg-[#123b69] px-4 py-2 text-xs font-bold text-white">Lưu</button></div></form></div> : null}
      {deleteId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl"><h2 className="font-bold text-[#8f1d2c]">Xác nhận xóa dữ liệu?</h2><p className="text-xs text-slate-600">Bản ghi sẽ bị xóa khỏi user_score_distribution và không thể khôi phục.</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="rounded-lg border px-4 py-2 text-xs font-bold">Hủy</button><button type="button" onClick={remove} className="rounded-lg bg-[#8f1d2c] px-4 py-2 text-xs font-bold text-white">Xóa</button></div></div></div>}
    </div>
  );
};
