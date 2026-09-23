import React, { useState, useEffect, useMemo } from 'react';
import { getCatalogItems, saveCatalogItem, getAdmissionScores } from '../lib/firebase';
import { CatalogItemDoc, AdminRole, AdmissionScoreDoc } from '../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Check, 
  X, 
  Edit3, 
  CheckCircle2, 
  School, 
  BookOpen, 
  Award,
  RefreshCw
} from 'lucide-react';

interface AdminCatalogsPageProps {
  currentAdminEmail: string;
  currentAdminRole: AdminRole;
}

export const AdminCatalogsPage: React.FC<AdminCatalogsPageProps> = ({
  currentAdminEmail,
  currentAdminRole,
}) => {
  const [catalogs, setCatalogs] = useState<CatalogItemDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'combinations' | 'methods'>('programs');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Partial<CatalogItemDoc> | null>(null);
  const [latestYearRecords, setLatestYearRecords] = useState<AdmissionScoreDoc[]>([]);

  const canEdit = currentAdminRole === 'superadmin' || currentAdminRole === 'admin';

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const [items, scores] = await Promise.all([getCatalogItems(), getAdmissionScores()]);
      setCatalogs(items);
      const latestYear = Math.max(...scores.map((score) => score.nam), 2026);
      setLatestYearRecords(scores.filter((score) => score.nam === latestYear));
    } catch (err) {
      console.error('Error fetching catalogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const dataDrivenCatalogs = useMemo(() => {
    const programs = new Map<string, CatalogItemDoc>();
    const combinations = new Map<string, CatalogItemDoc>();
    const methods = new Map<string, CatalogItemDoc>();
    latestYearRecords.forEach((score) => {
      if (score.he_dao_tao) programs.set(score.he_dao_tao, { id: `program_${score.he_dao_tao}`, code: score.he_dao_tao, name: score.he_dao_tao, catalog_type: 'programs', is_active: true });
      if (score.to_hop) combinations.set(score.to_hop, { id: `combination_${score.to_hop}`, code: score.to_hop, name: score.to_hop, catalog_type: 'combinations', is_active: true });
      const method = score.doi_tuong || score.ma_pt;
      if (method) methods.set(method, { id: `method_${method}`, code: method, name: method, catalog_type: 'methods', is_active: true });
    });
    return [...programs.values(), ...combinations.values(), ...methods.values()];
  }, [latestYearRecords]);

  const displayedCatalogs = latestYearRecords.length > 0 ? dataDrivenCatalogs : catalogs;

  const filteredItems = useMemo(() => {
    return displayedCatalogs.filter((c) => {
      const matchType = c.catalog_type === activeTab;
      const matchSearch = 
        !searchTerm || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [catalogs, displayedCatalogs, activeTab, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !canEdit) return;
    if (!editingItem.code || !editingItem.name) {
      alert('Vui lòng điền đầy đủ Mã danh mục và Tên danh mục.');
      return;
    }

    try {
      await saveCatalogItem({
        ...editingItem,
        catalog_type: activeTab,
      }, currentAdminEmail);
      setEditingItem(null);
      await loadCatalogs();
    } catch (err) {
      console.error('Error saving catalog item:', err);
      alert('Lỗi khi lưu danh mục.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Firestore: catalogs</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            QUẢN LÝ DANH MỤC HỆ THỐNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình danh mục hệ đào tạo, tổ hợp môn thi và phương thức xét tuyển tuyển sinh
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={loadCatalogs}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          {canEdit && (
            <button
              onClick={() => setEditingItem({ code: '', name: '', is_active: true, catalog_type: activeTab })}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mục mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Catalog Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('programs')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'programs'
              ? 'border-[var(--ussh-blue)] text-[var(--ussh-blue-dark)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Hệ đào tạo ({catalogs.filter((c) => c.catalog_type === 'programs').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('combinations')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'combinations'
              ? 'border-[var(--ussh-blue)] text-[var(--ussh-blue-dark)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tổ hợp môn xét tuyển ({catalogs.filter((c) => c.catalog_type === 'combinations').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('methods')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'methods'
              ? 'border-[var(--ussh-blue)] text-[var(--ussh-blue-dark)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Phương thức xét tuyển ({catalogs.filter((c) => c.catalog_type === 'methods').length})</span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm mã hoặc tên danh mục..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                <th className="py-3 px-4 w-40 min-w-40 whitespace-nowrap">MÃ ĐỊNH DANH</th>
                <th className="py-3 px-4">TÊN HIỂN THỊ</th>
                <th className="py-3 px-4 w-32 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-4 w-24 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 w-40 min-w-40 whitespace-nowrap font-mono font-bold text-slate-800">{item.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.is_active ? <CheckCircle2 className="w-3 h-3" /> : null}
                      <span>{item.is_active ? 'Đang kích hoạt' : 'Tạm khóa'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {canEdit && (
                      <button
                        onClick={() => setEditingItem({ ...item })}
                        className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Đang tải danh mục...' : 'Không có mục nào trong danh mục này'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[var(--ussh-blue-dark)]">
                {editingItem.id ? 'Chỉnh sửa mục danh mục' : 'Thêm mục danh mục mới'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã định danh *</label>
                <input
                  type="text"
                  value={editingItem.code || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  placeholder="VD: D01, CHUẨN, PT1..."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên hiển thị *</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  placeholder="VD: Toán, Ngữ văn, Tiếng Anh..."
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="rounded text-[var(--ussh-blue-dark)]"
                  />
                  <span className="font-medium text-slate-700">Kích hoạt và cho phép sử dụng trên hệ thống</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--ussh-blue)] text-white font-bold"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
