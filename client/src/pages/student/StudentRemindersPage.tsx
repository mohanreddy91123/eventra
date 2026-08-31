import React, { useEffect, useState } from 'react';
import { reminderService } from '../../services/reminderService.js';
import { Reminder } from '../../types/index.js';
import { Clock, Bell, Trash2, Calendar, MapPin, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const StudentRemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await reminderService.getMyReminders();
      setReminders(res.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDeleteReminder = async (id: number) => {
    try {
      const res = await reminderService.deleteReminder(id);
      toast.success(res.message || 'Reminder removed.');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Clock className="h-7 w-7 text-indigo-600" />
          Smart Reminders
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Automated schedule alerts scheduled for your upcoming campus events.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading scheduled reminders...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active reminders</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You can set 1-day or 1-hour before reminders directly from any event card or details page.
          </p>
          <Link
            to="/student/events"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Compass className="h-4 w-4" />
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                    <Bell className="h-3 w-3" />
                    {reminder.reminder_type === '1_DAY_BEFORE' ? '1 Day Before' : '1 Hour Before'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Cancel Reminder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Link
                  to={`/student/events/${reminder.event_id}`}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 block"
                >
                  {reminder.event_title}
                </Link>

                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Event Date: {reminder.event_date} ({reminder.start_time})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Alert Trigger: {reminder.reminder_time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
