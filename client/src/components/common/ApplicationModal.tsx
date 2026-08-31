import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { applicationService } from '../../services/applicationService.js';
import { CampusEvent, StudentProfile, User } from '../../types/index.js';
import { CheckCircle2, ShieldCheck, Calendar, MapPin, User as UserIcon, Mail, Phone, Hash, Building2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  user: User | null;
  profile: StudentProfile | null;
  onSuccess?: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  profile,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!event || !user) return null;

  const handleApply = async () => {
    try {
      setIsSubmitting(true);
      const res = await applicationService.applyToEvent(event.id);

      // Celebrate direct instant registration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      toast.success(res.message || 'Registration confirmed! Your seat is reserved.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant 1-Click Event Registration"
      subtitle="Your verified student credentials will be registered. No approval required."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Event Snapshot */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>{event.category}</span>
            <span>•</span>
            <span>Eligibility: {event.eligibility}</span>
          </div>
          <h4 className="mt-1 text-base font-bold text-slate-900">{event.title}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {event.event_date} ({event.start_time})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {event.location}
            </span>
          </div>
        </div>

        {/* Auto-populated Verified Student Profile */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified Student Profile (Auto-filled)
            </label>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Directly Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-4 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Full Name</span>
                <span className="font-semibold text-slate-800">{user.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Roll Number</span>
                <span className="font-semibold text-slate-800 font-mono">{profile?.roll_number || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Department & Sec</span>
                <span className="font-semibold text-slate-800">
                  {profile?.department || 'N/A'} (Sec {profile?.section || 'A'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Phone Number</span>
                <span className="font-semibold text-slate-800">+91 {profile?.phone_number || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <p className="text-xs text-slate-500 leading-relaxed">
          Registration is direct and instant. Your seat is confirmed immediately upon clicking <strong>Confirm Registration</strong>.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? 'Registering Seat...' : 'Confirm Registration'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
