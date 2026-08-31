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
  Filter,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const EduCellAllEventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyEvent, setHistoryEvent] = useState<CampusEvent | null>(null);

  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER' | 'EDUCELL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchAllEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load campus events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleCancelEvent = async (event: CampusEvent) => {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}" as SAC Coordinator?`)) {
      return;
    }
    try {
      await eventService.deleteEvent(event.id);
      toast.success('Event marked as cancelled.');
      fetchAllEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel event.');
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !search ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.organizer_name.toLowerCase().includes(search.toLowerCase()) ||
      ev.creator_name?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'TEACHER' && ev.creator_role === 'TEACHER') ||
      (roleFilter === 'EDUCELL' && ev.creator_role === 'EDUCELL');

    const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;

    return matchesSearch && matchesRole && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-amber-600" />
            Campus Events Registry (All Events)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Global governance of all university events. Edu Cell / SAC has full authority to edit, manage, and audit all faculty and SAC events.
          </p>
        </div>

        <Link
          to="/educell/events/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Create SAC Event
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all events by title, organizer, or location..."
            className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Organizers</option>
            <option value="TEACHER">Teacher Created</option>
            <option value="EDUCELL">Edu Cell / SAC Created</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading campus registry...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Event Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Created By</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Applications</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Updated By</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((ev) => (
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
                      <div className="font-semibold text-slate-800">{ev.creator_name}</div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        ev.creator_role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ev.creator_role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-800">
                      {ev.event_date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{ev.applications_count || 0}</span> / {ev.capacity}
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
                          to={`/educell/events/${ev.id}/applications`}
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-700 hover:bg-indigo-100"
                          title="View Applications Roster"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/educell/events/${ev.id}/edit`}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                          title="Edit Event (Edu Cell Admin Access)"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setHistoryEvent(ev)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                          title="View Complete Audit History"
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
