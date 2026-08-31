import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Briefcase, ShieldCheck, Mail, Building2 } from 'lucide-react';

export const EduCellProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Briefcase className="h-7 w-7 text-amber-600" />
          Edu Cell / SAC Coordinator Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Student Activity Center administrative oversight and campus governance permissions.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-black text-amber-700">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                EDU CELL / SAC COORDINATOR
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Campus Event Authority</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Coordinator Name
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800">{user?.name}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Official Email
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800 truncate">{user?.email}</div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Governance Scope
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800 flex items-center gap-1 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
              University Wide (Faculty & SAC Events)
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Audit Privilege
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800">Full System Audit & History</div>
          </div>
        </div>
      </div>
    </div>
  );
};
