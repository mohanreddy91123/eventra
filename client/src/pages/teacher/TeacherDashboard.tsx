import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { dashboardService, TeacherDashboardData } from '../../services/dashboardService.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { format } from 'date-fns';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10 mb-3">
              <GraduationCap className="h-3.5 w-3.5 text-purple-300" />
              <span>Authorized Faculty Organizer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {user?.name}! 🎓
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100/90 leading-relaxed">
              Create departmental workshops, technical symposiums, manage student applications, and track change audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/teacher/events/create"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-purple-900 shadow-md hover:bg-purple-50 transition-all"
            >
              <PlusCircle className="h-4 w-4 text-purple-600" />
              Create New Event
            </Link>
            <Link
              to="/teacher/events"
              className="flex items-center gap-2 rounded-xl bg-purple-700/60 px-4 py-2.5 text-xs font-bold text-white border border-white/20 hover:bg-purple-700 transition-all"
            >
              Manage My Events
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{data?.stats.myEvents ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">My Created Events</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{data?.stats.totalApplications ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Total Applications</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{data?.stats.approvedApplications ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Approved Students</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{data?.stats.pendingApplications ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Pending Review</div>
          </div>
        </div>
      </div>

      {/* Grid: Events Overview & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              My Events & Capacity
            </h2>
            <Link
              to="/teacher/events"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All Events →
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {data?.recentEvents && data.recentEvents.length > 0 ? (
              data.recentEvents.map((ev) => (
                <div key={ev.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {ev.category}
                      </span>
                      <StatusBadge status={ev.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                    <div className="text-xs text-slate-500">
                      Date: {ev.event_date} • Registrations: {ev.applications_count || 0} / {ev.capacity}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/teacher/events/${ev.id}/applications`}
                      className="rounded-xl bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      Review Roster
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                You haven't created any events yet.{' '}
                <Link to="/teacher/events/create" className="text-purple-600 font-bold underline">
                  Create your first event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Applications Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Recent Applications
            </h2>
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
                  <div className="mt-1 text-[11px] text-purple-700 font-medium truncate">
                    For: {app.event_title}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent applications received.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
