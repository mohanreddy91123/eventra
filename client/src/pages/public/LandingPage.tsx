import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { eventService } from '../../services/eventService.js';
import { CampusEvent, EventCategory } from '../../types/index.js';
import { EventCard } from '../../components/common/EventCard.js';
import {
  Calendar,
  Sparkles,
  Compass,
  Bell,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await eventService.getEvents({ status: 'UPCOMING' });
        setFeaturedEvents(res.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories: EventCategory[] = [
    'Technical',
    'Workshop',
    'Hackathon',
    'Career',
    'Placement',
    'Cultural',
    'Sports',
    'Seminar',
  ];

  const filteredEvents =
    selectedCategory === 'ALL'
      ? featuredEvents
      : featuredEvents.filter((e) => e.category === selectedCategory);

  const handleQuickLogin = async (email: string) => {
    try {
      await login({ email, password: 'Password@123' });
      if (email.includes('ravi') || email.includes('sunita')) {
        navigate('/teacher/dashboard');
      } else if (email.includes('sac') || email.includes('educell')) {
        navigate('/educell/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
                EVENTRA
              </span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider">
                CAMPUS HUB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={
                  user?.role === 'STUDENT'
                    ? '/student/dashboard'
                    : user?.role === 'TEACHER'
                    ? '/teacher/dashboard'
                    : '/educell/dashboard'
                }
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Register as Student
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold text-indigo-700 mb-6">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI-Powered Campus Event Discovery Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-tight">
            Never miss an opportunity on campus.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            <strong className="text-indigo-600">Eventra</strong> centralizes hackathons, technical
            workshops, placement drives, guest seminars, and cultural festivals with AI match
            recommendations and 1-click verified registrations.
          </p>

          {/* Role Access Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Get Started (Student)
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => handleQuickLogin('prof.ravi.kumar@campus.edu')}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <GraduationCap className="h-4 w-4" />
              Teacher Login (Demo)
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sac.coordinator@campus.edu')}
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              Edu Cell / SAC Login
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto rounded-2xl bg-slate-50 p-6 border border-slate-200">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">10+</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Live Campus Events</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">100%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Verified Registration</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">AI</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Skill Recommendations</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">Audit</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Tamper-Proof History</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Engineered for Students, Teachers & SAC Coordinators
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              A comprehensive campus ecosystem tailored with strict role permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Feature Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">For Students</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Discover events matching your skill set and department. 1-click apply with locked
                verified profiles, bookmark favorites, and set smart 24h/1h reminders.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Personalized Match Percentage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Real-time Application Status
                </li>
              </ul>
            </div>

            {/* Teacher Feature Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">For Teachers & Organizers</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Create and manage authorized departmental events with mandatory validation. Review
                student rosters, approve/reject applications, and broadcast schedule updates.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  Student Roster Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  Granular Event Change History
                </li>
              </ul>
            </div>

            {/* Edu Cell / SAC Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">For Edu Cell & SAC</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Broad event coordination oversight. Manage all teacher and SAC events, monitor
                campus-wide attendance stats, and review tamper-proof audit trails.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  Campus-wide Event Governance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  System Audit Logs & Analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Events Section */}
      <section className="py-16 bg-white border-t border-slate-200/80 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Explore Campus Events</h2>
              <p className="text-xs text-slate-500 mt-1">
                Browse upcoming workshops, hackathons, seminars, and drives.
              </p>
            </div>

            <Link
              to={isAuthenticated ? '/student/events' : '/login'}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Full Calendar →
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
              <p className="mt-2 text-xs font-medium">Fetching campus schedule...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No events found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(0, 6).map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">EVENTRA</span>
            <span className="text-xs text-slate-500">| Discover. Participate. Grow.</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Eventra Campus Management Platform. Built for University Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};
