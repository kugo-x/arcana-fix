import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle,
  BarChart2,
  Users,
  Lock,
  Menu,
  X,
  Zap,
  FileText,
  Building2,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { useIsMobile } from "../hooks/useIsMobile";

/* ─────────────────────────────────────────────────────────────────
   All colors reference CSS variables from theme.css.
   The dark "companies" section uses var(--color-text) #1a1a1a
   as a full-bleed background — this is the system's Near Black.
   ───────────────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── UMK data for the ticker ──────────────────────────────────────── */
const UMK_DATA = [
  { city: "Jakarta", value: "Rp 5.067.381" },
  { city: "Surabaya", value: "Rp 4.725.479" },
  { city: "Bandung", value: "Rp 4.209.309" },
  { city: "Bekasi", value: "Rp 5.126.897" },
  { city: "Semarang", value: "Rp 3.454.827" },
  { city: "Medan", value: "Rp 3.718.652" },
  { city: "Yogyakarta", value: "Rp 2.492.731" },
];

/* ── Scroll reveal ────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-56px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Tentang", id: "tentang" },
  { label: "Fitur", id: "fitur" },
  { label: "Perusahaan", id: "perusahaan" },
];

function Navbar({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(248,247,244,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "0 24px" : "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <img
            src="/logo.png"
            alt="Arcana Logo"
            style={{
              height: 48,
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </button>

        {!isMobile && (
          <>
            <div style={{ display: "flex", gap: 32 }}>
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                    padding: "4px 0",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  padding: "6px 0",
                }}
              >
                Masuk
              </button>
              <motion.button
                onClick={() => navigate("/register")}
                whileHover={{ background: "var(--color-primary-dark)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "7px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  transition: "background 0.15s",
                }}
              >
                Registrasi
              </motion.button>
            </div>
          </>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "flex",
            }}
          >
            {menuOpen ? (
              <X size={20} color="var(--color-text)" />
            ) : (
              <Menu size={20} color="var(--color-text)" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: "hidden",
              background: "var(--color-surface)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                padding: "16px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    color: "var(--color-text-muted)",
                    fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    padding: "10px 0",
                    textAlign: "left",
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    background: "var(--color-primary)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Registrasi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── UMK Ticker ───────────────────────────────────────────────────── */
function UMKTicker() {
  const items = [...UMK_DATA, ...UMK_DATA, ...UMK_DATA];
  return (
    <div
      style={{
        background: "var(--color-primary)",
        overflow: "hidden",
        borderTop: "1px solid var(--color-primary-dark)",
        borderBottom: "1px solid var(--color-primary-dark)",
      }}
    >
      <style>{`
        @keyframes lp-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 48,
          gap: 0,
        }}
      >
        {/* Label */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 20px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            background: "var(--color-primary-dark)",
            gap: 8,
            zIndex: 2,
          }}
        >
          <ShieldCheck size={13} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
            }}
          >
            UMK 2026
          </span>
        </div>

        {/* Scrolling track */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              animation: "lp-marquee 38s linear infinite",
              width: "max-content",
            }}
          >
            {items.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  padding: "0 28px",
                  height: 48,
                  borderRight: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "var(--font-body)",
                    marginRight: 8,
                  }}
                >
                  {d.city}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.1px",
                  }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Section ─────────────────────────────────────────────────── */
function HeroSection({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <section
      style={{
        background: "var(--color-bg)",
        paddingTop: 64,
      }}
    >
      {/* Top meta strip */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: isMobile ? "16px 24px" : "16px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Platform Inklusif · Indonesia · 2026
        </span>
        {!isMobile && (
          <span
            style={{
              fontSize: 11,
              color: "var(--color-text-subtle)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.5px",
            }}
          >
            Sesuai UU No. 8 / 2016 · AI-Powered Matching
          </span>
        )}
      </div>

      {/* Main hero body */}
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "56px 24px 64px" : "80px 48px 96px",
          display: isMobile ? "flex" : "grid",
          gridTemplateColumns: "1fr 1fr",
          flexDirection: isMobile ? "column" : undefined,
          alignItems: isMobile ? "flex-start" : "flex-start",
          gap: isMobile ? 48 : 64,
        }}
      >
        {/* Left — the headline */}
        <motion.div
          style={{ minWidth: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isMobile
                ? "clamp(36px, 10vw, 56px)"
                : "clamp(48px, 6vw, 80px)",
              fontWeight: 700,
              color: "var(--color-text)",
              lineHeight: 1.05,
              margin: "0 0 40px",
              letterSpacing: "-0.3px",
            }}
          >
            Rekrutmen
            <br />
            <span
              style={{
                color: "var(--color-primary)",
              }}
            >
              inklusif
            </span>{" "}
            &amp;
            <br />
            upah adil.
          </motion.h1>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 360,
            }}
          >
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{
                background: "var(--color-primary-dark)",
                boxShadow: "0 4px 12px rgba(18,116,122,0.20)",
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
              }}
            >
              Mulai sebagai Kandidat
              <ArrowRight size={16} strokeWidth={1.5} />
            </motion.button>

            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ borderColor: "var(--color-border-strong)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "border-color 0.15s",
              }}
            >
              Untuk Perusahaan
              <ArrowRight size={16} strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right — descriptor column */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          style={{
            minWidth: 0,
            paddingTop: isMobile ? 0 : 8,
          }}
        >
          <p
            style={{
              fontSize: 17,
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              fontFamily: "var(--font-body)",
              margin: "0 0 32px",
              fontWeight: 400,
            }}
          >
            Platform pertama di Indonesia yang menggabungkan rekrutmen
            disabilitas berbasis AI dengan validasi upah otomatis UMP/UMK
            2026.
          </p>

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {[
              { num: "< 0.05%", label: "Serapan TK disabilitas kini" },
              { num: "1–2%", label: "Kuota wajib belum terpenuhi" },
            ].map((s) => (
              <div key={s.num}>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 20,
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[
              "Gratis mendaftar",
              "Tanpa kartu kredit",
              "Sesuai UU No. 8/2016",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <CheckCircle
                  size={14}
                  color="var(--color-primary)"
                  strokeWidth={1.5}
                />
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* UMK Ticker — anchored to bottom of hero */}
      <UMKTicker />
    </section>
  );
}

/* ── App Dashboard Mockup ─────────────────────────────────────────── */
const CANDIDATES = [
  { init: "DS", name: "Dewi Sartika", role: "Staf Admin", match: 92, color: "#16a34a" },
  { init: "AR", name: "Arif Rahman", role: "Data Entry", match: 87, color: "#16a34a" },
  { init: "NF", name: "Nadia Fitri", role: "Customer Service", match: 81, color: "#ca8a04" },
  { init: "BP", name: "Budi Prasetyo", role: "Operator Produksi", match: 76, color: "#ca8a04" },
  { init: "SN", name: "Siti Nuraeni", role: "Staf Keuangan", match: 71, color: "#ca8a04" },
  { init: "RP", name: "Rizki Putra", role: "Teknisi IT", match: 64, color: "#9ca3af" },
];

function AppDashboardMockup() {
  const [selected, setSelected] = useState(1);
  const sel = CANDIDATES[selected];

  return (
    <div
      style={{
        height: "100%",
        background: "#0D1117",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 40,
          background: "#161B22",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 320,
            height: 24,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>🔒</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.30)" }}>
            inklusikeja.id/perusahaan/kandidat
          </span>
        </div>
      </div>

      {/* App body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Icon sidebar */}
        <div
          style={{
            width: 48,
            background: "#0C1117",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 0",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {[
            { Icon: BarChart2, active: false },
            { Icon: Users, active: true },
            { Icon: FileText, active: false },
            { Icon: Building2, active: false },
          ].map(({ Icon, active }, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: active ? "rgba(18,116,122,0.20)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={16}
                color={active ? "#12747a" : "rgba(255,255,255,0.25)"}
                strokeWidth={1.5}
              />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={15} color="rgba(255,255,255,0.20)" strokeWidth={1.5} />
          </div>
        </div>

        {/* Candidate list */}
        <div
          style={{
            width: 220,
            background: "#0D1117",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.40)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
              Kandidat Tercocok
            </div>
            <div style={{ height: 26, background: "rgba(255,255,255,0.05)", borderRadius: 5, display: "flex", alignItems: "center", padding: "0 8px", gap: 5 }}>
              <Search size={11} color="rgba(255,255,255,0.25)" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Cari kandidat...</span>
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "calc(100% - 68px)" }}>
            {CANDIDATES.map((c, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  padding: "8px 12px",
                  background: selected === i ? "rgba(18,116,122,0.12)" : "transparent",
                  borderLeft: `2px solid ${selected === i ? "#12747a" : "transparent"}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.50)", flexShrink: 0 }}>
                  {c.init}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: selected === i ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.role}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>
                  {c.match}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, background: "#0D1117", overflow: "auto", padding: "16px 20px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.88)", marginBottom: 3 }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{sel.role} · Jakarta</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: sel.color, lineHeight: 1, letterSpacing: "-1px" }}>
                {sel.match}<span style={{ fontSize: 16 }}>%</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Kecocokan</div>
            </div>
          </div>

          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 14, overflow: "hidden" }}>
            <motion.div
              key={selected}
              initial={{ width: 0 }}
              animate={{ width: `${sel.match}%` }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ height: "100%", background: sel.color, borderRadius: 99 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.24)", marginBottom: 6 }}>
              Skill Cocok
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Microsoft Office", "Komunikasi", "Data Entry", "Administrasi"].map((s) => (
                <span key={s} style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(18,116,122,0.14)", border: "1px solid rgba(18,116,122,0.28)", color: "#12747a", fontSize: 10, fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.20)", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <ShieldCheck size={13} color="#16a34a" strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>✓ LAYAK — UMK Jakarta 2026</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>Rp 5.500.000 ≥ UMK Rp 5.067.381</div>
            </div>
          </div>

          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 6 }}>
              Rekomendasi Akomodasi
            </div>
            {["Screen Reader (NVDA/JAWS)", "Workstation aksesibilitas suara"].map((a) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <CheckCircle size={10} color="#12747a" strokeWidth={1.5} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.36)" }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── App Preview Section ──────────────────────────────────────────── */
function AppPreviewSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: "var(--color-bg)", overflow: "hidden" }}>
      <ContainerScroll
        titleComponent={
          <div style={{ paddingBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
                marginBottom: 16,
              }}
            >
              Platform kami dalam aksi
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: isMobile
                  ? "clamp(30px, 7vw, 40px)"
                  : "clamp(36px, 4vw, 40px)",
                fontWeight: 700,
                color: "var(--color-text)",
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
                margin: "0 auto 12px",
              }}
            >
              Dashboard rekrutmen inklusif —{" "}
              <span style={{ color: "var(--color-primary)" }}>
                AI matching &amp; wage guard
              </span>{" "}
              dalam satu layar.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                margin: "0 auto",
                maxWidth: 480,
              }}
            >
              Klik kandidat di panel kiri untuk melihat skor kecocokan,
              rekomendasi akomodasi, dan validasi upah real-time.
            </p>
          </div>
        }
      >
        <img
          src="/HERO.jpeg"
          alt="Screenshot aplikasi InklusiKerja"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
      </ContainerScroll>
    </section>
  );
}

