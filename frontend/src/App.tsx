import { useState } from "react";
import type { UserProfile, Layout, AnalysisResult } from "./types";
import { addApplication } from "./store";
import { getApplications } from "./store";
import ProfileSelector from "./components/ProfileSelector";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import ApplicationsPage from "./pages/ApplicationsPage";

type View = "profile" | "analyze" | "results" | "applications";

export default function App() {
  const [view, setView] = useState<View>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [layout, setLayout] = useState<Layout>("classic");
  const [applicationSaved, setApplicationSaved] = useState(false);
  const [appCount, setAppCount] = useState(0);

  async function handleProfileSelect(p: UserProfile) {
    setProfile(p);
    setView("analyze");
    try {
      const applications = await getApplications();
      setAppCount(applications.filter((application) => application.profile_id === p.id).length);
    } catch {
      setAppCount(0);
    }
  }

  async function handleResult(
    r: AnalysisResult,
    l: Layout,
    company: string,
    role: string,
    jobPosting: string
  ) {
    setResult(r);
    setLayout(l);

    await addApplication({
      id: crypto.randomUUID(),
      profile_id: profile!.id,
      profile_name: profile!.name,
      company: company || "Unknown Company",
      role: role || "Unknown Role",
      job_posting: jobPosting,
      status: "applied",
      date_applied: new Date().toISOString(),
      match_score: r.match_score,
      ats_score: r.ats_score,
      tailored_resume: r.tailored_resume,
      layout: l,
      notes: "",
    });

    setAppCount((current) => current + 1);
    setApplicationSaved(true);
    setView("results");
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => profile && setView("analyze")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 3H14M4 7H14M4 11H10M4 15H8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              Resume Optimizer
            </h1>
          </button>
          {profile && view !== "profile" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("applications")}
                className={`text-sm font-medium transition-colors ${
                  view === "applications"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Applications{appCount > 0 ? ` (${appCount})` : ""}
              </button>
              <span className="text-sm text-gray-400">
                {profile.name}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {view === "profile" && (
          <ProfileSelector onSelect={handleProfileSelect} />
        )}
        {view === "analyze" && profile && (
          <AnalyzePage
            profile={profile}
            onResult={handleResult}
            onBack={() => setView("profile")}
            onViewApplications={() => setView("applications")}
            appCount={appCount}
          />
        )}
        {view === "results" && result && profile && (
          <ResultsPage
            result={result}
            layout={layout}
            name={profile.name}
            onBack={() => {
              setApplicationSaved(false);
              setView("analyze");
            }}
            onViewApplications={() => setView("applications")}
            applicationSaved={applicationSaved}
          />
        )}
        {view === "applications" && profile && (
          <ApplicationsPage
            profile={profile}
            onBack={() => setView("analyze")}
            onApplicationDeleted={() => setAppCount((current) => Math.max(0, current - 1))}
          />
        )}
      </main>
    </div>
  );
}
