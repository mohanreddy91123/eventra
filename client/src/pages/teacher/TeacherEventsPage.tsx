import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService.js';
import { CampusEvent } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { AuditHistoryModal } from '../../components/common/AuditHistoryModal.js';
import {
  CalendarDays,
  PlusCircle,
  Users,
  Edit,
  History,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const TeacherEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyEvent, setHistoryEvent] = useState<CampusEvent | null>(null);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getEvents({ myEventsOnly: true });
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load teacher events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleCancelEvent = async (event: CampusEvent) => {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}"? Registered students will receive cancellation notifications.`)) {
      return;
    }
    try {
      await eventService.deleteEvent(event.id);
      toast.success('Event cancelled successfully.');
      fetchMyEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel event.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-purple-600" />
            My Created Events
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your authorized departmental events, view student applicants, and track audit history.
          </p>
        </div>

        <Link
          to="/teacher/events/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Event
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading your events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No events created yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by publishing your first campus workshop, competition, or placement sprint.
          </p>
          <Link
            to="/teacher/events/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Create Event Now
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Event Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Roster / Capacity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{ev.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ev.location}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{ev.event_date}</div>
                      <div className="text-[10px] text-slate-400">{ev.start_time.slice(0, 5)} - {ev.end_time.slice(0, 5)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {ev.applications_count || 0} / {ev.capacity}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {ev.approved_count || 0} approved
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={ev.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      <div className="font-semibold text-slate-700">
                        {ev.updater_name || ev.creator_name}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {ev.updated_at ? format(new Date(ev.updated_at), 'dd MMM, hh:mm a') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/teacher/events/${ev.id}/applications`}
                          className="rounded-lg bg-purple-50 p-2 text-purple-700 hover:bg-purple-100"
                          title="View Applications Roster"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/teacher/events/${ev.id}/edit`}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setHistoryEvent(ev)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                          title="View Audit History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        {ev.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelEvent(ev)}
                            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                            title="Cancel Event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      <AuditHistoryModal
        isOpen={!!historyEvent}
        onClose={() => setHistoryEvent(null)}
        event={historyEvent}
      />
    </div>
  );
};
