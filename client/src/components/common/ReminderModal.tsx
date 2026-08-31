import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { reminderService } from '../../services/reminderService.js';
import { CampusEvent, ReminderType } from '../../types/index.js';
import { Bell, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  onSuccess?: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const [reminderType, setReminderType] = useState<ReminderType>('1_DAY_BEFORE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await reminderService.createReminder(event.id, reminderType);
      toast.success(res.message || 'Reminder set successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to set reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Smart Event Reminder"
      subtitle={`Receive in-app notification alerts before "${event.title}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 flex items-start gap-3">
          <Calendar className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900">
            <div className="font-semibold">{event.title}</div>
            <div className="text-indigo-700 mt-0.5">
              Scheduled on {event.event_date} at {event.start_time} ({event.location})
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Reminder Timing
          </label>

          <div
            onClick={() => setReminderType('1_DAY_BEFORE')}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
              reminderType === '1_DAY_BEFORE'
                ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reminderType === '1_DAY_BEFORE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">1 Day Before</div>
                <div className="text-xs text-slate-500">24 hours prior to event start</div>
              </div>
            </div>
            {reminderType === '1_DAY_BEFORE' && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
          </div>

          <div
            onClick={() => setReminderType('1_HOUR_BEFORE')}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
              reminderType === '1_HOUR_BEFORE'
                ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reminderType === '1_HOUR_BEFORE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">1 Hour Before</div>
                <div className="text-xs text-slate-500">60 minutes prior to event start</div>
              </div>
            </div>
            {reminderType === '1_HOUR_BEFORE' && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Scheduling...' : 'Set Reminder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
