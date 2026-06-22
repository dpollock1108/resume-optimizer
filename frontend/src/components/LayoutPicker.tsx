import React from "react";
import type { Layout } from "../types";

const layouts: { id: Layout; name: string; desc: string }[] = [
  {
    id: "classic",
    name: "Classic",
    desc: "Chronological, single column, conservative formatting",
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Two-column header with skills sidebar",
  },
  {
    id: "compact",
    name: "Compact",
    desc: "Dense single-column optimized for ATS",
  },
];

function ClassicSVG() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fafafa" rx="2" />
      <rect x="30" y="10" width="60" height="6" rx="1" fill="#1a1a2e" />
      <rect x="35" y="20" width="50" height="3" rx="1" fill="#cbd5e1" />
      <line x1="10" y1="30" x2="110" y2="30" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="10" y="35" width="40" height="4" rx="1" fill="#1e3a5f" />
      <rect x="10" y="43" width="95" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="48" width="90" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="53" width="85" height="2.5" rx="1" fill="#94a3b8" />
      <line x1="10" y1="61" x2="110" y2="61" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="10" y="66" width="45" height="4" rx="1" fill="#1e3a5f" />
      <rect x="10" y="74" width="70" height="3" rx="1" fill="#334155" />
      <rect x="14" y="80" width="90" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="14" y="85" width="85" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="14" y="90" width="80" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="98" width="65" height="3" rx="1" fill="#334155" />
      <rect x="14" y="104" width="88" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="14" y="109" width="82" height="2.5" rx="1" fill="#94a3b8" />
      <line x1="10" y1="117" x2="110" y2="117" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="10" y="122" width="35" height="4" rx="1" fill="#1e3a5f" />
      <rect x="10" y="130" width="60" height="3" rx="1" fill="#334155" />
      <rect x="10" y="136" width="55" height="3" rx="1" fill="#334155" />
    </svg>
  );
}

function ModernSVG() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fafafa" rx="2" />
      <rect x="0" y="0" width="120" height="32" fill="#1e3a5f" rx="2" />
      <rect x="10" y="8" width="50" height="6" rx="1" fill="#ffffff" />
      <rect x="10" y="18" width="40" height="3" rx="1" fill="#93c5fd" />
      <rect x="70" y="10" width="40" height="3" rx="1" fill="#93c5fd" />
      <rect x="70" y="16" width="35" height="3" rx="1" fill="#93c5fd" />
      <rect x="70" y="22" width="38" height="3" rx="1" fill="#93c5fd" />
      <rect x="10" y="40" width="35" height="4" rx="1" fill="#2d5a88" />
      <rect x="10" y="48" width="65" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="53" width="60" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="58" width="55" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="80" y="40" width="30" height="4" rx="1" fill="#2d5a88" />
      {[48, 54, 60, 66, 72, 78].map((y) => (
        <g key={y}>
          <circle cx="84" cy={y + 1.5} r="1.5" fill="#3b82f6" />
          <rect x="88" y={y} width="22" height="3" rx="1" fill="#94a3b8" />
        </g>
      ))}
      <rect x="10" y="70" width="50" height="3" rx="1" fill="#334155" />
      <rect x="14" y="76" width="55" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="14" y="81" width="50" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="10" y="90" width="45" height="3" rx="1" fill="#334155" />
      <rect x="14" y="96" width="55" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="14" y="101" width="50" height="2.5" rx="1" fill="#94a3b8" />
      <line x1="10" y1="110" x2="110" y2="110" stroke="#e2e8f0" strokeWidth="0.5" />
      <rect x="10" y="115" width="35" height="4" rx="1" fill="#2d5a88" />
      <rect x="10" y="123" width="60" height="3" rx="1" fill="#334155" />
      <rect x="10" y="129" width="55" height="3" rx="1" fill="#334155" />
    </svg>
  );
}

function CompactSVG() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fafafa" rx="2" />
      <rect x="8" y="8" width="55" height="5" rx="1" fill="#111111" />
      <rect x="8" y="16" width="80" height="2" rx="0.5" fill="#94a3b8" />
      <line x1="8" y1="22" x2="112" y2="22" stroke="#111" strokeWidth="0.5" />
      <rect x="8" y="26" width="30" height="3" rx="1" fill="#111" />
      <rect x="8" y="32" width="100" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="8" y="36" width="98" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="8" y="40" width="95" height="2" rx="0.5" fill="#94a3b8" />
      <line x1="8" y1="46" x2="112" y2="46" stroke="#111" strokeWidth="0.5" />
      <rect x="8" y="50" width="35" height="3" rx="1" fill="#111" />
      <rect x="8" y="56" width="60" height="2.5" rx="0.5" fill="#334155" />
      <rect x="10" y="61" width="98" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="65" width="95" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="69" width="90" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="8" y="75" width="55" height="2.5" rx="0.5" fill="#334155" />
      <rect x="10" y="80" width="96" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="84" width="92" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="88" width="88" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="8" y="94" width="50" height="2.5" rx="0.5" fill="#334155" />
      <rect x="10" y="99" width="95" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="10" y="103" width="90" height="2" rx="0.5" fill="#94a3b8" />
      <line x1="8" y1="110" x2="112" y2="110" stroke="#111" strokeWidth="0.5" />
      <rect x="8" y="114" width="25" height="3" rx="1" fill="#111" />
      <rect x="8" y="120" width="100" height="2" rx="0.5" fill="#94a3b8" />
      <line x1="8" y1="126" x2="112" y2="126" stroke="#111" strokeWidth="0.5" />
      <rect x="8" y="130" width="30" height="3" rx="1" fill="#111" />
      <rect x="8" y="136" width="60" height="2" rx="0.5" fill="#94a3b8" />
      <rect x="8" y="140" width="55" height="2" rx="0.5" fill="#94a3b8" />
    </svg>
  );
}

const svgMap: Record<Layout, React.FC> = {
  classic: ClassicSVG,
  modern: ModernSVG,
  compact: CompactSVG,
  custom: ClassicSVG,
};

export default function LayoutPicker({
  selected,
  onSelect,
}: {
  selected: Layout;
  onSelect: (l: Layout) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose a layout
      </label>
      <div className="grid grid-cols-3 gap-4">
        {layouts.map((l) => {
          const SVG = svgMap[l.id];
          const active = selected === l.id;
          return (
            <button
              type="button"
              key={l.id}
              onClick={() => onSelect(l.id)}
              className={`group rounded-xl border-2 p-3 text-left transition-all ${
                active
                  ? "border-blue-500 bg-blue-50/60 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="aspect-[3/4] w-full mb-3 rounded-lg overflow-hidden border border-gray-100 bg-white shadow-inner">
                <SVG />
              </div>
              <p
                className={`text-sm font-semibold ${
                  active ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {l.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                {l.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
