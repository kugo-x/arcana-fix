import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { getProvinces, getCitiesByProvince } from "../../lib/api";

const INDUSTRIES = [
  "Teknologi",
  "Manufaktur",
  "Jasa & Retail",
  "Konstruksi",
  "Kesehatan",
  "Pendidikan",
  "Lainnya",
];
const EXPERIENCES = ["< 1 tahun", "1–3 tahun", "3–5 tahun", "> 5 tahun"];
const STATUSES = ["Belum Bekerja", "Sedang Bekerja", "Penyandang Disabilitas"];

const FAQ_ITEMS = [
  {
    q: "Apakah UMK berlaku sama untuk penyandang disabilitas?",
    a: "Ya. UU No. 8/2016 Pasal 11 secara eksplisit menyatakan hak upah setara tanpa diskriminasi. Pekerja penyandang disabilitas berhak mendapatkan upah minimum yang sama persis dengan pekerja lainnya.",
  },
  {
    q: "Apa bedanya UMP dan UMK?",
    a: "UMP (Upah Minimum Provinsi) adalah standar minimum di tingkat provinsi. UMK (Upah Minimum Kota/Kabupaten) ditetapkan oleh Gubernur untuk kota atau kabupaten tertentu dan nilainya bisa lebih tinggi dari UMP. Perusahaan wajib mengikuti nilai tertinggi yang berlaku.",
  },
  {
    q: "Apa yang bisa saya lakukan jika gaji di bawah UMK?",
    a: "Kamu dapat melaporkan ke Dinas Tenaga Kerja (Disnaker) setempat, melampirkan bukti slip gaji atau kontrak kerja. Selain itu, gunakan fitur laporan Arcana untuk mendokumentasikan dan mendapatkan panduan langkah selanjutnya.",
  },
  {
    q: "Apakah simulator ini resmi?",
    a: "Data UMK pada simulator ini bersumber dari Keputusan Gubernur dan Peraturan Menteri Ketenagakerjaan Republik Indonesia Tahun 2026. Simulator ini dibuat untuk tujuan edukasi dan referensi.",
  },
];

