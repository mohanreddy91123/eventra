import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService.js';
import { eventService } from '../../services/eventService.js';
import { Application, CampusEvent } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  Hash,
  Building2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const EventApplicationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Status Action Modal state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchApplications = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [evRes, appRes] = await Promise.all([
        eventService.getEventById(id),
        applicationService.getOrganizerApplications(id),
      ]);
      setEvent(evRes.event);
      setApplications(appRes.applications || []);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      toast.error(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!selectedApp || !actionType) return;
    try {
      setIsUpdating(true);
      const res = await applicationService.updateStatus(selectedApp.id, actionType, actionNotes);
      toast.success(res.message || `Application marked as ${actionType}.`);
      setSelectedApp(null);
      setActionType(null);
      setActionNotes('');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      app.department?.toLowerCase().includes(search.toLowerCase()) ||
      app.student_email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/teacher/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Events
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <span>{event?.category}</span>
            <span>•</span>
            <span>Date: {event?.event_date}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {event?.title} — Applications Roster
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review student registrations, verified profile details, and approve or reject participants.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="rounded-2xl bg-purple-50 p-3 border border-purple-100 text-center">
            <div className="text-lg font-black text-purple-900">{applications.length}</div>
            <div className="text-[10px] font-bold text-purple-600 uppercase">Total Applied</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100 text-center">
            <div className="text-lg font-black text-emerald-900">
              {applications.filter((a) => a.status === 'Approved').length}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase">Approved</div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100 text-center">
            <div className="text-lg font-black text-amber-900">
              {applications.filter((a) => a.status === 'Pending').length}
            </div>
            <div className="text-[10px] font-bold text-amber-600 uppercase">Pending</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, roll number, department, or email..."
            className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Roster Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading student roster...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications match this filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Applications submitted by students will appear in this roster.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Student Information</th>
                  <th className="px-4 py-3.5">Roll No & Dept</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Skills & Interests</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Applied At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
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
                      <div className="text-[11px] text-slate-500">
                        {app.department} (Sec {app.section || 'A'})
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="h-3 w-3 text-slate-400" />
                        +91 {app.phone_number}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {app.skills && app.skills.length > 0 ? (
                          app.skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">None added</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} size="sm" />
                      {app.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[140px] truncate" title={app.notes}>
                          Note: {app.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px] text-slate-500">
                      {format(new Date(app.applied_at), 'dd MMM, hh:mm a')}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {app.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setActionType('Approved');
                              setActionNotes('');
                            }}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        )}

                        {app.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setActionType('Rejected');
                              setActionNotes('');
                            }}
                            className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
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

      {/* Approve / Reject Modal */}
      <Modal
        isOpen={!!selectedApp && !!actionType}
        onClose={() => {
          setSelectedApp(null);
          setActionType(null);
        }}
        title={`Confirm Application ${actionType}`}
        subtitle={`Participant: ${selectedApp?.student_name} (${selectedApp?.roll_number})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Changing status to <strong>{actionType}</strong> will automatically send an in-app
            notification to the student's portal.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Feedback Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add instructions, room number, or rejection reason..."
              className="block w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedApp(null);
                setActionType(null);
              }}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors ${
                actionType === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionType === 'Approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isUpdating ? 'Updating...' : `Confirm ${actionType}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
