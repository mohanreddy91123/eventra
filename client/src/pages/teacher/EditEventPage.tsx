import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { eventService } from '../../services/eventService.js';
import { EventCategory, EventStatus } from '../../types/index.js';
import {
  CalendarDays,
  Plus,
  X,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical' as EventCategory,
    event_date: '',
    start_time: '10:00',
    end_time: '16:00',
    location: '',
    organizer_name: '',
    organizer_phone: '',
    registration_start: '',
    registration_deadline: '',
    capacity: 100,
    eligibility: '',
    target_department: '',
    poster_url: '',
    external_registration_url: '',
    instructions: '',
    prize_info: '',
    certificate_info: '',
    status: 'UPCOMING' as EventStatus,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const statuses: EventStatus[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await eventService.getEventById(id);
        const ev = res.event;

        // Verify authorization if teacher
        if (user?.role === 'TEACHER' && ev.created_by !== user.id) {
          toast.error('Access Denied: You are not authorized to edit events created by other organizers.');
          navigate('/teacher/events');
          return;
        }

        setFormData({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Technical',
          event_date: ev.event_date || '',
          start_time: ev.start_time || '10:00',
          end_time: ev.end_time || '16:00',
          location: ev.location || '',
          organizer_name: ev.organizer_name || '',
          organizer_phone: ev.organizer_phone || '',
          registration_start: ev.registration_start || '',
          registration_deadline: ev.registration_deadline || '',
          capacity: ev.capacity || 100,
          eligibility: ev.eligibility || '',
          target_department: ev.target_department || '',
          poster_url: ev.poster_url || '',
          external_registration_url: ev.external_registration_url || '',
          instructions: ev.instructions || '',
          prize_info: ev.prize_info || '',
          certificate_info: ev.certificate_info || '',
          status: ev.status || 'UPCOMING',
        });

        setSkills(ev.required_skills || []);
        setInterests(ev.relevant_interests || []);
      } catch (err) {
        toast.error('Failed to load event for editing.');
        navigate('/teacher/events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

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
    if (!id) return;
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const res = await eventService.updateEvent(id, {
        ...formData,
        capacity: Number(formData.capacity),
        required_skills: skills,
        relevant_interests: interests,
      });

      toast.success(res.message || 'Event updated and audit history recorded.');
      if (user?.role === 'EDUCELL') {
        navigate('/educell/events');
      } else {
        navigate('/teacher/events');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update event.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-slate-600">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={user?.role === 'EDUCELL' ? '/educell/events' : '/teacher/events'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events Management
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <CalendarDays className="h-7 w-7 text-purple-600" />
          Edit Event Details
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          All modifications are tracked in the event change audit history table.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              1. Basic Information & Status
            </h2>
            <div>
              <label className="text-xs font-bold text-slate-500 mr-2">Event Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
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
              <label className="block text-xs font-bold text-slate-700">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_deadline.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value.replace('T', ' ') + ':00' })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

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
          </div>
        </div>

        {/* Section 3: Eligibility & Tags */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            3. Eligibility, Skills & Assets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Eligibility *</label>
              <input
                type="text"
                required
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
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
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Prize Information</label>
              <input
                type="text"
                value={formData.prize_info}
                onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Poster Image URL</label>
              <input
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={user?.role === 'EDUCELL' ? '/educell/events' : '/teacher/events'}
            className="rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? 'Saving Changes...' : 'Save & Record Audit History'}
          </button>
        </div>
      </form>
    </div>
  );
};
