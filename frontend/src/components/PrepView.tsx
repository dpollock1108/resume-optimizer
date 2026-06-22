import { useState } from "react";
import type { Application, InterviewPrep, UserProfile } from "../types";
import { generatePrep } from "../api";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        {icon}
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function GapCard({
  gap,
}: {
  gap: InterviewPrep["knowledge_gaps"][0];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-amber-200 bg-amber-50/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
      >
        <div>
          <span className="text-sm font-semibold text-amber-900">{gap.topic}</span>
          <p className="text-xs text-amber-700 mt-0.5">{gap.why_it_matters}</p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`text-amber-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 border-t border-amber-200">
          <div className="flex flex-wrap gap-1.5 pt-2">
            {gap.key_concepts.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-md font-medium"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-sm text-amber-900/80 leading-relaxed">{gap.quick_study}</p>
        </div>
      )}
    </div>
  );
}

export default function PrepView({
  app,
  profile,
  onPrepGenerated,
}: {
  app: Application;
  profile: UserProfile;
  onPrepGenerated: (prep: InterviewPrep) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const prep = await generatePrep({
        resume: profile.resume,
        job_posting: app.job_posting,
        company: app.company,
        role: app.role,
      });
      onPrepGenerated(prep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate prep");
    } finally {
      setLoading(false);
    }
  }

  if (!app.prep) {
    return (
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 text-center">
        <h4 className="text-sm font-semibold text-blue-900 mb-1">Interview Prep</h4>
        <p className="text-xs text-blue-700 mb-3">
          Generate a personalized prep guide with likely questions, talking points, and knowledge gap briefings.
        </p>
        {error && (
          <p className="text-xs text-red-600 mb-2">{error}</p>
        )}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Generating...
            </>
          ) : (
            "Generate Prep Guide"
          )}
        </button>
      </div>
    );
  }

  const prep = app.prep;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Interview Prep</h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      <Section
        title="Company Overview"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="#6b7280" strokeWidth="1.2" />
            <path d="M5 4V2.5C5 1.95 5.45 1.5 6 1.5H10C10.55 1.5 11 1.95 11 2.5V4" stroke="#6b7280" strokeWidth="1.2" />
          </svg>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">{prep.company_overview}</p>
      </Section>

      <Section
        title="What This Role Really Is"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#6b7280" strokeWidth="1.2" />
            <path d="M8 5V8.5L10.5 10" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">{prep.role_breakdown}</p>
      </Section>

      <Section
        title="Likely Interview Questions"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#6b7280" strokeWidth="1.2" />
            <path d="M6 6.5C6 5.67 6.9 5 8 5C9.1 5 10 5.67 10 6.5C10 7.33 9.1 8 8 8V9" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.5" fill="#6b7280" />
          </svg>
        }
      >
        <ol className="space-y-2">
          {prep.likely_questions.map((q, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-700">
              <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-5 text-right">
                {i + 1}.
              </span>
              <span className="leading-relaxed">{q}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Your Talking Points"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4H13M3 8H10M3 12H7" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        }
      >
        <ul className="space-y-2">
          {prep.talking_points.map((tp, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-emerald-500 mt-1 shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="leading-relaxed">{tp}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="border border-amber-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14.5 13H1.5L8 2Z" stroke="#92400e" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M8 6.5V9.5M8 11V11.5" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <h4 className="text-sm font-semibold text-amber-900">Knowledge Gaps — Quick 101s</h4>
        </div>
        <div className="p-3 space-y-2">
          {prep.knowledge_gaps.map((gap) => (
            <GapCard key={gap.topic} gap={gap} />
          ))}
        </div>
      </div>

      <Section
        title="Culture & Presentation Notes"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="2.5" stroke="#6b7280" strokeWidth="1.2" />
            <path d="M3.5 13.5C3.5 11 5.5 9 8 9C10.5 9 12.5 11 12.5 13.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">{prep.culture_notes}</p>
      </Section>
    </div>
  );
}
