import { useEffect, useState } from "react";
import type { Application, ApplicationStatus, UserProfile } from "../types";
import { getApplications, updateApplication, deleteApplication } from "../store";
import PrepView from "../components/PrepView";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "screening", label: "Screening", color: "bg-purple-100 text-purple-800" },
  { value: "interviewing", label: "Interviewing", color: "bg-amber-100 text-amber-800" },
  { value: "offer", label: "Offer", color: "bg-emerald-100 text-emerald-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-600" },
];

function statusBadge(status: ApplicationStatus) {
  const s = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationsPage({
  profile,
  onBack,
  onApplicationDeleted,
}: {
  profile: UserProfile;
  onBack: () => void;
  onApplicationDeleted: () => void;
}) {
  const [apps, setApps] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((applications) =>
        setApps(applications.filter((application) => application.profile_id === profile.id))
      )
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load applications")
      )
      .finally(() => setLoading(false));
  }, [profile.id]);

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    const previous = apps;
    setApps((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status } : application
      )
    );
    try {
      await updateApplication(id, { status });
    } catch (err) {
      setApps(previous);
      setError(err instanceof Error ? err.message : "Could not update status");
    }
  }

  function handleNotesChange(id: string, notes: string) {
    setApps((current) =>
      current.map((application) =>
        application.id === id ? { ...application, notes } : application
      )
    );
  }

  async function saveNotes(id: string, notes: string) {
    try {
      await updateApplication(id, { notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save notes");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteApplication(id);
      setApps((current) => current.filter((application) => application.id !== id));
      onApplicationDeleted();
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove application");
    }
  }

  async function handlePrepUpdate(id: string, prep: Application["prep"]) {
    setApps((current) =>
      current.map((application) =>
        application.id === id ? { ...application, prep } : application
      )
    );
    try {
      await updateApplication(id, { prep });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save interview prep");
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading applications...</div>;
  }

  if (apps.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="6" width="20" height="16" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M4 10H24" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M10 6V4M18 6V4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
        <p className="text-gray-500 mb-6">
          Run a resume analysis to automatically track your first application.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Analyze a Job Posting
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Applications</h2>
        <span className="text-sm text-gray-500">
          {apps.length} application{apps.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {apps.map((app) => {
          const isExpanded = expandedId === app.id;
          return (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-semibold text-gray-900 truncate">
                      {app.role}
                    </span>
                    {statusBadge(app.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{app.company}</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatDate(app.date_applied)}</span>
                    <span className="text-gray-300">|</span>
                    <span>Match {app.match_score}%</span>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                  {/* Status + actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleStatusChange(app.id, opt.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          app.status === opt.value
                            ? `${opt.color} border-current`
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Scores */}
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-center">
                      <span className="block text-lg font-bold text-gray-900">{app.match_score}</span>
                      <span className="text-xs text-gray-500">Match</span>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-center">
                      <span className="block text-lg font-bold text-gray-900">{app.ats_score}</span>
                      <span className="text-xs text-gray-500">ATS</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={app.notes}
                      onChange={(e) => handleNotesChange(app.id, e.target.value)}
                      onBlur={(e) => saveNotes(app.id, e.target.value)}
                      rows={2}
                      placeholder="Interview date, contact name, follow-up reminders..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                    />
                  </div>

                  {/* Job posting (collapsible) */}
                  <details className="group">
                    <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900">
                      View job posting
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {app.job_posting}
                    </pre>
                  </details>

                  {/* Interview prep */}
                  <PrepView
                    app={app}
                    profile={profile}
                    onPrepGenerated={(prep) => {
                      handlePrepUpdate(app.id, prep);
                    }}
                  />

                  {/* Delete */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleDelete(app.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Remove application
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
