import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Sparkles,
  Calendar,
  Layers,
  CheckCheck,
  ChevronDown,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { format } from 'date-fns';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isStudent, isTeacher, isEduCell, login } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showDemoSwitch, setShowDemoSwitch] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setShowDemoSwitch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (email: string) => {
    try {
      await login({ email, password: 'Password@123' });
      setShowDemoSwitch(false);
      if (email.includes('ravi') || email.includes('sunita')) {
        navigate('/teacher/dashboard');
      } else if (email.includes('sac') || email.includes('educell')) {
        navigate('/educell/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'STUDENT':
        return <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">Student</span>;
      case 'TEACHER':
        return <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Teacher / Organizer</span>;
      case 'EDUCELL':
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Edu Cell / SAC</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-none">
              EVENTRA
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 tracking-wider">
              CAMPUS EVENTS
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher for Demo testing */}
        <div className="relative" ref={demoRef}>
          <button
            type="button"
            onClick={() => setShowDemoSwitch(!showDemoSwitch)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Switch Role</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showDemoSwitch && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Quick Demo Switcher
              </div>
              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('aarav.sharma@campus.edu')}
                  className="w-full text-left rounded-xl p-2 hover:bg-indigo-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">Aarav Sharma</div>
                    <div className="text-[11px] text-slate-500">Student (CSE, AI/ML)</div>
                  </div>
                  <span className="rounded bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 font-semibold">STUDENT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSwitch('prof.ravi.kumar@campus.edu')}
                  className="w-full text-left rounded-xl p-2 hover:bg-purple-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">Prof. Ravi Kumar</div>
                    <div className="text-[11px] text-slate-500">Faculty Coordinator</div>
                  </div>
                  <span className="rounded bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 font-semibold">TEACHER</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSwitch('sac.coordinator@campus.edu')}
                  className="w-full text-left rounded-xl p-2 hover:bg-amber-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">SAC Coordinator</div>
                    <div className="text-[11px] text-slate-500">Student Activity Center</div>
                  </div>
                  <span className="rounded bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 font-semibold">EDUCELL</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAsRead('all')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications at the moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                          !notif.is_read ? 'bg-indigo-50/40' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="mt-1 text-slate-600 leading-relaxed">{notif.message}</p>
                        <span className="mt-1.5 block text-[10px] text-slate-400">
                          {format(new Date(notif.created_at), 'dd MMM, hh:mm a')}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {isStudent && (
                  <div className="border-t border-slate-100 bg-slate-50 p-2.5 text-center">
                    <Link
                      to="/student/notifications"
                      onClick={() => setShowNotifs(false)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View All Notifications →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Account Menu */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-1.5 hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                <span className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="border-b border-slate-100 p-3">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-2">{getRoleBadge(user.role)}</div>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to={
                      isStudent
                        ? '/student/profile'
                        : isTeacher
                        ? '/teacher/profile'
                        : '/educell/profile'
                    }
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    Profile & Account
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
