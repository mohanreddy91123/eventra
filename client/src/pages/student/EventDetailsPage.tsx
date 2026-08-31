import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService.js';
import { bookmarkService } from '../../services/bookmarkService.js';
import { CampusEvent } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { ApplicationModal } from '../../components/common/ApplicationModal.js';
import { ReminderModal } from '../../components/common/ReminderModal.js';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  FileText,
  User,
  Phone,
  Bookmark,
  Bell,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, isStudent } = useAuth();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);

  const fetchEvent = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await eventService.getEventById(id);
      setEvent(res.event);
      setIsBookmarked(!!res.event.is_bookmarked);
    } catch (err) {
      console.error('Failed to load event details:', err);
      toast.error('Event not found.');
      navigate('/student/events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (!event) return;
    try {
      const res = await bookmarkService.toggleBookmark(event.id);
      setIsBookmarked(res.isBookmarked);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading full event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const capacityPercent = Math.min(
    100,
    Math.round(((event.applications_count || 0) / (event.capacity || 1)) * 100)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event Discovery
        </Link>
        <StatusBadge status={event.status} />
      </div>

      {/* Main Header / Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/80 shadow-lg">
        {event.poster_url ? (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>
        ) : (
          <div className="h-48 sm:h-64 w-full bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 p-8 flex flex-col justify-end" />
        )}

        <div className="p-6 sm:p-8 relative z-10 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-lg bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
              {event.category}
            </span>

            {event.match_score && (
              <span className="flex items-center gap-1.5 rounded-lg bg-indigo-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-indigo-400/40">
                <Sparkles className="h-3.5 w-3.5" />
                {event.match_score}% Personalized Match
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{event.event_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Match Explanation Box (if student) */}
      {isStudent && event.match_reasons && event.match_reasons.length > 0 && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Why this event was matched for you ({event.match_score}% Score):</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-800">
            {event.match_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-white/70 rounded-xl p-2 border border-indigo-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Layout: Left Details vs Right Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Event Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              About This Event
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Eligibility & Target Audience */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Eligibility & Department Criteria
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Eligibility</span>
                <span className="font-semibold text-slate-800 mt-1 block">{event.eligibility}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Department</span>
                <span className="font-semibold text-slate-800 mt-1 block">{event.target_department}</span>
              </div>
            </div>
          </div>

          {/* Required Skills & Relevant Interests */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recommended / Required Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {event.required_skills && event.required_skills.length > 0 ? (
                  event.required_skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Open to all skill levels</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Relevant Topics & Interests
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {event.relevant_interests && event.relevant_interests.length > 0 ? (
                  event.relevant_interests.map((i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200"
                    >
                      {i}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">General campus event</span>
                )}
              </div>
            </div>
          </div>

          {/* Prizes, Certificates & Instructions */}
          {(event.prize_info || event.certificate_info || event.instructions) && (
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Prizes, Certificates & Guidelines
              </h2>

              {event.prize_info && (
                <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">🏆 Prizes & Awards</span>
                  <p className="text-amber-800">{event.prize_info}</p>
                </div>
              )}

              {event.certificate_info && (
                <div className="rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-200 text-xs">
                  <span className="font-bold text-indigo-900 block mb-1">📜 Certification</span>
                  <p className="text-indigo-800">{event.certificate_info}</p>
                </div>
              )}

              {event.instructions && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">📋 Special Instructions:</span>
                  <p className="leading-relaxed whitespace-pre-line">{event.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Organizer Audit & Creator Footprint */}
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 text-xs space-y-2 text-slate-500">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Platform Publishing & Audit Record
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-slate-400 text-[10px]">Created by:</span>
                <span className="font-semibold text-slate-800">
                  {event.creator_name} ({event.creator_role || 'Organizer'})
                </span>
                <span className="block text-[10px] text-slate-400">
                  {event.created_at ? format(new Date(event.created_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                </span>
              </div>

              <div>
                <span className="block text-slate-400 text-[10px]">Last updated by:</span>
                <span className="font-semibold text-slate-800">
                  {event.updater_name || event.creator_name} ({event.updater_role || event.creator_role || 'Organizer'})
                </span>
                <span className="block text-[10px] text-slate-400">
                  {event.updated_at ? format(new Date(event.updated_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xl space-y-6">
            {/* Registration Deadline Countdown */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Registration Deadline
              </div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">
                {event.registration_deadline}
              </div>
              <div className="mt-1 text-[11px] text-indigo-600 font-semibold">
                Opens: {event.registration_start}
              </div>
            </div>

            {/* Capacity Meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4 text-slate-400" />
                  Capacity Status
                </span>
                <span className="font-extrabold text-slate-800">
                  {event.applications_count || 0} / {event.capacity} applied
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    capacityPercent >= 90
                      ? 'bg-rose-500'
                      : capacityPercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            {/* Primary Action Button (For Students) */}
            {isStudent && (
              <div className="space-y-3">
                {event.has_applied ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-emerald-900">Application Submitted!</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Current Status: <strong>{event.application_status || 'Pending'}</strong>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    disabled={event.status === 'CANCELLED' || capacityPercent >= 100}
                    className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    Apply Now (1-Click)
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBookmarkToggle}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-colors ${
                      isBookmarked
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save Event'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReminderModal(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Bell className="h-4 w-4 text-indigo-600" />
                    Remind Me
                  </button>
                </div>
              </div>
            )}

            {/* Organizer Contact Info */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800">Event Organizer Contact</div>
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{event.organizer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+91 {event.organizer_phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        event={event}
        user={user}
        profile={profile}
        onSuccess={() => fetchEvent()}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        event={event}
        onSuccess={() => fetchEvent()}
      />
    </div>
  );
};