/* ── Pull-Quote Stats Section ─────────────────────────────────────── */
function StatsSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      id="tentang"
      style={{
        background: "var(--color-surface-raised)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: isMobile ? "64px 24px" : "88px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Editorial pull-quote */}
        <Reveal>
          <div
            style={{
              margin: "0 0 48px",
              padding: "24px",
              background: "var(--color-primary-light)",
              borderRadius: "var(--radius-lg)",
              fontFamily: "var(--font-heading)",
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: "var(--color-text)",
              lineHeight: 1.4,
              letterSpacing: "-0.3px",
              maxWidth: 760,
            }}
          >
            "Di Indonesia, kurang dari{" "}
            <span style={{ color: "var(--color-primary)" }}>0,01%</span> tenaga
            kerja adalah penyandang disabilitas — padahal undang-undang mewajibkan{" "}
            <span style={{ color: "var(--color-primary)" }}>1–2%</span>."
          </div>
        </Reveal>

        {/* Three stats horizontal */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: 0,
          }}
        >
          {[
            {
              value: "< 0.05%",
              label: "Serapan tenaga kerja disabilitas di Indonesia saat ini",
              note: "BPS 2023",
            },
            {
              value: "1–2%",
              label: "Kuota wajib menurut UU No. 8/2016 yang belum terpenuhi",
              note: "UU No. 8/2016",
            },
            {
              value: "Jutaan",
              label: "Pekerja belum mengetahui hak upah minimumnya",
              note: "Estimasi Kemenaker",
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                style={{
                  padding: isMobile ? "32px 0" : "40px 40px",
                  borderRight:
                    !isMobile && i < 2 ? "1px solid var(--color-border)" : "none",
                  borderBottom:
                    isMobile && i < 2 ? "1px solid var(--color-border)" : "none",
                  paddingLeft: !isMobile && i === 0 ? 0 : undefined,
                  paddingRight: !isMobile && i === 2 ? 0 : undefined,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: isMobile ? 32 : 40,
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: 8,
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    maxWidth: 220,
                    marginBottom: 8,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.note}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    Icon: Users,
    title: "Isi Profil & Lowongan",
    desc: "Kandidat mengisi skill dan jenis disabilitas. Perusahaan mengunggah deskripsi pekerjaan dan kondisi aksesibilitas kantor.",
  },
  {
    num: "02",
    Icon: Zap,
    title: "AI Matching Otomatis",
    desc: "Model AI berbahasa Indonesia menghitung skor kecocokan dan menghasilkan rekomendasi akomodasi spesifik per kandidat.",
  },
  {
    num: "03",
    Icon: ShieldCheck,
    title: "Laporan + Validasi Upah",
    desc: "Laporan teknis modifikasi kantor dan validasi upah real-time berbasis UMP/UMK 2026 sesuai lokasi perusahaan.",
  },
];

function HowItWorksSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      style={{
        background: "var(--color-bg)",
        padding: isMobile ? "72px 24px" : "96px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--color-primary)",
                flexShrink: 0,
                position: "relative",
                top: -8,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Cara Kerja
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isMobile ? 30 : 40,
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
              margin: "0 0 12px",
            }}
          >
            Tiga langkah,{" "}
            <span style={{ color: "var(--color-primary)" }}>
              satu tujuan.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              maxWidth: 400,
              lineHeight: 1.7,
            }}
          >
            Dari pengisian profil hingga laporan kelayakan — semuanya otomatis
            dan transparan.
          </p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: 0,
          }}
        >
          {STEPS.map((step, idx) => (
            <Reveal key={step.num} delay={idx * 0.1}>
              <div
                style={{
                  padding: isMobile ? "32px 0" : "0 40px",
                  paddingLeft: !isMobile && idx === 0 ? 0 : undefined,
                  paddingRight: !isMobile && idx === 2 ? 0 : undefined,
                  borderRight:
                    !isMobile && idx < 2
                      ? "1px solid var(--color-border)"
                      : "none",
                  borderBottom:
                    isMobile && idx < 2
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 64,
                    fontWeight: 700,
                    color: "var(--color-border)",
                    lineHeight: 1,
                    letterSpacing: "-1px",
                    marginBottom: 8,
                    userSelect: "none",
                  }}
                >
                  {step.num}
                </div>

                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <step.Icon size={19} color="var(--color-primary)" strokeWidth={1.5} />
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    margin: "0 0 10px",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.25,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.78,
                    margin: 0,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features Section ─────────────────────────────────────────────── */
function FeaturesSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      id="fitur"
      style={{
        background: "var(--color-surface-raised)",
        padding: isMobile ? "72px 24px" : "96px 48px",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--color-primary)",
                flexShrink: 0,
                position: "relative",
                top: -8,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Fitur Unggulan
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isMobile ? 30 : 40,
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Dua solusi,{" "}
            <span style={{ color: "var(--color-primary)" }}>
              satu platform.
            </span>
          </h2>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 16,
          }}
        >
          {/* AI Matching */}
          <Reveal delay={0.08}>
            <motion.div
              whileHover={{
                y: -4,
                boxShadow: "var(--shadow-lg)",
                borderColor: "var(--color-border-strong)",
              }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: "var(--radius-lg)",
                padding: isMobile ? "32px 24px" : "44px 40px",
                background: "var(--color-primary-light)",
                border: "1.5px solid rgba(18,116,122,0.14)",
                boxShadow: "var(--shadow-sm)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -48,
                  right: -48,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: "rgba(18,116,122,0.08)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(18,116,122,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <BarChart2 size={22} color="var(--color-primary)" strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: "0 0 12px",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.2,
                }}
              >
                Pencocokan Skill Cerdas
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  margin: "0 0 24px",
                  fontFamily: "var(--font-body)",
                }}
              >
                Model AI berbahasa Indonesia mencocokkan skill kandidat dengan
                lowongan dan merekomendasikan akomodasi kerja — screen reader,
                workstation ergonomis, hingga sistem visual alert.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Skor kecocokan transparan 0–100%",
                  "Akomodasi per jenis disabilitas",
                  "Analisis gap skill otomatis",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={13} color="var(--color-primary)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          {/* Wage Guard */}
          <Reveal delay={0.14}>
            <motion.div
              whileHover={{
                y: -4,
                boxShadow: "var(--shadow-lg)",
                borderColor: "var(--color-border-strong)",
              }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: "var(--radius-lg)",
                padding: isMobile ? "32px 24px" : "44px 40px",
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  fontFamily: "var(--font-body)",
                }}
              >
                UNGGULAN
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Lock size={20} color="var(--color-primary)" strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: "0 0 12px",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.2,
                }}
              >
                Smart Wage Guard
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  margin: "0 0 24px",
                  fontFamily: "var(--font-body)",
                }}
              >
                Validasi otomatis apakah gaji yang ditawarkan memenuhi UMP/UMK
                2026 berdasarkan lokasi perusahaan. Real-time, transparan, dan
                berbasis hukum yang berlaku.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Data UMK 514 kota/Kabupater di Indonesia",
                  "Validasi real-time saat posting lowongan",
                  "Berbasis Peraturan Gubernur 2026",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={13} color="var(--color-success)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Companies Section ────────────────────────────────────────────── */