function StepIndicator({ step }: { step: number }) {
  const steps = ["Pekerjaan", "Lokasi & Gaji", "Hasil"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", flex: 1 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background:
                    done || active ? "var(--color-primary)" : "transparent",
                  border: `2px solid ${done || active ? "var(--color-primary)" : "var(--color-border)"}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: done || active ? "white" : "var(--color-text-subtle)",
                  transition: "all 0.3s",
                }}
              >
                {done ? <CheckCircle size={13} strokeWidth={2.5} /> : idx}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "var(--color-primary)"
                    : done
                      ? "var(--color-text)"
                      : "var(--color-text-subtle)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background:
                    step > idx ? "var(--color-primary)" : "var(--color-border)",
                  margin: "0 10px",
                  borderRadius: 999,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TogglePills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
              background: active
                ? "var(--color-primary)"
                : "var(--color-surface)",
              color: active ? "white" : "var(--color-text-muted)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all 0.15s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function InputField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-subtle)",
            marginTop: 6,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  fontSize: 14,
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
  outline: "none",
};

const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

function AccordionItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: `1.5px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
        boxShadow: open ? "var(--shadow-md)" : "var(--shadow-xs)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: open
            ? "var(--color-primary-light)"
            : "var(--color-surface)",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-full)",
            flexShrink: 0,
            background: open
              ? "var(--color-primary)"
              : "var(--color-surface-raised)",
            border: `1.5px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: open ? "white" : "var(--color-text-subtle)",
            transition: "all 0.2s",
          }}
        >
          {index + 1}
        </div>
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: open ? "var(--color-primary)" : "var(--color-text)",
            lineHeight: 1.45,
            transition: "color 0.2s",
          }}
        >
          {q}
        </span>
        <div
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.25s",
          }}
        >
          <ChevronDown
            size={17}
            color={open ? "var(--color-primary)" : "var(--color-text-subtle)"}
            strokeWidth={2}
          />
        </div>
      </button>
      <div
        style={{
          maxHeight: open ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "14px 20px 16px 62px",
            fontSize: 13,
            color: "var(--color-text-muted)",
            lineHeight: 1.8,
          }}
        >
          {a}
        </div>
      </div>
    </div>
  );
}

function HakItem({ title, desc }: { title: string; desc: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          textAlign: "left",
        }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}
        >
          {title}
        </span>
        <ChevronRight
          size={15}
          color="var(--color-text-subtle)"
          strokeWidth={2}
          style={{
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 12,
            fontSize: 13,
            color: "var(--color-text-muted)",
            lineHeight: 1.7,
          }}
        >
          {desc}
        </div>
      )}
    </div>
  );
}

export function WageSimulator() {
  const isMobile = useIsMobile();

  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [salaryInput, setSalaryInput] = useState("");
  const [workerStatus, setWorkerStatus] = useState("");
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  const [provincesList, setProvincesList] = useState<string[]>([]);
  const [citiesMap, setCitiesMap] = useState<
    Record<string, { city: string; minimum_wage: number }[]>
  >({});
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    getProvinces()
      .then((data) => setProvincesList(Array.isArray(data) ? data : []))
      .catch(() => setProvincesList([]))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!province) return;
    setLoadingCities(true);
    setCity("");
    getCitiesByProvince(province)
      .then((data) => {
        setCitiesMap((prev) => ({
          ...prev,
          [province]: Array.isArray(data) ? data : [],
        }));
      })
      .catch(() => {
        setCitiesMap((prev) => ({ ...prev, [province]: [] }));
      })
      .finally(() => setLoadingCities(false));
  }, [province]);

  const goTo = (next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  const citiesForProvince = province ? citiesMap[province] || [] : [];
  const cities = citiesForProvince.map((c) => c.city);
  const umkInfo = city
    ? (() => {
        const found = citiesForProvince.find((c) => c.city === city);
        return found
          ? { umk: found.minimum_wage, label: `UMK ${city} 2026` }
          : null;
      })()
    : null;
  const salaryNum = parseInt(salaryInput.replace(/\D/g, "")) || 0;
  const formatRp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;
  const diff = umkInfo ? salaryNum - umkInfo.umk : 0;
  const hasSalary = salaryNum > 0;
  const isLayak = hasSalary && diff >= 0;
  const isTidakLayak = hasSalary && diff < 0;

  const contentStyle: React.CSSProperties = {
    opacity: animating ? 0 : 1,
    transform: animating ? "translateY(10px)" : "translateY(0)",
    transition: "opacity 0.2s, transform 0.2s cubic-bezier(0.4,0,0.2,1)",
  };

  const pad = isMobile ? "20px 16px" : "32px 32px";

  return (
    <div
      style={{
        padding: pad,
        background: "var(--color-bg)",
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Hak Upah Kamu
        </div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: isMobile ? 24 : 30,
            color: "var(--color-text)",
            margin: "0 0 6px",
            letterSpacing: "-0.4px",
          }}
        >
          Simulator Upah
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Hitung hak upah minimalmu berdasarkan UMP/UMK 2026 — sesuai regulasi
          resmi pemerintah.
        </p>
      </div>

      {/* ── BADGE INFO STRIP ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-primary-light)",
          border: "1px solid rgba(18,116,122,0.2)",
          marginBottom: 20,
          maxWidth: isMobile ? "100%" : 680,
          marginLeft: isMobile ? 0 : "auto",
          marginRight: isMobile ? 0 : "auto",
        }}
      >
        <ShieldCheck size={16} color="var(--color-primary)" strokeWidth={1.5} />
        <span
          style={{
            fontSize: 13,
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          Berbasis UU No. 8/2016 · Data UMK Resmi 2026 · Gratis & Rahasia
        </span>
      </div>

      {/* ── SIMULATOR CARD ── */}
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: isMobile ? "20px 16px" : "32px 32px",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          maxWidth: 680,
          margin: "0 auto 20px",
        }}
      >
        <StepIndicator step={step} />

        <div style={contentStyle}>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <InputField label="Jenis Pekerjaan Kamu">
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="cth: Staff Administrasi, Frontend Developer..."
                  style={fieldStyle}
                />
              </InputField>
              <InputField label="Kategori Industri">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{
                    ...fieldStyle,
                    appearance: "none",
                    backgroundImage: selectArrow,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 40,
                  }}
                >
                  <option value="">Pilih industri...</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Pengalaman Kerja">
                <TogglePills
                  options={EXPERIENCES}
                  value={experience}
                  onChange={setExperience}
                />
              </InputField>
              <button
                onClick={() => goTo(2)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                  boxShadow: "var(--shadow-md)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "var(--color-primary-dark)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-primary)";
                }}
              >
                Lanjut <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <InputField label="Provinsi">
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCity("");
                  }}
                  style={{
                    ...fieldStyle,
                    appearance: "none",
                    backgroundImage: selectArrow,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 40,
                  }}
                >
                  <option value="">Pilih provinsi...</option>
                  {loadingProvinces ? (
                    <option>Memuat provinsi...</option>
                  ) : (
                    provincesList.map((p) => <option key={p}>{p}</option>)
                  )}
                </select>
              </InputField>
              <InputField label="Kota / Kabupaten">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!province}
                  style={{
                    ...fieldStyle,
                    appearance: "none",
                    backgroundImage: selectArrow,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 40,
                    opacity: province ? 1 : 0.5,
                  }}
                >
                  <option value="">
                    {province ? "Pilih kota..." : "Pilih provinsi dulu"}
                  </option>
                  {loadingCities ? (
                    <option>Memuat kota...</option>
                  ) : (
                    cities.map((c) => <option key={c}>{c}</option>)
                  )}
                </select>
              </InputField>
              {umkInfo && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-light)",
                    border: "1px solid rgba(18,116,122,0.2)",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {umkInfo.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatRp(umkInfo.umk)}
                  </div>
                </div>
              )}
              <InputField
                label="Gaji yang Diterima / Ditawarkan"
                hint="Kosongkan jika hanya ingin melihat standar UMK"
              >
                <input
                  value={salaryInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const num = parseInt(raw) || 0;
                    setSalaryInput(num ? num.toLocaleString("id-ID") : "");
                  }}
                  placeholder="cth: 4.000.000"
                  style={fieldStyle}
                />
              </InputField>
              <InputField label="Status Pekerja">
                <TogglePills
                  options={STATUSES}
                  value={workerStatus}
                  onChange={setWorkerStatus}
                />
              </InputField>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => goTo(1)}
                  style={{
                    height: 48,
                    padding: "0 24px",
                    borderRadius: "var(--radius-full)",
                    border: `1.5px solid var(--color-border)`,
                    background: "transparent",
                    color: "var(--color-text-muted)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ← Kembali
                </button>
                <button
                  onClick={() => goTo(3)}
                  disabled={!city}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: city
                      ? "var(--color-primary)"
                      : "var(--color-border-strong)",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: city ? "pointer" : "not-allowed",
                    fontFamily: "var(--font-body)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: city ? "var(--shadow-md)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (city)
                      e.currentTarget.style.background =
                        "var(--color-primary-dark)";
                  }}
                  onMouseLeave={(e) => {
                    if (city)
                      e.currentTarget.style.background = "var(--color-primary)";
                  }}
                >
                  Hitung Sekarang <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — HASIL */}
          {step === 3 && umkInfo && (
            <div>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 16,
                  background: isTidakLayak
                    ? "#fee2e2"
                    : isLayak
                      ? "#dcfce7"
                      : "var(--color-primary-light)",
                  border: `1px solid ${isTidakLayak ? "#fecaca" : isLayak ? "#bbf7d0" : "rgba(18,116,122,0.2)"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                {isTidakLayak ? (
                  <AlertCircle
                    size={20}
                    color="var(--color-danger)"
                    strokeWidth={1.5}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                ) : isLayak ? (
                  <CheckCircle
                    size={20}
                    color="var(--color-success)"
                    strokeWidth={1.5}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                ) : (
                  <ShieldCheck
                    size={20}
                    color="var(--color-primary)"
                    strokeWidth={1.5}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isTidakLayak
                      ? "var(--color-danger)"
                      : isLayak
                        ? "var(--color-success)"
                        : "var(--color-primary)",
                    lineHeight: 1.55,
                  }}
                >
                  {isTidakLayak
                    ? `Gaji kamu ${formatRp(salaryNum)} berada DI BAWAH standar ${umkInfo.label}`
                    : isLayak
                      ? `Gaji kamu sudah memenuhi standar ${umkInfo.label} ✓`
                      : `Berikut standar UMK yang berlaku di ${city}`}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    hasSalary && !isMobile ? "1fr 1fr" : "1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    padding: "18px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-light)",
                    border: "1px solid rgba(18,116,122,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {umkInfo.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: 26,
                      color: "var(--color-primary)",
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {formatRp(umkInfo.umk)}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    Per bulan · Berdasarkan Pergub/Permenaker 2026
                  </div>
                </div>
                {hasSalary && (
                  <div
                    style={{
                      padding: "18px 16px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-subtle)",
                        fontWeight: 700,
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Gaji yang Kamu Terima
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: 26,
                        color: isLayak
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                        lineHeight: 1,
                        marginBottom: 6,
                      }}
                    >
                      {formatRp(salaryNum)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isLayak
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                        fontWeight: 600,
                      }}
                    >
                      {isLayak
                        ? `✓ Lebih ${formatRp(diff)} dari standar`
                        : `✗ Kurang ${formatRp(Math.abs(diff))} dari standar`}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-text-subtle)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Hak Tambahan Wajib
                </div>
                <HakItem
                  title="BPJS Kesehatan"
                  desc="Wajib ditanggung perusahaan 4%, kamu membayar 1% dari gaji. Perusahaan yang tidak mendaftarkan karyawan dapat dikenakan sanksi administratif."
                />
                <HakItem
                  title="BPJS Ketenagakerjaan"
                  desc="JKK (Jaminan Kecelakaan Kerja), JKM (Jaminan Kematian), dan JHT (Jaminan Hari Tua) wajib didaftarkan oleh perusahaan sejak hari pertama bekerja."
                />
                <HakItem
                  title="Hak Cuti Tahunan"
                  desc="Minimal 12 hari kerja per tahun setelah 12 bulan masa kerja terus-menerus, sesuai UU No. 13/2003 tentang Ketenagakerjaan."
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: "var(--radius-full)",
                    border: `1.5px solid var(--color-danger)`,
                    background: "transparent",
                    color: "var(--color-danger)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Laporkan Pelanggaran
                </button>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setSalaryInput("");
                    setCity("");
                    setProvince("");
                    setWorkerStatus("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-subtle)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ↺ Hitung Ulang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-subtle)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Pertanyaan Umum
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 6px",
            }}
          >
            Hak Upahmu, Dijawab Tuntas
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Pertanyaan yang sering muncul seputar hak upah penyandang
            disabilitas.
          </p>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} index={i} />
        ))}
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary-light)",
            border: "1px solid rgba(18,116,122,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ShieldCheck
            size={18}
            color="var(--color-primary)"
            strokeWidth={1.5}
            style={{ flexShrink: 0 }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--color-primary)",
              fontWeight: 500,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Data UMK bersumber dari Keputusan Gubernur & Permenaker RI 2026.
            Simulator ini gratis, anonim, dan tidak menyimpan data pribadimu.
          </p>
        </div>
      </div>
    </div>
  );
}
