import React, { useState, useEffect, useMemo } from 'react';
import { getAuditLogs } from '../lib/firebase';
import { AuditLogDoc } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  FileText,
  RefreshCw 
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !searchTerm ||
        log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.document_id && log.document_id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchAction = selectedAction === 'all' || log.action === selectedAction;
      return matchSearch && matchAction;
    });
  }, [logs, searchTerm, selectedAction]);

  const getActionBadge = (action: AuditLogDoc['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">DELETE</span>;
      case 'IMPORT':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">IMPORT</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">LOGIN</span>;
      case 'ROLE_CHANGE':
        return <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold">ROLE_CHANGE</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <History className="w-4 h-4 text-blue-700" />
            <span>Firestore: audit_logs</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử kiểm toán các thao tác thêm, sửa, xóa, nhập dữ liệu và phiên đăng nhập của quản trị viên
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo email, chi tiết thao tác hoặc ID bản ghi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Tạo mới (CREATE)</option>
            <option value="UPDATE">Cập nhật (UPDATE)</option>
            <option value="DELETE">Xóa (DELETE)</option>
            <option value="IMPORT">Nhập dữ liệu (IMPORT)</option>
            <option value="LOGIN">Đăng nhập (LOGIN)</option>
            <option value="ROLE_CHANGE">Đổi quyền (ROLE_CHANGE)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-36">THỜI GIAN</th>
                <th className="py-3 px-4 w-44">NGƯỜI THỰC HIỆN</th>
                <th className="py-3 px-4 w-28 text-center">HÀNH ĐỘNG</th>
                <th className="py-3 px-4 w-32">BỘ SƯU TẬP</th>
                <th className="py-3 px-4">CHI TIẾT THAO TÁC</th>
                <th className="py-3 px-4 w-24 text-center">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 truncate max-w-[160px]">
                    {log.admin_email}
                  </td>
                  <td className="py-3 px-4 text-center">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {log.collection_name}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{log.details}</div>
                    {log.document_id && (
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                        ID: {log.document_id}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Đang tải nhật ký...' : 'Chưa có nhật ký hoạt động nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
