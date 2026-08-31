import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  FileCheck2,
  Bell,
  Clock,
  User,
  PlusCircle,
  CalendarDays,
  Users,
  Briefcase,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isStudent, isTeacher, isEduCell } = useAuth();

  const studentNav = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/events', label: 'Discover Events', icon: Compass },
    { to: '/student/bookmarks', label: 'Saved Events', icon: Bookmark },
    { to: '/student/applications', label: 'My Applications', icon: FileCheck2 },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/reminders', label: 'Smart Reminders', icon: Clock },
    { to: '/student/profile', label: 'Profile & Preferences', icon: User },
  ];

  const teacherNav = [
    { to: '/teacher/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/teacher/events', label: 'My Events', icon: CalendarDays },
    { to: '/teacher/events/create', label: 'Create Event', icon: PlusCircle },
    { to: '/teacher/permission-requests', label: 'SAC Permission Requests', icon: Briefcase },
    { to: '/teacher/profile', label: 'Teacher Profile', icon: User },
  ];

  const educellNav = [
    { to: '/educell/dashboard', label: 'SAC Dashboard', icon: LayoutDashboard },
    { to: '/educell/requests', label: 'Permission Status & Publish', icon: Briefcase },
    { to: '/educell/events/create', label: 'Request Event Permission', icon: PlusCircle },
    { to: '/educell/events', label: 'All Campus Events', icon: CalendarDays },
    { to: '/educell/applications', label: 'Campus Applications', icon: Users },
    { to: '/educell/audit', label: 'System Audit Logs', icon: ShieldAlert },
    { to: '/educell/profile', label: 'Coordinator Profile', icon: User },
  ];

  const navItems = isStudent ? studentNav : isTeacher ? teacherNav : isEduCell ? educellNav : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          {/* Main Nav Links */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isStudent ? 'Student Portal' : isTeacher ? 'Organizer Portal' : 'SAC Coordinator'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm ring-1 ring-indigo-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Card / System Status */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Eventra Live v1.0</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              AI-Powered Campus Discovery & Event Automation.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400">
              <span>MySQL 8.0 Connected</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
