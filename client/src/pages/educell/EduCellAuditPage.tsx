import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { ShieldAlert, RefreshCw, User, Calendar, Database, Search } from 'lucide-react';
import { format } from 'date-fns';

export const EduCellAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchAudits = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard/stats');
      setLogs(res.data.recentAudits || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="h-7 w-7 text-amber-600" />
            System Audit & Governance Log
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Immutable system-level audit records tracking user registrations, logins, event creations, updates, and application approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAudits}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Logs
        </button>
      </div>

      {/* Search Filter */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action (e.g. EVENT_UPDATED, APPLICATION_APPROVED), user, or entity..."
            className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Reading audit logs from MySQL...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No audit logs found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-4 py-3.5">Actor / User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Entity Type</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 font-sans border border-indigo-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-sans font-semibold text-slate-800">
                      {log.user_name || 'System Auto'}
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {log.user_role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-sans text-slate-600">
                      {log.entity_type}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans text-[11px] text-slate-500 whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
