import React, { useState, useEffect, useMemo } from 'react';
import { getAdminMembers, getAuditLogs, resolveAuditActorName } from '../lib/firebase';
import { AdminMemberDoc, AuditLogDoc } from '../types';
import { Pagination } from '../components/Pagination';
import { 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);
  const [members, setMembers] = useState<AdminMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [data, memberList] = await Promise.all([getAuditLogs(), getAdminMembers()]);
      setLogs(data);
      setMembers(memberList);
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

      const logDate = new Date(log.timestamp).getTime();
      const startOfDay = (value: string) => new Date(`${value}T00:00:00`).getTime();
      const endOfDay = (value: string) => new Date(`${value}T23:59:59.999`).getTime();

      const matchDateFrom = !dateFrom || logDate >= startOfDay(dateFrom);
      const matchDateTo = !dateTo || logDate <= endOfDay(dateTo);

      return matchSearch && matchAction && matchDateFrom && matchDateTo;
    });
  }, [logs, searchTerm, selectedAction, dateFrom, dateTo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAction, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLogs, safeCurrentPage]);

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

  const getDisplayDetails = (details: string) => {
    return details
      .replace(/^Cán bộ .*?\s*\([^)]*\)\s+(đăng nhập quản trị thành công.*)$/i, '$1')
      .replace(/^Cán bộ .*?\s+(đăng xuất khỏi hệ thống quản trị\.)$/i, '$1');
  };

  const isGenericActorName = (value?: string) => {
    const name = (value || '').trim();
    if (!name) return true;
    return /^(cán bộ quản trị|quản trị viên|admin|editor|user|staff|employee)$/i.test(name);
  };

  const getActorName = (email: string, fallbackName?: string) => {
    return resolveAuditActorName(email, fallbackName, members);
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo email hoặc chi tiết thao tác..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
            />
          </div>

          <div className="w-full lg:w-56">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex items-center gap-2 text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="min-w-[52px]">Từ ngày</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </label>

          <label className="flex-1 flex items-center gap-2 text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="min-w-[58px]">Đến ngày</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </label>

          {(dateFrom || dateTo || searchTerm || selectedAction !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedAction('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-[11px] font-semibold hover:bg-slate-50"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-36 whitespace-normal break-words">THỜI GIAN</th>
                <th className="py-3 px-4 w-44 whitespace-normal break-words">NGƯỜI THỰC HIỆN</th>
                <th className="py-3 px-4 w-28 text-center whitespace-normal break-words">HÀNH ĐỘNG</th>
                <th className="w-[55vw] min-w-[220px] py-3 px-4 lg:w-auto lg:min-w-0 whitespace-normal break-words">CHI TIẾT THAO TÁC</th>
                <th className="py-3 px-4 w-28 min-w-28 text-center whitespace-normal break-words">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-[160px] break-words leading-relaxed">
                    {getActorName(log.admin_email, log.actor_name)}
                  </td>
                  <td className="py-3 px-4 text-center">{getActionBadge(log.action)}</td>
                  <td className="w-[55vw] min-w-[220px] py-3 px-4 text-slate-700 break-words lg:w-auto lg:min-w-0">
                    {getDisplayDetails(log.details)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    {loading ? 'Đang tải nhật ký...' : 'Chưa có nhật ký hoạt động nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRecords={filteredLogs.length}
        startIndex={(safeCurrentPage - 1) * rowsPerPage}
        endIndex={Math.min(safeCurrentPage * rowsPerPage, filteredLogs.length)}
      />
    </div>
  );
};
