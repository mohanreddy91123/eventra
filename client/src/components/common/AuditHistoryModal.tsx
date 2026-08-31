import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.js';
import { eventService } from '../../services/eventService.js';
import { EventHistory, CampusEvent } from '../../types/index.js';
import { History, User, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [history, setHistory] = useState<EventHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && event) {
      const fetchHistory = async () => {
        try {
          setIsLoading(true);
          const res = await eventService.getEventHistory(event.id);
          setHistory(res.history);
        } catch (err) {
          console.error('Failed to load event history:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, event]);

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Audit & Modification History"
      subtitle={`Comprehensive tamper-evident change log for "${event.title}"`}
      maxWidth="2xl"
    >
      {/* Event Metadata Banner */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200/60">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Created By</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <User className="h-4 w-4 text-indigo-600" />
            <span>{event.creator_name || 'Organizer'}</span>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-800">
              {event.creator_role || 'TEACHER'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {event.created_at ? format(new Date(event.created_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Updated By</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <History className="h-4 w-4 text-purple-600" />
            <span>{event.updater_name || event.creator_name || 'Organizer'}</span>
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800">
              {event.updater_role || event.creator_role || 'TEACHER'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {event.updated_at ? format(new Date(event.updated_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-600" />
          Change Log Timeline ({history.length} events recorded)
        </h4>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-xs">Loading audit records from MySQL...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 rounded-xl border border-dashed border-slate-200">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No modifications recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">This event is in its original published state.</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
            {history.map((item, index) => (
              <div key={item.id || index} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                    item.action === 'CREATED'
                      ? 'border-indigo-500 text-indigo-600'
                      : item.action === 'CANCELLED'
                      ? 'border-rose-500 text-rose-600'
                      : 'border-purple-500 text-purple-600'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.action === 'CREATED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.action === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {item.action}
                      </span>
                      {item.field_name && (
                        <span className="text-xs font-semibold text-slate-700">
                          {item.field_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {format(new Date(item.changed_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Changed by:</span>
                    <strong className="text-slate-800">{item.changed_by_name}</strong>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 uppercase font-medium">
                      {item.changed_by_role}
                    </span>
                  </div>

                  {item.action === 'UPDATED' && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-rose-50/60 p-2.5 border border-rose-100 text-rose-900">
                        <span className="font-semibold text-rose-700 block mb-1">Previous Value:</span>
                        <p className="line-through break-words font-mono text-[11px] opacity-80">
                          {item.old_value || '(None)'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50/60 p-2.5 border border-emerald-100 text-emerald-900">
                        <span className="font-semibold text-emerald-700 block mb-1 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" /> New Value:
                        </span>
                        <p className="break-words font-mono text-[11px] font-semibold">
                          {item.new_value || '(None)'}
                        </p>
                      </div>
                    </div>
                  )}

                  {item.action === 'CREATED' && (
                    <p className="mt-2 text-xs text-slate-600 italic">
                      {item.new_value || 'Event created and published on the platform.'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Close History
        </button>
      </div>
    </Modal>
  );
};
