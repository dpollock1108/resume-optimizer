import { useState } from "react";

export default function CopyBlock({
  title,
  text,
  accent,
}: {
  title: string;
  text: string;
  accent?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`rounded-xl border p-5 ${
        accent
          ? "bg-blue-50/60 border-blue-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button
          onClick={copy}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9.5 4.5V3.5C9.5 2.95 9.05 2.5 8.5 2.5H3.5C2.95 2.5 2.5 2.95 2.5 3.5V8.5C2.5 9.05 2.95 9.5 3.5 9.5H4.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}
