import { useEffect, useState } from "react";
import {
  Monitor,
  Bell,
  Accessibility,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { getLastMatchResult } from "../../lib/api";
import { useIsMobile } from "../hooks/useIsMobile";

const ICON_MAP: Record<string, any> = {
  "Screen Reader": Monitor,
  screen: Monitor,
  audio: Monitor,
  "Visual alert": Bell,
  visual: Bell,
  caption: Bell,
  Ramp: Accessibility,
  kursi: Accessibility,
  Parkir: Accessibility,
  Workstation: Accessibility,
};
function getIcon(label: string) {
  const key = Object.keys(ICON_MAP).find((k) =>
    label.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? ICON_MAP[key] : Accessibility;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const stroke = 9;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
          }}
        >
          {Math.round(score)}%
        </span>
      </div>
    </div>
  );
}

function MiniScoreBar({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number | null;
  color: string;
  icon: any;
}) {
  const pct = value !== null ? Math.min(Math.max(value, 0), 100) : 0;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Icon size={14} color={color} strokeWidth={2} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "var(--color-surface-raised)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <div
        style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}
      >
        {value !== null ? `${value.toFixed(1)}%` : "—"}
      </div>
    </div>
  );
}

export function CandidateResults() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      try {
        const data = await getLastMatchResult();
        setResult(data.result);
      } catch (err) {
        console.error("Load match result:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div
        style={{
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          gap: 10,
          color: "var(--color-text-muted)",
        }}
      >
        <Loader2
          size={20}
          strokeWidth={1.5}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Memuat hasil matching...
      </div>
    );

  if (!result)
    return (
      <div style={{ padding: "32px", textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Belum ada hasil matching
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Lamar lowongan terlebih dahulu untuk melihat hasil analisis AI.
        </div>
      </div>
    );

  const {
    matchScore,
    gapSkills,
    matchedSkills,
    accommodations,
    wageStatus,
    umkValue,
    offeredSalary,
    wageGap,
    umkLabel,
    job,
    mlDetails,
  } = result;
  const isLayak = wageStatus === "LAYAK";
  const isMLSource =
    mlDetails &&
    (mlDetails.source === "ml_direct" || mlDetails.source === "ml");

  const formatRp = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // Gunakan data dari mlDetails jika tersedia, fallback ke data DB lama
  const displayGapSkills: string[] =
    mlDetails?.skillGap?.length > 0 ? mlDetails.skillGap : gapSkills || [];
  const displayMatchedSkills: string[] =
    mlDetails?.matchedSkills?.length > 0
      ? mlDetails.matchedSkills
      : matchedSkills || [];
  const displayAccommodations: string[] =
    mlDetails?.accommodationSuggestions?.length > 0
      ? mlDetails.accommodationSuggestions
      : accommodations || [];
  const displayScore =
    mlDetails?.finalScore !== null && mlDetails?.finalScore !== undefined
      ? mlDetails.finalScore
      : matchScore || 0;

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 26,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 4,
        }}
      >
        Hasil Matching
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        {isMLSource ? (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <Brain size={14} color="var(--color-primary)" strokeWidth={2} />
            Analisis AI (Semantic NLP) untuk lamaran kamu
          </span>
        ) : (
          "Analisis AI untuk lamaran kamu"
        )}
      </p>

      {/* Match Score Hero */}
      <div
        style={{
          background: "var(--color-primary)",
          borderRadius: "var(--radius-lg)",
          padding: isMobile ? "20px 16px" : "28px 32px",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 28,
          marginBottom: 16,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s ease",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ScoreRing score={displayScore} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Tingkat Kecocokan AI
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              fontWeight: 600,
              color: "white",
              marginBottom: 4,
            }}
          >
            {job?.title || "Posisi yang Dilamar"}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 12,
            }}
          >
            {job?.companyName} · {job?.location}
          </div>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {displayScore >= 80
              ? "🎯 Sangat cocok untuk posisi ini!"
              : displayScore >= 60
                ? "✨ Cukup cocok — kembangkan beberapa skill"
                : "📚 Perlu pengembangan skill lebih lanjut"}
          </span>
        </div>
      </div>

      {/* AI Score Breakdown - hanya tampil jika ada mlDetails */}
      {isMLSource && (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid var(--color-border)",
            marginBottom: 16,
            animation: "fadeIn 0.5s ease 0.1s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles
                size={16}
                color="var(--color-primary)"
                strokeWidth={2}
              />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                AI Score Breakdown
              </h3>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-subtle)",
                  marginTop: 1,
                }}
              >
                Powered by Sentence Transformers · NLP Semantic Analysis
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <MiniScoreBar
              label="Relevansi Deskripsi"
              value={mlDetails.semanticScore}
              color="var(--color-primary)"
              icon={Brain}
            />
            <MiniScoreBar
              label="Kecocokan Skill"
              value={mlDetails.skillMatchScore}
              color="#10b981"
              icon={TrendingUp}
            />
          </div>

          {/* Catatan formula scoring */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Shield
              size={12}
              color="var(--color-text-subtle)"
              strokeWidth={2}
            />
            <span style={{ fontSize: 11, color: "var(--color-text-subtle)" }}>
              Skor = 50% Relevansi Deskripsi + 50% Kecocokan Skill
            </span>
          </div>

          {/* AI Explanation */}
          {mlDetails.explanation && (
            <div
              style={{
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary-light)",
                border: "1px solid rgba(18,116,122,0.15)",
              }}
            >
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <Brain
                  size={15}
                  color="var(--color-primary)"
                  strokeWidth={2}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    Analisis AI
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {mlDetails.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matched Skills */}
      {displayMatchedSkills.length > 0 && (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
            border: "1px solid var(--color-border)",
            marginBottom: 16,
            animation: "fadeIn 0.5s ease 0.15s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <CheckCircle2
              size={18}
              color="var(--color-success)"
              strokeWidth={1.5}
            />
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 17,
                fontWeight: 600,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Skill yang Kamu Miliki
            </h3>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {displayMatchedSkills.map((skill: string) => (
              <span
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid #bbf7d0",
                }}
              >
                <span style={{ fontSize: 12 }}>✓</span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gap */}
      {displayGapSkills.length > 0 && (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
            border: "1px solid var(--color-border)",
            marginBottom: 16,
            animation: "fadeIn 0.5s ease 0.2s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <AlertCircle
              size={18}
              color="var(--color-warning)"
              strokeWidth={1.5}
            />
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 17,
                fontWeight: 600,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Skill yang Perlu Dikembangkan
            </h3>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {displayGapSkills.map((skill: string) => (
              <span
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "#fef3c7",
                  color: "var(--color-warning)",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid #fde68a",
                }}
              >
                <span style={{ fontSize: 12 }}>!</span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accommodations */}
      {displayAccommodations.length > 0 && (
        <div
          style={{
            background: "var(--color-primary-light)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
            border: "1px solid rgba(18,116,122,0.2)",
            marginBottom: 16,
            animation: "fadeIn 0.5s ease 0.25s both",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--color-text)",
              margin: "0 0 18px",
            }}
          >
            Rekomendasi Akomodasi Kantor
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {displayAccommodations.map((label: string) => {
              const Icon = getIcon(label);
              return (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={18}
                      color="var(--color-primary)"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wage Guard */}
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--color-border)",
          animation: "fadeIn 0.5s ease 0.3s both",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-text)",
            margin: "0 0 20px",
          }}
        >
          Smart Wage Guard
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr",
            marginBottom: 16,
            gap: isMobile ? 12 : 0,
          }}
        >
          <div style={{ paddingRight: isMobile ? 0 : 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-subtle)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 6,
              }}
            >
              {umkLabel || "UMK 2026"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {formatRp(umkValue)}
            </div>
          </div>
          {!isMobile && <div style={{ background: "var(--color-border)" }} />}
          <div style={{ paddingLeft: isMobile ? 0 : 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-subtle)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 6,
              }}
            >
              Gaji Ditawarkan
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {formatRp(offeredSalary)}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "var(--radius-full)",
            textAlign: "center",
            background: isLayak ? "#dcfce7" : "#fee2e2",
            color: isLayak ? "var(--color-success)" : "var(--color-danger)",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 10,
            border: `1px solid ${isLayak ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {isLayak
            ? "✓ LAYAK — Memenuhi Standar UMP/UMK"
            : `✗ TIDAK LAYAK — Di bawah ${formatRp(wageGap)} dari standar`}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-subtle)",
            textAlign: "center",
          }}
        >
          Berdasarkan UMP/UMK 2026 · Peraturan Gubernur
        </div>
      </div>
    </div>
  );
}
