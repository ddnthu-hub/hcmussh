import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { batchImportAdmissionScores } from '../lib/firebase';
import { AdmissionScoreDoc, ValidationIssue, AdminRole } from '../types';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface AdminImportPageProps {
  currentAdminEmail: string;
  currentAdminRole: AdminRole;
}

export const AdminImportPage: React.FC<AdminImportPageProps> = ({
  currentAdminEmail,
  currentAdminRole,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validRecords, setValidRecords] = useState<Omit<AdmissionScoreDoc, 'id'>[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ success: number; failure: number } | null>(null);

  const canImport = currentAdminRole === 'superadmin' || currentAdminRole === 'admin';

  // Step 1 & 2: Handle File Reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        setParsedRows(rawData);
        validateImportData(rawData);
        setCurrentStep(2);
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Không thể đọc file. Vui lòng kiểm tra định dạng file Excel (.xlsx, .xls) hoặc CSV.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Step 3 & 4: Rigorous Validation matching Part I
  const validateImportData = (rows: any[]) => {
    const foundIssues: ValidationIssue[] = [];
    const valids: Omit<AdmissionScoreDoc, 'id'>[] = [];

    if (rows.length === 0) {
      foundIssues.push({
        row: 0,
        field: 'file',
        value: 'Trống',
        reason: 'File không có dòng dữ liệu nào',
        type: 'format',
      });
    }

    rows.forEach((row, index) => {
      const rowNum = index + 2; // header is row 1, index 0 is row 2
      let hasError = false;

      // Validate Year
      const year = Number(row.nam || row.year);
      if (!year || isNaN(year) || year < 2000 || year > 2035) {
        foundIssues.push({
          row: rowNum,
          field: 'nam',
          value: row.nam,
          reason: 'Năm tuyển sinh không hợp lệ (phải từ 2000 đến 2035)',
          type: 'validation',
        });
        hasError = true;
      }

      // Validate Major Code
      const majorCode = String(row.ma_nganh || row.major_code || '').trim();
      if (!majorCode || majorCode.length < 4) {
        foundIssues.push({
          row: rowNum,
          field: 'ma_nganh',
          value: row.ma_nganh,
          reason: 'Mã ngành đào tạo không được để trống (tối thiểu 4 ký tự)',
          type: 'validation',
        });
        hasError = true;
      }

      // Validate Major Name
      const majorName = String(row.ten_nganh || row.major_name || '').trim();
      if (!majorName) {
        foundIssues.push({
          row: rowNum,
          field: 'ten_nganh',
          value: row.ten_nganh,
          reason: 'Tên ngành không được để trống',
          type: 'validation',
        });
        hasError = true;
      }

      // Validate Combination
      const comb = String(row.to_hop || row.combination || '').trim();
      if (!comb) {
        foundIssues.push({
          row: rowNum,
          field: 'to_hop',
          value: row.to_hop,
          reason: 'Tổ hợp môn xét tuyển không được để trống (ví dụ: D01, C00)',
          type: 'validation',
        });
        hasError = true;
      }

      // Validate Benchmark Score
      const scoreRaw = row.diem_chuan ?? row.score;
      const score = parseFloat(scoreRaw);
      if (scoreRaw === '' || isNaN(score) || score <= 0) {
        foundIssues.push({
          row: rowNum,
          field: 'diem_chuan',
          value: scoreRaw,
          reason: 'Điểm chuẩn không phải là số hợp lệ hoặc nhỏ hơn/bằng 0',
          type: 'validation',
        });
        hasError = true;
      }

      // Validate Scale: prefer the file's explicit scale, then infer common USSH scales.
      const explicitScale = Number(row.thang_diem);
      const scale = Number.isFinite(explicitScale) && explicitScale > 0
        ? explicitScale
        : score > 100
          ? 1200
          : score > 30
            ? 100
            : 30;
      if (score > scale) {
        foundIssues.push({
          row: rowNum,
          field: 'diem_chuan',
          value: score,
          reason: `Điểm chuẩn (${score}) lớn hơn thang điểm quy định (${scale})`,
          type: 'validation',
        });
        hasError = true;
      }

      if (!hasError) {
        valids.push({
          nam: year,
          ma_nganh: majorCode,
          ten_nganh: majorName,
          he_dao_tao: String(row.he_dao_tao || 'Chương trình chuẩn').trim(),
          ma_pt: String(row.ma_pt || 'PT1_THPT').trim(),
          doi_tuong: String(row.doi_tuong || 'Thí sinh toàn quốc').trim(),
          to_hop: comb.toUpperCase(),
          diem_chuan: score,
          chi_tieu_du_kien: Number(row.chi_tieu_du_kien) || 0,
          thang_diem: scale,
          ghi_chu: String(row.ghi_chu || ''),
        });
      }
    });

    setIssues(foundIssues);
    setValidRecords(valids);
  };

  // Step 6 & 7: Execute Import
  const handleExecuteImport = async () => {
    if (!canImport) {
      alert('Bạn không có quyền thực hiện chức năng Nhập dữ liệu (Yêu cầu vai trò Superadmin hoặc Admin).');
      return;
    }

    if (validRecords.length === 0) {
      alert('Không có bản ghi hợp lệ nào để import.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await batchImportAdmissionScores(validRecords, currentAdminEmail);
      setImportResult({
        success: result.successCount,
        failure: result.failureCount + issues.length,
      });
      setCurrentStep(4);
    } catch (err: any) {
      console.error('Import error:', err);
      alert('Lỗi trong quá trình import: ' + (err?.message || 'Lỗi kết nối hoặc quyền truy cập.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFileName('');
    setFileSize('');
    setParsedRows([]);
    setValidRecords([]);
    setIssues([]);
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            <span>Quy trình nhập dữ liệu chuẩn hóa USSH</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            NHẬP DỮ LIỆU
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ file Excel (.xlsx, .xls) và CSV. Kiểm tra cú pháp và validate tự động trước khi ghi vào Firestore.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          <div className={`p-2.5 rounded-xl border transition-all ${
            currentStep >= 1 ? 'border-blue-700 bg-blue-50 text-[var(--ussh-blue-dark)] font-bold' : 'border-slate-200 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase">Bước 1</span>
            Chọn & Đọc file
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${
            currentStep >= 2 ? 'border-blue-700 bg-blue-50 text-[var(--ussh-blue-dark)] font-bold' : 'border-slate-200 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase">Bước 2</span>
            Preview & Validate
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${
            currentStep >= 3 ? 'border-blue-700 bg-blue-50 text-[var(--ussh-blue-dark)] font-bold' : 'border-slate-200 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase">Bước 3</span>
            Xác nhận nhập
          </div>
          <div className={`p-2.5 rounded-xl border transition-all ${
            currentStep === 4 ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase">Bước 4</span>
            Kết quả Import
          </div>
        </div>
      </div>

      {/* STEP 1: Upload File */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="max-w-md mx-auto border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 transition-colors bg-slate-50/50">
            <UploadCloud className="w-12 h-12 text-[var(--ussh-blue-dark)] mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Kéo thả file vào đây hoặc bấm để duyệt</h3>
            <p className="text-xs text-slate-500 mt-1">Định dạng hỗ trợ: Excel (.xlsx, .xls) hoặc CSV (tối đa 10MB)</p>

            <label className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
              <span>Chọn file từ máy tính</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="max-w-md mx-auto text-left text-xs text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-1">
            <strong className="text-blue-900 block font-semibold">Các cột tiêu chuẩn trong file:</strong>
            <p className="font-mono text-[11px] text-slate-700">
              nam, ma_nganh, ten_nganh, he_dao_tao, to_hop, diem_chuan, thang_diem, ma_pt, doi_tuong, ghi_chu
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Validate with explicit error list (Part I) */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* File summary and controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">{fileName} ({fileSize})</h4>
                <div className="text-[11px] text-slate-500 mt-0.5 space-x-3">
                  <span>Tổng: <strong>{parsedRows.length}</strong> dòng</span>
                  <span className="text-emerald-700 font-semibold">Hợp lệ: <strong>{validRecords.length}</strong></span>
                  {issues.length > 0 && (
                    <span className="text-rose-700 font-semibold">Lỗi: <strong>{issues.length}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy & Chọn file khác
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={validRecords.length === 0}
                className="px-4 py-2 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Tiếp tục xác nhận ({validRecords.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Validation Issues Table (Part I: Báo lỗi rõ dòng, field, value, lý do) */}
          {issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-rose-50/80 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Phát hiện {issues.length} vấn đề cần lưu ý (Dữ liệu lỗi sẽ không được import)</span>
                </div>
                <span className="text-[11px] text-rose-700 font-semibold">Chỉ rõ theo Part I</span>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rose-50/40 text-[11px] font-bold text-rose-900 border-b border-rose-100">
                      <th className="py-2.5 px-4 w-20">DÒNG</th>
                      <th className="py-2.5 px-4 w-32">CỘT / FIELD</th>
                      <th className="py-2.5 px-4 w-36">GIÁ TRỊ</th>
                      <th className="py-2.5 px-4">LÝ DO LỖI</th>
                      <th className="py-2.5 px-4 w-28 text-right">PHÂN LOẠI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {issues.map((issue, i) => (
                      <tr key={i} className="hover:bg-rose-50/30">
                        <td className="py-2 px-4 font-bold text-rose-900">Dòng {issue.row}</td>
                        <td className="py-2 px-4 font-mono font-semibold text-slate-800">{issue.field}</td>
                        <td className="py-2 px-4 font-mono text-slate-600 bg-rose-50/30 rounded px-1 max-w-[120px] truncate">
                          {String(issue.value || '(Trống)')}
                        </td>
                        <td className="py-2 px-4 text-rose-700 font-medium">{issue.reason}</td>
                        <td className="py-2 px-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                            {issue.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valid Records Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#f4f7fb] border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Xem trước {validRecords.length} bản ghi hợp lệ sẵn sàng nạp vào Firestore</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Đã kiểm tra tính hợp lệ</span>
            </div>

            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <th className="py-2 px-3 w-16">NĂM</th>
                    <th className="py-2 px-3 w-24">MÃ NGÀNH</th>
                    <th className="py-2 px-3">TÊN NGÀNH</th>
                    <th className="py-2 px-3">HỆ ĐÀO TẠO</th>
                    <th className="py-2 px-3 text-center">TỔ HỢP</th>
                    <th className="py-2 px-3 text-right">ĐIỂM CHUẨN</th>
                    <th className="py-2 px-3 text-right">THANG ĐIỂM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validRecords.slice(0, 50).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-600">{r.nam}</td>
                      <td className="py-2 px-3 font-mono font-medium">{r.ma_nganh}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.ten_nganh}</td>
                      <td className="py-2 px-3 text-slate-600">{r.he_dao_tao}</td>
                      <td className="py-2 px-3 text-center font-mono font-semibold">{r.to_hop}</td>
                      <td className="py-2 px-3 text-right font-bold text-[var(--ussh-red)]">{r.diem_chuan.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-slate-500">/{r.thang_diem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validRecords.length > 50 && (
              <div className="p-2 text-center text-slate-400 text-[11px] border-t border-slate-100">
                Hiển thị trước 50 bản ghi đầu tiên trong số {validRecords.length} bản ghi hợp lệ...
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Confirm Import */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5 text-xs">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-[var(--ussh-blue-dark)]">Xác nhận ghi dữ liệu vào Firestore</h3>
            <p className="text-slate-500">Vui lòng rà soát lại thông tin trước khi áp dụng thay đổi</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Tên file nguồn:</span>
              <strong className="text-slate-800">{fileName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Collection đích:</span>
              <strong className="font-mono text-blue-900">admission_scores</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Số bản ghi hợp lệ sẽ nạp:</span>
              <strong className="text-emerald-700 text-sm font-bold">{validRecords.length} bản ghi</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Số bản ghi bị loại bỏ do lỗi:</span>
              <strong className="text-rose-700 font-bold">{issues.length} bản ghi</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tài khoản thực hiện:</span>
              <strong className="text-slate-800">{currentAdminEmail}</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <strong>Lưu ý:</strong> Hành động này sẽ tạo mới các bản ghi điểm chuẩn và lưu lịch sử vào bộ sưu tập `audit_logs` của hệ thống.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Quay lại kiểm tra
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white font-bold transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang nhập dữ liệu...</span>
                </>
              ) : (
                <span>Tiến hành Import ({validRecords.length} bản ghi)</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Import Results (Part I) */}
      {currentStep === 4 && importResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-[var(--ussh-blue-dark)]">Hoàn Tất Quá Trình Nhập Dữ Liệu!</h3>
          <p className="text-xs text-slate-600">
            Dữ liệu đã được nạp thành công vào hệ thống tuyển sinh và ghi nhận vào nhật ký hoạt động.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs py-2">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block">Thành công</span>
              <strong className="text-xl font-bold text-emerald-700">{importResult.success}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-600 block">Lỗi / Bỏ qua</span>
              <strong className="text-xl font-bold text-slate-700">{importResult.failure}</strong>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Nhập tiếp file khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
