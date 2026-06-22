import { useEffect, useState } from "react";
import type { UserProfile } from "../types";
import { createProfile, getProfiles } from "../api";
import { migrateLocalData } from "../migration";

export default function ProfileSelector({
  onSelect,
}: {
  onSelect: (profile: UserProfile) => void;
}) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfiles()
      .then(migrateLocalData)
      .then((loadedProfiles) => {
        setProfiles(loadedProfiles);
        setCreating(loadedProfiles.length === 0);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load profiles")
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!name.trim() || !resume.trim()) return;
    setSaving(true);
    setError("");
    try {
      const profile = await createProfile({ name: name.trim(), resume: resume.trim() });
      setProfiles((current) => [...current, profile]);
      onSelect(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading your profiles...</div>;
  }

  if (creating) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Create your profile
        </h2>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dylan"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paste your base resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={14}
              placeholder="Paste your full resume here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm leading-relaxed resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim() || !resume.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
            {profiles.length > 0 && (
              <button
                onClick={() => setCreating(false)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Welcome back
      </h2>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-3 mb-6">
        {profiles.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelect(p)}
            className="w-full text-left px-5 py-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <span className="text-lg font-medium text-gray-900 group-hover:text-blue-700">
              {p.name}
            </span>
            <span className="block text-sm text-gray-500 mt-0.5 truncate">
              {p.resume.slice(0, 80)}...
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setCreating(true)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        + New profile
      </button>
    </div>
  );
}
