import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { eventService } from '../../services/eventService.js';
import { CampusEvent, EventCategory } from '../../types/index.js';
import { EventCard } from '../../components/common/EventCard.js';
import { ApplicationModal } from '../../components/common/ApplicationModal.js';
import { ReminderModal } from '../../components/common/ReminderModal.js';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Compass,
  X,
} from 'lucide-react';

export const EventDiscoveryPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('ALL');
  const [department, setDepartment] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'match' | 'popular'>('date');

  // Modals
  const [selectedForApply, setSelectedForApply] = useState<CampusEvent | null>(null);
  const [selectedForReminder, setSelectedForReminder] = useState<CampusEvent | null>(null);

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

  const departments = [
    'ALL',
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Management Studies (MBA)',
  ];

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getEvents({
        search,
        category,
        department,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, department, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'match') {
      return (b.match_score || 0) - (a.match_score || 0);
    }
    if (sortBy === 'popular') {
      return (b.applications_count || 0) - (a.applications_count || 0);
    }
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Compass className="h-7 w-7 text-indigo-600" />
          Campus Event Discovery
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Find and apply to hackathons, workshops, placement drives, and cultural festivals across campus.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, organizer, location, or keywords..."
              className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchEvents();
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategory('ALL')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              category === 'ALL'
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
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters: Department, Dates, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Target Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
            >
              <option value="date">Date: Soonest First</option>
              <option value="match">AI Match: Highest %</option>
              <option value="popular">Popularity: Most Applied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading campus opportunities...</p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Compass className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching campus events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing date filters, or selecting All Categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setDepartment('ALL');
              setStartDate('');
              setEndDate('');
            }}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500">
            Showing {sortedEvents.length} active events
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onApplyClick={(ev) => setSelectedForApply(ev)}
                onReminderClick={(ev) => setSelectedForReminder(ev)}
                onBookmarkToggle={() => fetchEvents()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply Confirmation Modal */}
      <ApplicationModal
        isOpen={!!selectedForApply}
        onClose={() => setSelectedForApply(null)}
        event={selectedForApply}
        user={user}
        profile={profile}
        onSuccess={() => fetchEvents()}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={!!selectedForReminder}
        onClose={() => setSelectedForReminder(null)}
        event={selectedForReminder}
        onSuccess={() => fetchEvents()}
      />
    </div>
  );
};
