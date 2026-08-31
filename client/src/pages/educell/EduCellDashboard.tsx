import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { dashboardService, EduCellDashboardData } from '../../services/dashboardService.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  Briefcase,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export const EduCellDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EduCellDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load EduCell dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10 mb-3">
              <Briefcase className="h-3.5 w-3.5 text-amber-300" />
              <span>Student Activity Center (SAC) & Edu Cell Coordinator</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Coordinator Portal 🏛️
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              Campus-wide event governance. Manage cultural fests, institutional hackathons, teacher-created events, and monitor audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/educell/events/create"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-amber-900 shadow-md hover:bg-amber-50 transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-600" />
              Create SAC Event
            </Link>
            <Link
              to="/educell/events"
              className="flex items-center gap-2 rounded-xl bg-amber-700/60 px-4 py-2.5 text-xs font-bold text-white border border-white/20 hover:bg-amber-700 transition-all"
            >
              Manage All Events
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{data?.stats.totalEvents ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Total Campus Events</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{data?.stats.teacherEvents ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Faculty Organized</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{data?.stats.educellEvents ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">SAC / Edu Cell Events</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{data?.stats.totalApplications ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Total Applications</div>
          </div>
        </div>
      </div>

      {/* Grid: Campus Applications & System Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Campus Applications Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Latest Campus Registrations
            </h2>
            <Link
              to="/educell/applications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 divide-y divide-slate-100 shadow-sm">
            {data?.recentApplications && data.recentApplications.length > 0 ? (
              data.recentApplications.map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{app.student_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {app.roll_number} • {app.department}
                      </div>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="mt-1 text-[11px] text-indigo-600 font-semibold truncate">
                    For: {app.event_title}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent applications recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: System Audit Trail Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Recent System Audit Trail
            </h2>
            <Link
              to="/educell/audit"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Full Audit Logs →
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 divide-y divide-slate-100 shadow-sm">
            {data?.recentAudits && data.recentAudits.length > 0 ? (
              data.recentAudits.map((log) => (
                <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 font-semibold">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-600 font-normal">
                        by {log.user_name || 'System'} ({log.user_role || 'ADMIN'})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Entity: {log.entity_type}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd MMM, hh:mm a')}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No audit logs generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
