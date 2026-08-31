import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { User, Mail, GraduationCap, ShieldCheck, CalendarDays, Award } from 'lucide-react';
import { format } from 'date-fns';

export const TeacherProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-purple-600" />
          Faculty Organizer Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Authorized campus faculty credentials and event management permissions.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-2xl font-black text-purple-700">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                TEACHER / FACULTY ORGANIZER
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Authorized Event Publisher</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Full Name
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800">{user?.name}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Institutional Email
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800 truncate">{user?.email}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Access Level
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800 flex items-center gap-1 text-purple-700">
              <ShieldCheck className="h-4 w-4" />
              Event Creator & Manager
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account Registered
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800">Active Academic Session</div>
          </div>
        </div>
      </div>
    </div>
  );
};
