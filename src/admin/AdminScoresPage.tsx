import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAdmissionScores, 
  saveAdmissionScore, 
  deleteAdmissionScore 
} from '../lib/firebase';
import { AdmissionScoreDoc, AdminRole } from '../types';
import { Pagination } from '../components/Pagination';
import { formatMethod2023_2025, formatTrainingType, normalizeDoiTuong2026 } from '../pages/ScoreLookupPage';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface AdminScoresPageProps {
  currentAdminEmail: string;
  currentAdminRole: AdminRole;
}

export const AdminScoresPage: React.FC<AdminScoresPageProps> = ({
  currentAdminEmail,
  currentAdminRole,
}) => {
  const [scores, setScores] = useState<AdmissionScoreDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedCombination, setSelectedCombination] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Modals state
  const [editingRecord, setEditingRecord] = useState<Partial<AdmissionScoreDoc> | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const canDelete = currentAdminRole === 'superadmin' || currentAdminRole === 'admin';
  const canEdit = currentAdminRole === 'superadmin' || currentAdminRole === 'admin' || currentAdminRole === 'editor';

  const loadScores = async (force = false) => {
    setLoading(true);
    try {
      const data = await getAdmissionScores(force);
      setScores(data);
    } catch (err) {
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  // Filtered scores
  const filteredScores = useMemo(() => {
    return scores.filter((s) => {
      const matchSearch = 
        !searchTerm ||
        s.ten_nganh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ma_nganh.toLowerCase().includes(searchTerm.toLowerCase());

      const matchYear = selectedYear === 'all' || s.nam.toString() === selectedYear;
      const program = formatTrainingType(s.he_dao_tao);
      const method = s.nam === 2026 ? normalizeDoiTuong2026(s.doi_tuong) : formatMethod2023_2025(s.ma_pt);
      const combination = s.to_hop && s.to_hop.trim().toUpperCase() !== 'ĐGNL' ? s.to_hop.trim() : '';
      const matchProgram = selectedProgram === 'all' || program === selectedProgram;
      const matchMethod = selectedMethod === 'all' || method === selectedMethod;
      const matchComb = selectedCombination === 'all' || combination === selectedCombination;

      return matchSearch && matchYear && matchProgram && matchMethod && matchComb;
    });
  }, [scores, searchTerm, selectedYear, selectedProgram, selectedMethod, selectedCombination]);

  // Unique options for filters
  const yearOptions = useMemo(() => [2026, 2025, 2024, 2023].filter((year) => scores.some((score) => Number(score.nam) === year)), [scores]);
  const programOptions = useMemo(() => Array.from(new Set(scores.map((s) => formatTrainingType(s.he_dao_tao))).values()).sort(), [scores]);
  const methodOptions = useMemo(() => Array.from(new Set(scores.map((s) => s.nam === 2026 ? normalizeDoiTuong2026(s.doi_tuong) : formatMethod2023_2025(s.ma_pt)))).sort(), [scores]);
  const combinationOptions = useMemo(() => Array.from(new Set(scores.map((s) => s.to_hop?.trim()).filter((value): value is string => Boolean(value) && value.toUpperCase() !== 'ĐGNL'))).sort(), [scores]);

  // Pagination
  const totalPages = Math.ceil(filteredScores.length / rowsPerPage) || 1;
  const currentRecords = filteredScores.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !canEdit) return;

    if (!editingRecord.ma_nganh || !editingRecord.ten_nganh || editingRecord.diem_chuan === undefined) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Mã ngành, Tên ngành, Điểm chuẩn.');
      return;
    }

    try {
      setSaveStatus('Đang lưu...');
      await saveAdmissionScore(editingRecord, currentAdminEmail);
      setSaveStatus('Đã lưu thành công!');
      setTimeout(() => {
        setSaveStatus(null);
        setEditingRecord(null);
        setIsNewRecord(false);
      }, 700);
      await loadScores(true);
    } catch (err) {
      console.error(err);
      setSaveStatus('Lỗi khi lưu dữ liệu');
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa bản ghi (Yêu cầu vai trò Superadmin hoặc Admin).');
      return;
    }
    const target = scores.find((s) => s.id === id);
    const label = target ? `${target.ten_nganh} (${target.to_hop}) - ${target.nam}` : id;
    try {
      await deleteAdmissionScore(id, currentAdminEmail, label);
      setDeleteConfirmId(null);
      await loadScores(true);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa bản ghi');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="sticky top-16 z-30 self-start w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            <span>Firestore: admission_scores</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            QUẢN LÝ ĐIỂM CHUẨN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem, tìm kiếm, chỉnh sửa và cập nhật dữ liệu điểm chuẩn chính thức
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => loadScores(true)}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setEditingRecord({
                  nam: 2026,
                  ma_nganh: '',
                  ten_nganh: '',
                  he_dao_tao: 'Chương trình chuẩn',
                  ma_pt: 'PT1_THPT',
                  doi_tuong: 'Thí sinh tự do & học sinh lớp 12',
                  to_hop: 'D01',
                  diem_chuan: 25.0,
                  chi_tieu_du_kien: 50,
                  thang_diem: 30,
                  ghi_chu: '',
                });
                setIsNewRecord(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bản ghi mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row matching Part H */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm theo mã ngành, tên ngành..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[var(--ussh-blue)] focus:ring-1 focus:ring-[var(--ussh-blue)]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Lọc theo năm */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium bg-white"
            >
              <option value="all">Tất cả năm</option>
              {yearOptions.map((y) => (
                <option key={y} value={y.toString()}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo hệ đào tạo */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hệ đào tạo</label>
            <select
              value={selectedProgram}
              onChange={(e) => { setSelectedProgram(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium bg-white"
            >
              <option value="all">Tất cả hệ đào tạo</option>
              {programOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo hình thức xét tuyển */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hình thức xét tuyển</label>
            <select
              value={selectedMethod}
              onChange={(e) => { setSelectedMethod(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium bg-white"
            >
              <option value="all">Tất cả hình thức</option>
              {methodOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo tổ hợp */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tổ hợp xét tuyển</label>
            <select
              value={selectedCombination}
              onChange={(e) => { setSelectedCombination(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium bg-white"
            >
              <option value="all">Tất cả tổ hợp</option>
              {combinationOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Hiển thị <strong>{filteredScores.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredScores.length)}</strong> trong <strong>{filteredScores.length}</strong> bản ghi
        </span>
        <span>Trang {currentPage} / {totalPages}</span>
      </div>

      {/* Table of Admission Scores */}
      <div id="admin-scores-table-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-16">NĂM</th>
                <th className="py-3 px-3.5 w-32 min-w-32 whitespace-nowrap">MÃ NGÀNH</th>
                <th className="py-3 px-3.5">TÊN NGÀNH</th>
                <th className="py-3 px-3.5">HỆ ĐÀO TẠO</th>
                <th className="py-3 px-3.5 text-center">TỔ HỢP</th>
                <th className="py-3 px-3.5 text-right">ĐIỂM CHUẨN</th>
                <th className="py-3 px-3.5 text-center w-28">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentRecords.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3.5 text-slate-600 font-semibold">{item.nam}</td>
                  <td className="py-3 px-3.5 w-32 min-w-32 whitespace-nowrap font-mono text-slate-700">{item.ma_nganh}</td>
                  <td className="py-3 px-3.5 font-bold text-slate-900">{item.ten_nganh}</td>
                  <td className="py-3 px-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] border border-slate-200">
                      {formatTrainingType(item.he_dao_tao)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">{item.to_hop}</td>
                  <td className="py-3 px-3.5 text-right font-bold text-[var(--ussh-red)] text-sm">
                    {item.diem_chuan.toFixed(2)}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingRecord({ ...item });
                            setIsNewRecord(false);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-slate-100"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Đang tải dữ liệu từ Firestore...' : 'Chưa có dữ liệu bản ghi điểm chuẩn nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          scrollTargetId="admin-scores-table-container"
          totalRecords={filteredScores.length}
          startIndex={(currentPage - 1) * rowsPerPage}
          endIndex={currentPage * rowsPerPage}
        />
      </div>

      {/* Edit / Add Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[var(--ussh-blue-dark)]">
                {isNewRecord ? 'Thêm mới bản ghi điểm chuẩn' : 'Chỉnh sửa bản ghi điểm chuẩn'}
              </h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm tuyển sinh *</label>
                  <input
                    type="number"
                    value={editingRecord.nam || 2026}
                    onChange={(e) => setEditingRecord({ ...editingRecord, nam: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã ngành *</label>
                  <input
                    type="text"
                    value={editingRecord.ma_nganh || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ma_nganh: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên ngành đào tạo *</label>
                <input
                  type="text"
                  value={editingRecord.ten_nganh || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, ten_nganh: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hệ đào tạo</label>
                  <select
                    value={editingRecord.he_dao_tao || 'Chương trình chuẩn'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, he_dao_tao: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Chương trình chuẩn">Chương trình chuẩn</option>
                    <option value="Chất lượng cao">Chất lượng cao</option>
                    <option value="Cử nhân quốc tế">Cử nhân quốc tế</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ hợp môn</label>
                  <input
                    type="text"
                    value={editingRecord.to_hop || 'D01'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, to_hop: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                    placeholder="D01, C00, D14..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm chuẩn *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingRecord.diem_chuan ?? ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, diem_chuan: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-rose-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thang điểm</label>
                  <select
                    value={editingRecord.thang_diem || 30}
                    onChange={(e) => setEditingRecord({ ...editingRecord, thang_diem: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={30}>30 điểm</option>
                    <option value={100}>100 điểm</option>
                    <option value={1200}>1200 điểm</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu</label>
                  <input
                    type="number"
                    value={editingRecord.chi_tieu_du_kien || 50}
                    onChange={(e) => setEditingRecord({ ...editingRecord, chi_tieu_du_kien: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã phương thức</label>
                  <input
                    type="text"
                    value={editingRecord.ma_pt || 'PT1_THPT'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ma_pt: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đối tượng tuyển sinh</label>
                  <input
                    type="text"
                    value={editingRecord.doi_tuong || 'Thí sinh toàn quốc'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, doi_tuong: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={editingRecord.ghi_chu || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, ghi_chu: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="Điều kiện phụ, quy đổi chứng chỉ..."
                />
              </div>

              {saveStatus && (
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold">
                  {saveStatus}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white font-bold"
                >
                  Lưu bản ghi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Xác nhận xóa bản ghi</span>
            </div>
            <p className="text-slate-600">
              Bạn có chắc chắn muốn xóa bản ghi này khỏi cơ sở dữ liệu `admission_scores`? Hành động này sẽ được ghi vào nhật ký kiểm toán (audit_logs).
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
