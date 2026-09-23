import React, { useState, useEffect } from 'react';
import { isFirebaseConfigured, getFirestoreConnectionInfo, subscribeFirestoreStatus, FirestoreStatusInfo } from '../lib/firebase';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Server,
  Cloud
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreStatusInfo>(getFirestoreConnectionInfo());

  useEffect(() => {
    const unsub = subscribeFirestoreStatus((st) => setFirestoreStatus(st));
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
          <Settings className="w-4 h-4 text-blue-700" />
          <span>Hệ thống tuyển sinh & Cơ sở hạ tầng</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
          CÀI ĐẶT & CẤU HÌNH HỆ THỐNG
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Trạng thái kết nối Firestore, thông tin dự án usshwebsite và tham số thuật toán tuyển sinh
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Left Column: System & Infrastructure Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <h2 className="font-bold text-sm text-[var(--ussh-blue-dark)] flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-4 h-4 text-blue-700" />
              Trạng thái hạ tầng Cloud Firestore
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Kết nối Firebase / Firestore</div>
                  <div className="text-[11px] text-slate-500">
                    Dự án: <strong className="font-mono text-slate-800">{firestoreStatus.projectId}</strong> | Cơ sở dữ liệu: <strong className="font-mono text-slate-800">{firestoreStatus.databaseId}</strong>
                  </div>
                </div>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ONLINE (CONNECTED)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Bộ sưu tập chính (admission_scores)</div>
                  <div className="text-[11px] text-slate-500">
                    Đã tải thành công <strong>{firestoreStatus.docCount.toLocaleString('vi-VN')} tài liệu</strong> từ Firestore
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono text-[11px] font-bold border border-blue-200">
                  {firestoreStatus.docCount} docs
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Bảo mật thông tin & Khóa API</div>
                  <div className="text-[11px] text-slate-500">
                    Tuân thủ quy chuẩn: Security Rules bảo vệ bộ sưu tập, khóa API an toàn.
                  </div>
                </div>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Phiên bản cổng tuyển sinh</div>
                  <div className="text-[11px] text-slate-500 font-mono">v2.6.4-academic-ussh (Firestore integration)</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                  2026.1
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h2 className="font-bold text-sm text-[var(--ussh-blue-dark)] flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-blue-700" />
              Bộ sưu tập Firestore đang quản lý
            </h2>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-between">
                <span>📁 admission_scores</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">{firestoreStatus.docCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                📁 prediction_logs
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                📁 audit_logs
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                📁 admins
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                📁 catalogs
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                📁 page_views
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