function CompaniesSection({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <section
      id="perusahaan"
      style={{
        background: "var(--color-text)",
        padding: isMobile ? "72px 24px" : "96px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              gap: isMobile ? 48 : 80,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                  marginBottom: 16,
                }}
              >
                Untuk Perusahaan
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: isMobile ? 28 : 40,
                  fontWeight: 700,
                  color: "var(--color-bg)",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                  margin: "0 0 16px",
                }}
              >
                Penuhi kuota inklusi{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  dengan lebih mudah.
                </span>
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(248,247,244,0.50)",
                  lineHeight: 1.75,
                  margin: "0 0 32px",
                  fontFamily: "var(--font-body)",
                  maxWidth: 420,
                }}
              >
                InklusiKerja membantu perusahaan memenuhi kewajiban kuota 1–2%
                tenaga kerja disabilitas sesuai UU No. 8/2016, lengkap dengan
                laporan teknis dan validasi upah otomatis.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {[
                  { Icon: Users, label: "Kandidat terverifikasi & tercocok" },
                  { Icon: ShieldCheck, label: "Laporan kelayakan otomatis" },
                  { Icon: Lock, label: "Validasi upah sesuai hukum" },
                  { Icon: BarChart2, label: "Dashboard compliance" },
                ].map(({ Icon, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(248,247,244,0.06)",
                        border: "1px solid rgba(248,247,244,0.09)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} color="rgba(248,247,244,0.40)" strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(248,247,244,0.40)", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={() => navigate("/register")}
                whileHover={{
                  background: "var(--color-primary-dark)",
                  boxShadow: "0 4px 16px rgba(18,116,122,0.30)",
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  transition: "background 0.15s",
                }}
              >
                Daftar sebagai Perusahaan
                <ArrowRight size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Right — three big numbers */}
            {!isMobile && (
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  borderTop: "1px solid rgba(248,247,244,0.08)",
                }}
              >
                {[
                  { value: "1–2%", desc: "Kuota wajib TK disabilitas", color: "var(--color-primary)" },
                  { value: "514 Kota", desc: "Data UMK ter-update 2026", color: "var(--color-warning)" },
                  { value: "100%", desc: "Otomatis & berbasis AI", color: "var(--color-success)" },
                ].map((item) => (
                  <div
                    key={item.value}
                    style={{
                      padding: "24px 32px",
                      borderBottom: "1px solid rgba(248,247,244,0.08)",
                      minWidth: 200,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 32,
                        fontWeight: 700,
                        color: item.color,
                        letterSpacing: "-0.5px",
                        marginBottom: 8,
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(248,247,244,0.34)", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── CTA Section ──────────────────────────────────────────────────── */
function CTASection({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <section
      style={{
        background: "var(--color-bg)",
        padding: isMobile ? "80px 24px" : "112px 48px",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <Reveal>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
              marginBottom: 24,
            }}
          >
            Mulai hari ini, gratis
          </div>

          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isMobile ? 32 : 40,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 16px",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            Siap memulai rekrutmen{" "}
            <span style={{ color: "var(--color-primary)" }}>
              yang lebih adil?
            </span>
          </h2>

          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-muted)",
              margin: "0 0 40px",
              lineHeight: 1.72,
              fontFamily: "var(--font-body)",
            }}
          >
            Bergabung sebagai kandidat atau perusahaan.
            <br />
            Gratis selamanya untuk fitur dasar.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{
                background: "var(--color-primary-dark)",
                boxShadow: "var(--shadow-lg)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
              }}
            >
              Registrasi
              <ArrowRight size={16} strokeWidth={1.5} />
            </motion.button>

            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                fontSize: 15,
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                padding: "12px 24px",
                borderRadius: "var(--radius-md)",
              }}
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────── */
function Footer({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        background: "var(--color-text)",
        padding: isMobile ? "28px 24px" : "32px 48px",
        borderTop: "1px solid rgba(248,247,244,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 20 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={13} color="white" strokeWidth={1.5} />
          </div>
          <span style={{ color: "rgba(248,247,244,0.45)", fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 700 }}>
            InklusiKerja
          </span>
        </div>

        <div style={{ display: "flex", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
          {["Perusahaan Terverifikasi", "Privasi", "Ketentuan", "Kontak"].map((link, i) => (
            <span
              key={link}
              onClick={() => i === 0 && navigate("/verified-employers")}
              style={{
                fontSize: 12,
                color: "rgba(248,247,244,0.26)",
                cursor: "pointer",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,247,244,0.52)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,247,244,0.26)")}
            >
              {link}
            </span>
          ))}
        </div>

        <span style={{ fontSize: 12, color: "rgba(248,247,244,0.18)", fontFamily: "var(--font-body)" }}>
          © 2026 InklusiKerja
        </span>
      </div>
    </footer>
  );
}

/* ── Root ──────────────────────────────────────────────────────────── */
export function LandingPage() {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "var(--color-bg)",
        overflowX: "hidden",
      }}
    >
      <Navbar isMobile={isMobile} />
      <HeroSection isMobile={isMobile} />
      <AppPreviewSection isMobile={isMobile} />
      <StatsSection isMobile={isMobile} />
      <HowItWorksSection isMobile={isMobile} />
      <FeaturesSection isMobile={isMobile} />
      <CompaniesSection isMobile={isMobile} />
      <CTASection isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
}
