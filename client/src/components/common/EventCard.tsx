import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CampusEvent } from '../../types/index.js';
import { StatusBadge } from './StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { bookmarkService } from '../../services/bookmarkService.js';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
  Users,
  Bell,
  ArrowUpRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface EventCardProps {
  event: CampusEvent;
  onApplyClick?: (event: CampusEvent) => void;
  onReminderClick?: (event: CampusEvent) => void;
  onHistoryClick?: (event: CampusEvent) => void;
  onBookmarkToggle?: (eventId: number, newState: boolean) => void;
  showOrganizerControls?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onApplyClick,
  onReminderClick,
  onHistoryClick,
  onBookmarkToggle,
  showOrganizerControls = false,
}) => {
  const { user, isStudent } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(!!event.is_bookmarked);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState<boolean>(false);
  const [showMatchDetails, setShowMatchDetails] = useState<boolean>(false);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStudent) return;

    try {
      setIsTogglingBookmark(true);
      const res = await bookmarkService.toggleBookmark(event.id);
      setIsBookmarked(res.isBookmarked);
      toast.success(res.message);
      if (onBookmarkToggle) {
        onBookmarkToggle(event.id, res.isBookmarked);
      }
    } catch (err: any) {
      toast.error('Failed to update bookmark.');
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const capacityPercent = Math.min(
    100,
    Math.round(((event.applications_count || 0) / (event.capacity || 1)) * 100)
  );

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hackathon':
        return 'from-violet-600 to-indigo-600 text-white';
      case 'Technical':
        return 'from-blue-600 to-cyan-600 text-white';
      case 'Workshop':
        return 'from-emerald-600 to-teal-600 text-white';
      case 'Placement':
      case 'Career':
        return 'from-amber-500 to-orange-600 text-white';
      case 'Cultural':
        return 'from-pink-600 to-rose-600 text-white';
      case 'Sports':
        return 'from-green-600 to-emerald-600 text-white';
      default:
        return 'from-indigo-600 to-purple-600 text-white';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
      <div>
        {/* Poster Header / Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          {event.poster_url ? (
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-tr ${getCategoryColor(
                event.category
              )} p-6 flex flex-col justify-between`}
            >
              <span className="text-3xl">🎯</span>
              <div className="text-white/80 text-xs font-mono font-medium">EVENTRA CAMPUS</div>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Category & Status Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/20">
              {event.category}
            </span>
            <StatusBadge status={event.status} size="sm" />
          </div>

          {/* Student Bookmark & Reminder Buttons */}
          {isStudent && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              {onReminderClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onReminderClick(event);
                  }}
                  title="Set Reminder"
                  className="rounded-lg bg-black/50 backdrop-blur-md p-1.5 text-white/80 hover:text-white hover:bg-black/70 border border-white/20 transition-all"
                >
                  <Bell className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleBookmarkToggle}
                disabled={isTogglingBookmark}
                title={isBookmarked ? 'Remove Bookmark' : 'Save Event'}
                className={`rounded-lg p-1.5 backdrop-blur-md border transition-all ${
                  isBookmarked
                    ? 'bg-amber-500 text-white border-amber-400'
                    : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70 border-white/20'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>
          )}

          {/* AI Recommendation Match Badge */}
          {isStudent && event.match_score && (
            <div className="absolute bottom-3 left-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMatchDetails(!showMatchDetails);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white border border-indigo-400/40 shadow-sm transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
                <span>{event.match_score}% Match</span>
                <Info className="h-3 w-3 text-indigo-200" />
              </button>
            </div>
          )}
        </div>

        {/* AI Recommendation Tooltip Dropdown */}
        {showMatchDetails && event.match_reasons && event.match_reasons.length > 0 && (
          <div className="bg-indigo-950 text-white p-3 border-b border-indigo-900 text-xs">
            <div className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3" /> Why this is recommended for you:
            </div>
            <ul className="space-y-0.5 text-slate-300 pl-4 list-disc text-[11px]">
              {event.match_reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5">
          <Link
            to={
              isStudent
                ? `/student/events/${event.id}`
                : user?.role === 'TEACHER'
                ? `/teacher/events/${event.id}/applications`
                : `/educell/events/${event.id}/applications`
            }
            className="block group-hover:text-indigo-600 transition-colors"
          >
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{event.title}</h3>
          </Link>

          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Schedule & Venue Meta */}
          <div className="mt-4 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="font-medium text-slate-800">{event.event_date}</span>
              <span className="text-slate-400">•</span>
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Registrations
              </span>
              <span className="font-semibold text-slate-700">
                {event.applications_count || 0} / {event.capacity} seats
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
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
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-4 flex items-center justify-between gap-2">
        {/* Student View Controls */}
        {isStudent && (
          <>
            {event.has_applied ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Applied ({event.application_status || 'Pending'})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onApplyClick && onApplyClick(event)}
                disabled={event.status === 'CANCELLED' || capacityPercent >= 100}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Apply Now
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}

            <Link
              to={`/student/events/${event.id}`}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Details →
            </Link>
          </>
        )}

        {/* Organizer View Controls (Teacher / Edu Cell) */}
        {!isStudent && (
          <div className="w-full flex items-center justify-between gap-2">
            <Link
              to={
                user?.role === 'TEACHER'
                  ? `/teacher/events/${event.id}/applications`
                  : `/educell/events/${event.id}/applications`
              }
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Users className="h-3.5 w-3.5" />
              Roster ({event.applications_count || 0})
            </Link>

            <div className="flex items-center gap-1.5">
              {onHistoryClick && (
                <button
                  type="button"
                  onClick={() => onHistoryClick(event)}
                  className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  Audit Log
                </button>
              )}

              {showOrganizerControls && (
                <Link
                  to={
                    user?.role === 'TEACHER'
                      ? `/teacher/events/${event.id}/edit`
                      : `/educell/events/${event.id}/edit`
                  }
                  className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
