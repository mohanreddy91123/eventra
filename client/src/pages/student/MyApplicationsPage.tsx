import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService.js';
import { Application } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { FileCheck2, Calendar, MapPin, ArrowUpRight, Compass, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationService.getMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="h-7 w-7 text-indigo-600" />
          My Event Registrations
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Your active and confirmed campus event registrations. All registrations are direct and confirmed with no approval required.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading your registrations roster...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <FileCheck2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No event registrations yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Discover upcoming hackathons, workshops, and placement drives to register instantly in 1-click.
          </p>
          <Link
            to="/student/events"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Compass className="h-4 w-4" />
            Explore Campus Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500">
            Total Confirmed Registrations: {applications.length}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {app.event_category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Registration Confirmed
                    </span>
                  </div>

                  <Link
                    to={`/student/events/${app.event_id}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 block transition-colors"
                  >
                    {app.event_title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Event Date: {app.event_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {app.event_location}
                    </span>
                    <span className="text-slate-400">
                      Registered: {format(new Date(app.applied_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/student/events/${app.event_id}`}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    View Event Details
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
