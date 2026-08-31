import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { dashboardService, StudentDashboardData } from '../../services/dashboardService.js';
import { eventService } from '../../services/eventService.js';
import { CampusEvent } from '../../types/index.js';
import { EventCard } from '../../components/common/EventCard.js';
import { ApplicationModal } from '../../components/common/ApplicationModal.js';
import { ReminderModal } from '../../components/common/ReminderModal.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  Sparkles,
  FileCheck2,
  Bookmark,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Compass,
  Award,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<CampusEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedEventForApply, setSelectedEventForApply] = useState<CampusEvent | null>(null);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<CampusEvent | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [dashRes, recRes, eventsRes] = await Promise.all([
        dashboardService.getStats(),
        eventService.getRecommendations(),
        eventService.getEvents({ status: 'UPCOMING' }),
      ]);
      setData(dashRes);
      setRecommendations(recRes.recommendations || []);
      setUpcomingEvents(eventsRes.events?.slice(0, 6) || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{profile?.department || 'Student Portal'}</span>
              <span className="opacity-40">•</span>
              <span className="font-mono">{profile?.roll_number}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Hello, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Explore events curated for your skills in {profile?.skills?.slice(0, 3).join(', ')}. Never miss a registration deadline on campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/events"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-md hover:bg-indigo-50 transition-all"
            >
              <Compass className="h-4 w-4" />
              Explore All Events
            </Link>
            <Link
              to="/student/profile"
              className="flex items-center gap-2 rounded-xl bg-indigo-700/60 px-4 py-2.5 text-xs font-bold text-white border border-white/20 hover:bg-indigo-700 transition-all"
            >
              Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data?.stats.totalApplications ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500">My Applications</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {data?.stats.approvedApplications ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500">Approved Seats</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data?.stats.savedEvents ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500">Saved Events</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data?.stats.upcomingEvents ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500">Upcoming on Campus</div>
          </div>
        </div>
      </div>

      {/* Recommended For You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">
                Personalized AI match based on your department, skills, and interests.
              </p>
            </div>
          </div>

          <Link
            to="/student/profile"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Refine Preferences →
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-xs">Computing personalized recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No specific recommendations yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Add skills and interests in your profile to trigger personalized AI matching.
            </p>
            <Link
              to="/student/profile"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              Update Profile Preferences
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onApplyClick={(ev) => setSelectedEventForApply(ev)}
                onReminderClick={(ev) => setSelectedEventForReminder(ev)}
                onBookmarkToggle={() => loadDashboard()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Grid: Upcoming Events & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Campus Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Upcoming Events on Campus
            </h2>
            <Link
              to="/student/events"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All ({upcomingEvents.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {upcomingEvents.slice(0, 4).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onApplyClick={(ev) => setSelectedEventForApply(ev)}
                onReminderClick={(ev) => setSelectedEventForReminder(ev)}
                onBookmarkToggle={() => loadDashboard()}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Recent Applications Status Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              My Applications
            </h2>
            <Link
              to="/student/applications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              All →
            </Link>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 divide-y divide-slate-100 shadow-sm">
            {data?.recentApplications && data.recentApplications.length > 0 ? (
              data.recentApplications.map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/student/events/${app.event_id}`}
                      className="text-xs font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                    >
                      {app.event_title}
                    </Link>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{app.category}</span>
                    <span>Applied {format(new Date(app.applied_at), 'dd MMM yyyy')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                You haven't applied to any events yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Confirmation Modal */}
      <ApplicationModal
        isOpen={!!selectedEventForApply}
        onClose={() => setSelectedEventForApply(null)}
        event={selectedEventForApply}
        user={user}
        profile={profile}
        onSuccess={() => loadDashboard()}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={!!selectedEventForReminder}
        onClose={() => setSelectedEventForReminder(null)}
        event={selectedEventForReminder}
        onSuccess={() => loadDashboard()}
      />
    </div>
  );
};
