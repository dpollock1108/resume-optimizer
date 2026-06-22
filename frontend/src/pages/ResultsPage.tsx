import type { AnalysisResult, Layout } from "../types";
import ScoreCard from "../components/ScoreCard";
import KeywordChips from "../components/KeywordChips";
import CopyBlock from "../components/CopyBlock";
import BulletDiff from "../components/BulletDiff";
import ResumePreview from "../components/ResumePreview";

export default function ResultsPage({
  result,
  layout,
  name,
  onBack,
  onViewApplications,
  applicationSaved,
}: {
  result: AnalysisResult;
  layout: Layout;
  name: string;
  onBack: () => void;
  onViewApplications: () => void;
  applicationSaved: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <div className="flex gap-3">
          {applicationSaved && (
            <button
              onClick={onViewApplications}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
            >
              View Applications
            </button>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      {applicationSaved && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 4.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-emerald-800">
            Application saved to your tracker. Generate interview prep from the Applications page.
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <ScoreCard label="Match" before={result.before_match_score} after={result.match_score} subtitle="Keyword match %" />
          <ScoreCard label="ATS" before={result.before_ats_score} after={result.ats_score} subtitle="Pass likelihood" />
          <ScoreCard label="Effort" after={result.effort_score} subtitle="Resume reusability" />
        </div>

        <KeywordChips matched={result.matched_keywords} missing={result.missing_keywords} />

        <CopyBlock title="Tailored Summary" text={result.tailored_summary} accent />

        <BulletDiff edits={result.bullet_edits} />

        <CopyBlock title="Cover Letter Opener" text={result.cover_opener} />

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14.5 13H1.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M8 6.5V9.5M8 11V11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Strategic Note
          </h3>
          <p className="text-sm text-amber-900/80 leading-relaxed">
            {result.strategic_note}
          </p>
        </div>

        <ResumePreview text={result.tailored_resume} layout={layout} name={name} />
      </div>
    </div>
  );
}
