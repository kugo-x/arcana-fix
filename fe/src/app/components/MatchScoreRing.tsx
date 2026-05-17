interface MatchScoreRingProps {
  score: number;
  size?: number;
  trackColor?: string;
  strokeColor?: string;
  textColor?: string;
}

export function MatchScoreRing({
  score,
  size = 140,
  trackColor = "rgba(255,255,255,0.2)",
  strokeColor = "white",
  textColor = "white",
}: MatchScoreRingProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={strokeColor} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: size * 0.22, fontWeight: 700, color: textColor, lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: size * 0.09, color: textColor, opacity: 0.75, marginTop: 2 }}>cocok</span>
      </div>
    </div>
  );
}
