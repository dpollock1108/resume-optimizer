import type { Layout } from "../types";
import { exportDocx } from "../api";
import { useState } from "react";

function ClassicPreview({ text }: { text: string }) {
  return (
    <div className="font-serif text-[13px] leading-[1.55] text-gray-800">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />;
        const isHeading =
          (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.startsWith("•")) ||
          (trimmed.length < 40 && !/[.,;:•\-*]/.test(trimmed));
        if (isHeading)
          return (
            <div key={i} className="mt-4 mb-1 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5">
              {trimmed}
            </div>
          );
        if (trimmed.startsWith("•") || trimmed.startsWith("-"))
          return (
            <div key={i} className="pl-4 flex gap-1.5">
              <span className="text-gray-400">&#x2022;</span>
              <span>{trimmed.replace(/^[•\-*]\s*/, "")}</span>
            </div>
          );
        return <div key={i}>{trimmed}</div>;
      })}
    </div>
  );
}

function ModernPreview({ text }: { text: string }) {
  return (
    <div className="font-sans text-[13px] leading-[1.55] text-gray-800">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2.5" />;
        const isHeading =
          (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.startsWith("•")) ||
          (trimmed.length < 40 && !/[.,;:•\-*]/.test(trimmed));
        if (isHeading)
          return (
            <div key={i} className="mt-3.5 mb-1 text-sm font-bold text-blue-800 uppercase tracking-wider">
              {trimmed}
            </div>
          );
        if (trimmed.startsWith("•") || trimmed.startsWith("-"))
          return (
            <div key={i} className="pl-4 flex gap-1.5">
              <span className="text-blue-400">&#x25B8;</span>
              <span>{trimmed.replace(/^[•\-*]\s*/, "")}</span>
            </div>
          );
        return <div key={i}>{trimmed}</div>;
      })}
    </div>
  );
}

function CompactPreview({ text }: { text: string }) {
  return (
    <div className="font-sans text-[12px] leading-[1.45] text-gray-900">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const isHeading =
          (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.startsWith("•")) ||
          (trimmed.length < 40 && !/[.,;:•\-*]/.test(trimmed));
        if (isHeading)
          return (
            <div key={i} className="mt-2.5 mb-0.5 text-xs font-bold text-gray-900 uppercase border-b border-gray-800 pb-px">
              {trimmed}
            </div>
          );
        if (trimmed.startsWith("•") || trimmed.startsWith("-"))
          return (
            <div key={i} className="pl-3 flex gap-1">
              <span className="text-gray-500">&#x2022;</span>
              <span>{trimmed.replace(/^[•\-*]\s*/, "")}</span>
            </div>
          );
        return <div key={i}>{trimmed}</div>;
      })}
    </div>
  );
}

const renderers: Record<string, React.FC<{ text: string }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  compact: CompactPreview,
};

export default function ResumePreview({
  text,
  layout,
  name,
}: {
  text: string;
  layout: Layout;
  name: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const Renderer = renderers[layout] || ClassicPreview;

  async function handleDownload() {
    setDownloading(true);
    try {
      await exportDocx({ tailored_resume: text, layout, name });
    } catch {
      alert("Export failed. Is the backend running?");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-800">
          Tailored Resume &mdash;{" "}
          <span className="capitalize">{layout}</span> Layout
        </h3>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V9M7 9L4.5 6.5M7 9L9.5 6.5M2.5 11.5H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {downloading ? "Exporting..." : "Download .docx"}
        </button>
      </div>
      <div className="p-8 max-h-[600px] overflow-y-auto">
        <div className="max-w-[540px] mx-auto bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.08)] rounded-lg p-8">
          <Renderer text={text} />
        </div>
      </div>
    </div>
  );
}
