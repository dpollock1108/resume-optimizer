function scoreColor(score: number) {
  if (score >= 75) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", ring: "stroke-emerald-500" };
  if (score >= 50) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", ring: "stroke-amber-500" };
  return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", ring: "stroke-red-500" };
}

export default function ScoreCard({
  label,
  before,
  after,
  subtitle,
}: {
  label: string;
  before?: number;
  after: number;
  subtitle: string;
}) {
  const c = scoreColor(after);
  const circumference = 2 * Math.PI * 36;
  const afterOffset = circumference - (after / 100) * circumference;
  const beforeOffset = before !== undefined ? circumference - (before / 100) * circumference : circumference;
  const delta = before !== undefined ? after - before : undefined;

  return (
    <div
      className={`${c.bg} ${c.border} border rounded-xl p-5 flex flex-col items-center`}
    >
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        {before !== undefined && (
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={beforeOffset}
          />
        )}
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          className={c.ring}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={afterOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <span className={`text-2xl font-bold ${c.text} -mt-15`}>{after}</span>
      <span className="text-sm font-semibold text-gray-800 mt-5">{label}</span>
      <span className="text-xs text-gray-500 mt-0.5">{subtitle}</span>
      {delta !== undefined && (
        <span
          className={`text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-full ${
            delta > 0
              ? "bg-emerald-100 text-emerald-700"
              : delta === 0
              ? "bg-gray-100 text-gray-500"
              : "bg-red-100 text-red-700"
          }`}
        >
          {before} → {after}{" "}
          ({delta > 0 ? "+" : ""}{delta})
        </span>
      )}
    </div>
  );
}
