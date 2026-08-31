import React, { useEffect, useState } from 'react';
import { permissionRequestService } from '../../services/permissionRequestService.js';
import { EventPermissionRequest } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  User,
  Sparkles,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const TeacherPermissionRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EventPermissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<EventPermissionRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleReview = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      setIsSubmitting(true);
      const res = await permissionRequestService.reviewRequest(
        selectedRequest.id,
        actionType,
        actionType === 'REJECTED' ? rejectionReason : undefined
      );
      toast.success(res.message || `Request ${actionType.toLowerCase()} successfully.`);
      setSelectedRequest(null);
      setActionType(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_TEACHER_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending Faculty Review
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
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Briefcase className="h-7 w-7 text-purple-600" />
          Edu Cell / SAC Permission Requests
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Faculty governance over institutional events. Review, approve, or reject event requests submitted by Student Activity Center coordinators.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'PENDING_TEACHER_APPROVAL', label: 'Pending Approval' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading SAC permission requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No permission requests found</h3>
          <p className="text-xs text-slate-500 mt-1">
            When SAC coordinators submit event hosting proposals, they will appear here for faculty review.
          </p>
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

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Requested by <strong>{req.requested_by_name}</strong> (SAC Coordinator) on{' '}
                    {format(new Date(req.created_at), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{req.event_title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {req.event_description}
                </p>
              </div>

              {/* Event Criteria Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Proposed Date</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    {req.event_date}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Time & Venue</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    {req.location}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Department</span>
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

              {/* Rejection Note if Rejected */}
              {req.status === 'REJECTED' && req.rejection_reason && (
                <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-800">
                  <strong>Faculty Rejection Feedback:</strong> {req.rejection_reason}
                </div>
              )}

              {/* Teacher Actions (if PENDING) */}
              {req.status === 'PENDING_TEACHER_APPROVAL' && (
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequest(req);
                      setActionType('REJECTED');
                      setRejectionReason('');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Request
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequest(req);
                      setActionType('APPROVED');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedRequest && !!actionType}
        onClose={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
        title={`Faculty Decision: ${actionType === 'APPROVED' ? 'Approve' : 'Reject'} SAC Event Request`}
        subtitle={`Event: "${selectedRequest?.event_title}"`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {actionType === 'APPROVED'
              ? 'Approving this request will allow the SAC Coordinator to immediately publish this event to the campus platform.'
              : 'Please provide a feedback note explaining why this event request is rejected.'}
          </p>

          {actionType === 'REJECTED' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Schedule clashes with Midterm Exams / Venue is pre-booked."
                className="block w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedRequest(null);
                setActionType(null);
              }}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReview}
              disabled={isSubmitting || (actionType === 'REJECTED' && !rejectionReason.trim())}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors ${
                actionType === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionType === 'APPROVED' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isSubmitting ? 'Submitting...' : `Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
