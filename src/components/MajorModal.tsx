import React, { useState, useEffect } from 'react';
import { Major, AdmissionScoreDoc } from '../types';
import { getAdmissionScoresByMajor } from '../lib/firebase';
import { X, Layers, Calculator, Loader2, Database, AlertCircle } from 'lucide-react';

interface MajorModalProps {
  major: Major | null;
  onClose: () => void;
  onPredictMajor?: (majorId: string) => void;
}

export const MajorModal: React.FC<MajorModalProps> = ({ major, onClose, onPredictMajor }) => {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<AdmissionScoreDoc[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  const majorCode = major ? String(major.code || major.id || '').trim().toUpperCase() : '';

  useEffect(() => {
    if (!major || !majorCode) {
      setScores([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedYearFilter('all');

    // Query Firestore strictly by ma_nganh
    getAdmissionScoresByMajor(majorCode)
      .then((records) => {
        if (isMounted) {
          setScores(records);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching major details from Firestore:', err);
          setError('Không thể tải dữ liệu ngành từ Firestore.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [majorCode]);

  if (!major) return null;

  // Real data extracted strictly from Firestore records
  const realMajorName = scores[0]?.ten_nganh || major.name || 'Chưa có tên ngành';
  const realProgramType = scores[0]?.he_dao_tao || major.programType || 'Chuẩn';

  // Find actual quota from Firestore (e.g. from 2026 or any record containing chi_tieu_du_kien)
  const quotaRecord = scores.find((s) => s.chi_tieu_du_kien != null && s.chi_tieu_du_kien > 0);
  const quotaValue = quotaRecord ? quotaRecord.chi_tieu_du_kien : null;
  const quotaYear = quotaRecord ? quotaRecord.nam : null;

  // Real combinations from Firestore
  const combinations = Array.from(
    new Set(scores.map((s) => s.to_hop).filter(Boolean))
  ) as string[];

  // Real years present in Firestore for this major
  const distinctYears: number[] = Array.from(new Set<number>(scores.map((s) => Number(s.nam))))
    .filter((y: number) => !isNaN(y) && y > 0)
    .sort((a: number, b: number) => b - a);

  // Latest benchmark score from real records with diem_chuan > 0
  const validScores = scores.filter((s) => s.diem_chuan > 0);
  const latestScoreRecord = validScores[0] || null;

  // Filtered score records for display
  const filteredScores = selectedYearFilter === 'all'
    ? scores
    : scores.filter((s) => String(s.nam) === selectedYearFilter);

  return (
    <div
      id="major-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        id="major-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0f2b5c] text-white p-6 relative">
          <button
            id="close-major-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-900 font-bold text-xs">
              Mã ngành: {majorCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
              {realProgramType}
            </span>
            {major.fieldCategoryName && (
              <span className="px-2.5 py-0.5 rounded-md bg-blue-400/30 text-blue-100 text-xs font-medium">
                {major.fieldCategoryName}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">{realMajorName}</h2>
          <div className="flex items-center gap-2 text-blue-200 text-xs mt-1">
            <Database className="w-3.5 h-3.5" />
            <span>Nguồn dữ liệu: Firestore (bộ sưu tập admission_scores)</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[var(--ussh-blue-dark)] animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-600">
                Đang truy vấn dữ liệu thực tế từ Firestore cho mã ngành {majorCode}...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Quick Metrics from Real Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-500 block">Chỉ tiêu tuyển sinh</span>
                  <strong className="text-sm sm:text-base text-slate-900 block mt-0.5">
                    {quotaValue != null ? `${quotaValue} sinh viên` : 'Chưa có dữ liệu'}
                  </strong>
                  {quotaYear && (
                    <span className="text-[11px] text-slate-500">Năm {quotaYear}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Điểm chuẩn gần nhất</span>
                  <strong className="text-sm sm:text-base text-[#0f2b5c] block mt-0.5">
                    {latestScoreRecord
                      ? `${latestScoreRecord.diem_chuan} / ${latestScoreRecord.thang_diem || 100}`
                      : 'Chưa có dữ liệu'}
                  </strong>
                  {latestScoreRecord && (
                    <span className="text-[11px] text-slate-500">
                      Năm {latestScoreRecord.nam} ({latestScoreRecord.ma_pt || latestScoreRecord.doi_tuong || 'PT'})
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Tổ hợp xét tuyển</span>
                  <strong className="text-sm text-slate-900 block mt-0.5 truncate" title={combinations.join(', ')}>
                    {combinations.length > 0 ? combinations.join(', ') : 'Chưa có dữ liệu'}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {combinations.length > 0 ? `${combinations.length} tổ hợp` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Dữ liệu thực tế</span>
                  <strong className="text-sm sm:text-base text-emerald-700 block mt-0.5">
                    {scores.length} bản ghi
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {distinctYears.length > 0 ? `Các năm: ${distinctYears.join(', ')}` : 'Chưa có dữ liệu'}
                  </span>
                </div>
              </div>

              {/* Benchmark Score History Table from Firestore */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-500" />
                    Lịch sử điểm chuẩn thực tế qua các năm ({scores.length} bản ghi Firestore)
                  </h3>

                  {distinctYears.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Lọc theo năm:</span>
                      <select
                        id="filter-year-select"
                        value={selectedYearFilter}
                        onChange={(e) => setSelectedYearFilter(e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-700 text-xs focus:ring-1 focus:ring-[#0f2b5c] outline-hidden"
                      >
                        <option value="all">Tất cả các năm ({distinctYears.join(', ')})</option>
                        {distinctYears.map((y) => (
                          <option key={y} value={String(y)}>
                            Năm {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {scores.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    Chưa có dữ liệu điểm chuẩn cho ngành này trong cơ sở dữ liệu Firestore.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs max-h-[380px]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Năm</th>
                          <th className="py-2.5 px-3">Phương thức / Mã PT</th>
                          <th className="py-2.5 px-3">Đối tượng</th>
                          <th className="py-2.5 px-3">Tổ hợp</th>
                          <th className="py-2.5 px-3">Điểm chuẩn</th>
                          <th className="py-2.5 px-3">Thang điểm</th>
                          <th className="py-2.5 px-3">Chỉ tiêu dự kiến</th>
                          <th className="py-2.5 px-3">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredScores.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-900">{item.nam}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {item.ma_pt || <span className="text-slate-400">Chung</span>}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {item.doi_tuong || <span className="text-slate-400">Tất cả</span>}
                            </td>
                            <td className="py-2 px-3 font-semibold text-blue-700">
                              {item.to_hop || <span className="text-slate-400">-</span>}
                            </td>
                            <td className="py-2 px-3 font-bold text-[#0f2b5c]">
                              {item.diem_chuan > 0 ? (
                                <span>{item.diem_chuan}</span>
                              ) : (
                                <span className="text-slate-400 font-normal">Chưa công bố</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {item.thang_diem || '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-700">
                              {item.chi_tieu_du_kien != null ? (
                                <span className="font-semibold text-emerald-700">{item.chi_tieu_du_kien}</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[11px]">
                              {item.ghi_chu || item.mon_chinh ? (
                                <span>
                                  {item.ghi_chu}
                                  {item.mon_chinh ? ` (Môn chính: ${item.mon_chinh})` : ''}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            id="modal-close-action-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
          {onPredictMajor && (
            <button
              id="modal-predict-action-btn"
              onClick={() => {
                onPredictMajor(majorCode);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#0f2b5c] hover:bg-blue-900 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Dự báo khả năng trúng tuyển ngành này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
