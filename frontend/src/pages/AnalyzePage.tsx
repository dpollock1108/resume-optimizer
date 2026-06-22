import { useState } from "react";
import type { UserProfile, Layout, AnalysisResult } from "../types";
import { analyzeResume } from "../api";
import LayoutPicker from "../components/LayoutPicker";

export default function AnalyzePage({
  profile,
  onResult,
  onBack,
  onViewApplications,
  appCount,
}: {
  profile: UserProfile;
  onResult: (result: AnalysisResult, layout: Layout, company: string, role: string, jobPosting: string) => Promise<void>;
  onBack: () => void;
  onViewApplications: () => void;
  appCount: number;
}) {
  const [jobPosting, setJobPosting] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [layout, setLayout] = useState<Layout>("classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobPosting.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeResume({
        resume: profile.resume,
        job_posting: jobPosting,
        notes: notes || undefined,
        output_format: layout,
      });
      await onResult(result, layout, company.trim(), role.trim(), jobPosting.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1 flex items-center gap-1 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Switch profile
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            Hi {profile.name}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {appCount > 0 && (
            <button
              type="button"
              onClick={onViewApplications}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5.5 3V1.5M10.5 3V1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Applications ({appCount})
            </button>
          )}
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Resume loaded</span>
            <span className="text-sm text-gray-600 truncate block max-w-[200px]">
              {profile.resume.slice(0, 50)}...
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role / title
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Job posting
          </label>
          <textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            rows={10}
            placeholder="Paste the full job description here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm leading-relaxed resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional notes{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. 'Emphasize leadership experience' or 'I don't have the required certification yet'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm leading-relaxed resize-y"
          />
        </div>

        <LayoutPicker selected={layout} onSelect={setLayout} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !jobPosting.trim()}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Analyzing...
            </>
          ) : (
            "Analyze & Tailor"
          )}
        </button>
      </form>
    </div>
  );
}
