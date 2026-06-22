import type { BulletEdit } from "../types";

export default function BulletDiff({ edits }: { edits: BulletEdit[] }) {
  if (edits.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        Suggested bullet edits
      </h3>
      <div className="space-y-4">
        {edits.map((edit, i) => (
          <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-red-50/60 px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm text-red-800/80 line-through leading-relaxed">
                {edit.original}
              </p>
            </div>
            <div className="bg-emerald-50/60 px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm text-emerald-900 leading-relaxed">
                {edit.revised}
              </p>
            </div>
            <div className="px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500 italic">{edit.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
