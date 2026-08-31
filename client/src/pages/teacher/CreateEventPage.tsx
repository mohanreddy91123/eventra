import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { eventService } from '../../services/eventService.js';
import { permissionRequestService } from '../../services/permissionRequestService.js';
import { EventCategory } from '../../types/index.js';
import {
  CalendarDays,
  Plus,
  X,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Info,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export const CreateEventPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEduCell = user?.role === 'EDUCELL';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical' as EventCategory,
    event_date: '',
    start_time: '10:00',
    end_time: '16:00',
    location: '',
    organizer_name: user?.name || '',
    organizer_phone: '9845012345',
    registration_start: new Date().toISOString().slice(0, 10) + ' 00:00:00',
    registration_deadline: '',
    capacity: 100,
    eligibility: 'Open to all students',
    target_department: 'Computer Science & Engineering',
    poster_url: '',
    external_registration_url: '',
    instructions: '',
    prize_info: '',
    certificate_info: '',
  });

  const [skills, setSkills] = useState<string[]>(['Python', 'Problem Solving']);
  const [newSkill, setNewSkill] = useState<string>('');
  const [interests, setInterests] = useState<string[]>(['Technical', 'Coding']);
  const [newInterest, setNewInterest] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories: EventCategory[] = [
    'Technical',
    'Workshop',
    'Hackathon',
    'Career',
    'Placement',
    'Cultural',
    'Sports',
    'Seminar',
    'Other',
  ];

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (i: string) => setInterests(interests.filter((x) => x !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate mandatory fields
    if (!formData.title.trim()) {
      setErrorMessage('Event title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Event description is required.');
      return;
    }
    if (!formData.event_date) {
      setErrorMessage('Event date is required.');
      return;
    }
    if (!formData.registration_deadline) {
      setErrorMessage('Registration deadline is required.');
      return;
    }
    if (Number(formData.capacity) <= 0) {
      setErrorMessage('Maximum participants capacity must be greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEduCell) {
        // SAC must submit a permission request first
        const payload = {
          event_title: formData.title.trim(),
          event_description: formData.description.trim(),
          category: formData.category,
          event_date: formData.event_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location.trim(),
          organizer_name: formData.organizer_name.trim(),
          organizer_phone: formData.organizer_phone.trim(),
          registration_start: formData.registration_start,
          registration_deadline: formData.registration_deadline,
          capacity: Number(formData.capacity),
          eligibility: formData.eligibility.trim(),
          target_department: formData.target_department.trim(),
          required_skills: skills,
          relevant_interests: interests,
          poster_url: formData.poster_url || undefined,
          external_registration_url: formData.external_registration_url || undefined,
          instructions: formData.instructions || undefined,
          prize_info: formData.prize_info || undefined,
          certificate_info: formData.certificate_info || undefined,
        };

        const res = await permissionRequestService.createRequest(payload);
        toast.success(res.message || 'Permission request submitted for teacher approval.');
        navigate('/educell/requests');
      } else {
        // Teachers create and publish immediately!
        const res = await eventService.createEvent({
          ...formData,
          capacity: Number(formData.capacity),
          required_skills: skills,
          relevant_interests: interests,
        });

        toast.success('Event published to campus successfully!');
        navigate('/teacher/events');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit event.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to={isEduCell ? '/educell/requests' : '/teacher/events'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events Management
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          {isEduCell ? (
            <>
              <Briefcase className="h-7 w-7 text-amber-600" />
              Request SAC Event Permission
            </>
          ) : (
            <>
              <CalendarDays className="h-7 w-7 text-purple-600" />
              Create & Publish Campus Event
            </>
          )}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {isEduCell
            ? 'Submit an event hosting request. Faculty coordinators will review and approve before campus publication.'
            : 'Publish authorized departmental events directly to the student portal with zero approval delays.'}
        </p>
      </div>

      {isEduCell && (
        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Teacher Permission Required:</strong> As an Edu Cell / SAC coordinator, submitting this form will send an approval request to faculty coordinators. Once approved by a teacher, you can publish the event live to students.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
            1. Basic Event Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI & Machine Learning Hackathon 2026"
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Venue / Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Seminar Hall 3 / Tech Center"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive event details, objectives, schedule overview..."
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Schedule */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
            2. Schedule & Deadlines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Event Date *</label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Registration Opens Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_start.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, registration_start: e.target.value.replace('T', ' ') + ':00' })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_deadline.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value.replace('T', ' ') + ':00' })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity & Contact */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
            3. Capacity, Eligibility & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Max Capacity (Seats) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Eligibility *</label>
              <input
                type="text"
                required
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="e.g. Open to all engineering students"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Target Department *</label>
              <input
                type="text"
                required
                value={formData.target_department}
                onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
                placeholder="e.g. All Departments / Computer Science"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Organizer Name *</label>
              <input
                type="text"
                required
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Organizer Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.organizer_phone}
                onChange={(e) => setFormData({ ...formData, organizer_phone: e.target.value.replace(/\D/g, '') })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: AI Matching Tags & Media */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            4. AI Recommendation Tags & Media Assets (Optional)
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required / Recommended Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Add skill (e.g. Python, Docker, AI)"
                className="block flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Poster Image URL (Optional)</label>
              <input
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Prize Information (Optional)</label>
              <input
                type="text"
                value={formData.prize_info}
                onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                placeholder="e.g. ₹50,000 Total Cash Prize"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Special Instructions / Guidelines</label>
            <textarea
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Bring your student ID and laptop chargers."
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={isEduCell ? '/educell/requests' : '/teacher/events'}
            className="rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-xs font-bold text-white shadow-lg transition-all ${
              isEduCell
                ? 'bg-amber-600 shadow-amber-200 hover:bg-amber-700'
                : 'bg-purple-600 shadow-purple-200 hover:bg-purple-700'
            } disabled:opacity-50`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting
              ? 'Submitting...'
              : isEduCell
              ? 'Submit Permission Request'
              : 'Publish Campus Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
