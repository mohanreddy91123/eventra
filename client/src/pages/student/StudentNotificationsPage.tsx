import React from 'react';
import { useNotifications } from '../../context/NotificationContext.js';
import { Bell, CheckCheck, Sparkles, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const StudentNotificationsPage: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-indigo-600" />
            Notifications Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time updates regarding your applications, event schedule changes, and reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAsRead('all')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            You're all caught up! Updates regarding events and applications will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-4 ${
                !notif.is_read ? 'bg-indigo-50/30' : 'bg-white'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  notif.type === 'APPLICATION_STATUS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : notif.type === 'EVENT_UPDATE'
                    ? 'bg-indigo-100 text-indigo-700'
                    : notif.type === 'DEADLINE_ALERT'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {notif.type === 'APPLICATION_STATUS' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : notif.type === 'DEADLINE_ALERT' ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {format(new Date(notif.created_at), 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.is_read && (
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
