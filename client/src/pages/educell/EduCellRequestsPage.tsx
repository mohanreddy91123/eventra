import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { permissionRequestService } from '../../services/permissionRequestService.js';
import { EventPermissionRequest } from '../../types/index.js';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Users,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export const EduCellRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EventPermissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await permissionRequestService.getRequests(statusFilter === 'ALL' ? undefined : statusFilter);
      setRequests(res.requests || []);
    } catch (err: any) {
      console.error('Failed to load permission requests:', err);
      toast.error(err.response?.data?.message || 'Failed to load permission requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handlePublish = async (requestId: number, title: string) => {
    try {
      setPublishingId(requestId);
      const res = await permissionRequestService.publishApprovedEvent(requestId);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      toast.success(res.message || `Event "${title}" published to campus!`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish event.');
    } finally {
      setPublishingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_TEACHER_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending Teacher Approval
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Teacher Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Teacher Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-amber-600" />
            Permission Request Status & Publishing
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Track faculty approvals for your event proposals and publish approved events directly to campus.
          </p>
        </div>

        <Link
          to="/educell/events/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Request Event Permission
        </Link>
      </div>

      {/* Permission Workflow Notice Banner */}
      <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Edu Cell / SAC Permission Policy:</strong> SAC event proposals must be reviewed and approved by faculty coordinators before publishing. Once a request status changes to <strong>Teacher Approved</strong>, click the <strong>"Publish Event"</strong> button below to make it immediately visible to students.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'PENDING_TEACHER_APPROVAL', label: 'Pending Approval' },
          { key: 'APPROVED', label: 'Approved & Ready' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading your permission requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests in this category</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Submit an event proposal to start the faculty approval and campus publishing process.
          </p>
          <Link
            to="/educell/events/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Submit Event Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {req.category}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <div className="text-xs text-slate-500">
                  Requested on {format(new Date(req.created_at), 'dd MMM yyyy, hh:mm a')}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{req.event_title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {req.event_description}
                </p>
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Date</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    {req.event_date}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    {req.location}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">
                    {req.target_department}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    {req.capacity} seats
                  </div>
                </div>
              </div>

              {/* Rejection Note */}
              {req.status === 'REJECTED' && (
                <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    Rejected by {req.reviewed_by_name || 'Faculty Coordinator'}
                  </div>
                  <p>Reason: {req.rejection_reason || 'No specific reason provided.'}</p>
                </div>
              )}

              {/* Approval Info & Publish Action */}
              {req.status === 'APPROVED' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200">
                  <div className="text-xs text-emerald-900 space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Approved by Prof. {req.reviewed_by_name || 'Faculty Coordinator'}
                    </div>
                    <div className="text-emerald-700">
                      {req.event_id
                        ? `Published to campus (Event #${req.event_id}). Students can now discover and register.`
                        : 'Teacher permission granted. Ready to be published to all campus students.'}
                    </div>
                  </div>

                  {!req.event_id ? (
                    <button
                      type="button"
                      disabled={publishingId === req.id}
                      onClick={() => handlePublish(req.id, req.event_title)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all shrink-0"
                    >
                      <Sparkles className="h-4 w-4" />
                      {publishingId === req.id ? 'Publishing...' : 'Publish Event to Campus'}
                    </button>
                  ) : (
                    <span className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                      Published Live
                    </span>
                  )}
                </div>
              )}

              {req.status === 'PENDING_TEACHER_APPROVAL' && (
                <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Waiting for faculty coordinator review. You will receive an in-app notification when a teacher approves or rejects this proposal.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
