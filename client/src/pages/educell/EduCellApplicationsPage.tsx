import React, { useEffect, useState } from 'react';
import { applicationService } from '../../services/applicationService.js';
import { Application } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  Users,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';

export const EduCellApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationService.getAllApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load all applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    return (
      !search ||
      app.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      app.event_title?.toLowerCase().includes(search.toLowerCase()) ||
      app.department?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Users className="h-7 w-7 text-amber-600" />
          Campus Student Registrations Roster
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Global attendance and registration roster across all campus events. Student registrations are directly confirmed.
        </p>
      </div>

      {/* Info Notice */}
      <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Direct Student Registration:</strong> Students directly register for published campus events with instant seat confirmation. No coordinator approval is required.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, event title, or department..."
            className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading registrations roster...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No student registrations found</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Roll No & Dept</th>
                  <th className="px-4 py-3.5">Registered Event</th>
                  <th className="px-4 py-3.5">Registration Status</th>
                  <th className="px-5 py-3.5 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{app.student_name}</div>
                      <div className="text-[11px] text-slate-400">{app.student_email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-slate-800">{app.roll_number}</div>
                      <div className="text-[11px] text-slate-500">{app.department}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{app.event_title}</div>
                      <div className="text-[10px] text-slate-400">{app.event_category} • {app.event_date}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmed
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[11px] text-slate-500 text-right">
                      {format(new Date(app.applied_at), 'dd MMM yyyy, hh:mm a')}
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
