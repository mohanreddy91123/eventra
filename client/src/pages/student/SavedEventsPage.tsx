import React, { useEffect, useState } from 'react';
import { bookmarkService } from '../../services/bookmarkService.js';
import { CampusEvent } from '../../types/index.js';
import { EventCard } from '../../components/common/EventCard.js';
import { ApplicationModal } from '../../components/common/ApplicationModal.js';
import { ReminderModal } from '../../components/common/ReminderModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Bookmark, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedEventsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [bookmarks, setBookmarks] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedForApply, setSelectedForApply] = useState<CampusEvent | null>(null);
  const [selectedForReminder, setSelectedForReminder] = useState<CampusEvent | null>(null);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const res = await bookmarkService.getMyBookmarks();
      setBookmarks(res.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Bookmark className="h-7 w-7 text-amber-500 fill-amber-500" />
          Saved Events
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Your bookmarked opportunities and upcoming campus events.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading saved bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No saved events yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the bookmark icon on any event card to save it here for quick access later.
          </p>
          <Link
            to="/student/events"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Compass className="h-4 w-4" />
            Discover Campus Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onApplyClick={(ev) => setSelectedForApply(ev)}
              onReminderClick={(ev) => setSelectedForReminder(ev)}
              onBookmarkToggle={() => fetchBookmarks()}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <ApplicationModal
        isOpen={!!selectedForApply}
        onClose={() => setSelectedForApply(null)}
        event={selectedForApply}
        user={user}
        profile={profile}
        onSuccess={() => fetchBookmarks()}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={!!selectedForReminder}
        onClose={() => setSelectedForReminder(null)}
        event={selectedForReminder}
        onSuccess={() => fetchBookmarks()}
      />
    </div>
  );
};
