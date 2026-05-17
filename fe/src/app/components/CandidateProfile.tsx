import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle2,
  ChevronDown,
  FileText,
  Trash2,
} from "lucide-react";
import {
  getCandidateProfile,
  saveCandidateProfile,
  getDisabilityTypes,
  getJobTitles,
  getSkills,
  getCities,
  getProvinces,
  getCitiesByProvince,
} from "../../lib/api";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

// Fallback skills jika API gagal
const FALLBACK_SKILLS = [
  "Microsoft Office",
  "Excel",
  "Data Entry",
  "Customer Service",
  "JavaScript",
  "Python",
  "React",
  "HTML/CSS",
  "SQL",
  "Desain Grafis",
  "Figma",
  "Photoshop",
  "Akuntansi",
  "Pembukuan",
  "SAP",
  "Content Writing",
  "SEO",
  "Social Media",
  "Analisis Data",
  "Power BI",
  "Tableau",
];

const DIVIDER = (
  <div
    style={{ height: 1, background: "var(--color-border)", margin: "24px 0" }}
  />
);

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
          animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: none; } }`}</style>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-full)",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2
            size={28}
            color="var(--color-success)"
            strokeWidth={1.5}
          />
        </div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Profil Tersimpan!
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Data profilmu berhasil disimpan. Profil lengkap meningkatkan peluang
          kecocokan.
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--color-primary)",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Oke, Lanjut
        </button>
      </div>
    </div>
  );
}

export function CandidateProfile() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabilityTypes, setDisabilityTypes] = useState<
    { id: number; name: string }[]
  >([]);
  const [jobTitles, setJobTitles] = useState<{ id: number; title: string }[]>(
    [],
  );
  const [availableSkills, setAvailableSkills] =
    useState<string[]>(FALLBACK_SKILLS);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [citiesForProvince, setCitiesForProvince] = useState<string[]>([]);
  const [province, setProvince] = useState<string>("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  // Peta city → province untuk restore saat load profil
  const [cityProvinceMap, setCityProvinceMap] = useState<
    Record<string, string>
  >({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    disabilityType: "",
    disabilityTypeId: null as number | null,
    location: "Jakarta",
    position: "",
    functionalProfile: "",
  });

  useEffect(() => {
    async function load() {
      // Panggil setiap API secara independen agar satu gagal tidak merusak yang lain
      const [disabilityData, jobTitleData, skillsData, citiesData] =
        await Promise.allSettled([
          getDisabilityTypes(),
          getJobTitles(),
          getSkills(),
          getCities(),
        ]);

      if (disabilityData.status === "fulfilled") {
        setDisabilityTypes(disabilityData.value.disability_types || []);
      }
      if (jobTitleData.status === "fulfilled") {
        setJobTitles(jobTitleData.value.job_titles || []);
      }
      if (
        skillsData.status === "fulfilled" &&
        skillsData.value.skills?.length > 0
      ) {
        setAvailableSkills(
          skillsData.value.skills.map((s: { name: string }) => s.name),
        );
      }
      if (citiesData.status === "fulfilled") {
        const allCities: { city: string; province: string }[] =
          citiesData.value.cities || [];
        // Buat peta city → province untuk restore saat load profil
        const map: Record<string, string> = {};
        allCities.forEach((c) => {
          map[c.city] = c.province;
        });
        setCityProvinceMap(map);
        // Ambil daftar provinsi unik, diurutkan
        const uniqueProvinces = [
          ...new Set(allCities.map((c) => c.province)),
        ].sort();
        setProvinces(uniqueProvinces);
      }

      try {
        const profileData = await getCandidateProfile();
        if (profileData.profile) {
          const p = profileData.profile;
          setForm({
            name: p.name || "",
            disabilityType: p.disabilityType || "",
            disabilityTypeId: p.disabilityTypeId || null,
            location: p.location || "Jakarta",
            position: p.position || "",
            functionalProfile: p.functionalProfile || "",
          });
          setSkills(p.skills || []);
          // Restore province dari city yang tersimpan
          if (p.location) {
            // cityProvinceMap mungkin belum ter-set saat ini karena async,
            // jadi kita set province dari citiesData langsung
            if (citiesData.status === "fulfilled") {
              const allCities: { city: string; province: string }[] =
                citiesData.value.cities || [];
              const foundCity = allCities.find((c) => c.city === p.location);
              if (foundCity) {
                setProvince(foundCity.province);
              }
            }
          }
        } else if (user) {
          setForm((f) => ({ ...f, name: user.name }));
        }
      } catch (err) {
        console.error("Load profile error:", err);
        if (user) setForm((f) => ({ ...f, name: user.name }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!province) {
      setCitiesForProvince([]);
      return;
    }
    setLoadingCities(true);
    getCitiesByProvince(province)
      .then((data) => {
        setCitiesForProvince(
          (Array.isArray(data) ? data : []).map((c: any) => c.city).sort(),
        );
      })
      .catch(() => setCitiesForProvince([]))
      .finally(() => setLoadingCities(false));
  }, [province]);

  const filteredSkills = availableSkills.filter(
    (s) =>
      !skills.includes(s) &&
      s.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) setSkills((prev) => [...prev, skill]);
    setSkillSearch("");
  };

  const removeSkill = (skill: string) =>
    setSkills((s) => s.filter((x) => x !== skill));

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    border: `1.5px solid ${focused === name ? "var(--color-primary)" : "var(--color-border)"}`,
    outline: focused === name ? `3px solid var(--color-primary-light)` : "none",
    outlineOffset: "0",
    background:
      focused === name ? "var(--color-surface)" : "var(--color-surface-raised)",
    boxSizing: "border-box" as const,
    fontFamily: "var(--font-body)",
    color: "var(--color-text)",
    transition: "border-color 0.15s, background 0.15s",
  });

  const selectStyle = (name: string): React.CSSProperties => ({
    ...inputStyle(name),
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 38,
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Nama wajib diisi");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveCandidateProfile({
        name: form.name,
        disabilityType: form.disabilityType,
        disabilityTypeId: form.disabilityTypeId,
        location: form.location,
        skills,
        functionalProfile: form.functionalProfile,
      });
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Memuat profil...
        </div>
      </div>
    );

  const gridCols = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px" }}>
      {showModal && <SuccessModal onClose={() => setShowModal(false)} />}

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: isMobile ? 22 : 26,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 4,
        }}
      >
        Profil Saya
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        Profil lengkap meningkatkan peluang kecocokan dengan lowongan hingga 3×.
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          padding: isMobile ? 16 : 24,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Data Diri */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Data Diri
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onFocus={() => setFocused("nama")}
            onBlur={() => setFocused(null)}
            style={inputStyle("nama")}
            placeholder="Nama lengkap kamu"
          />
        </div>

        {/* Baris 1: Disabilitas + Provinsi */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: 6,
              }}
            >
              Jenis Disabilitas
            </label>
            <select
              value={form.disabilityTypeId ?? ""}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const dt = disabilityTypes.find((d) => d.id === id);
                setForm((f) => ({
                  ...f,
                  disabilityTypeId: id || null,
                  disabilityType: dt?.name || "",
                }));
              }}
              onFocus={() => setFocused("disabilitas")}
              onBlur={() => setFocused(null)}
              style={selectStyle("disabilitas")}
            >
              <option value="">Pilih jenis disabilitas...</option>
              {disabilityTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: 6,
              }}
            >
              Provinsi
            </label>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setForm((f) => ({ ...f, location: "" })); // reset kota
              }}
              onFocus={() => setFocused("provinsi")}
              onBlur={() => setFocused(null)}
              style={selectStyle("provinsi")}
            >
              <option value="">Pilih provinsi...</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris 2: Kota/Kabupaten (full width) */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Kota / Kabupaten
          </label>
          <select
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            onFocus={() => setFocused("lokasi")}
            onBlur={() => setFocused(null)}
            disabled={!province || loadingCities}
            style={{
              ...selectStyle("lokasi"),
              opacity: !province || loadingCities ? 0.5 : 1,
              cursor: !province || loadingCities ? "not-allowed" : "pointer",
            }}
          >
            <option value="">
              {!province
                ? "Pilih provinsi terlebih dahulu"
                : loadingCities
                  ? "Memuat kota..."
                  : "Pilih kota / kabupaten..."}
            </option>
            {citiesForProvince.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}
          >
            Posisi / Jabatan yang Dicari
          </label>
          <select
            value={form.position}
            onChange={(e) =>
              setForm((f) => ({ ...f, position: e.target.value }))
            }
            onFocus={() => setFocused("posisi")}
            onBlur={() => setFocused(null)}
            style={selectStyle("posisi")}
          >
            <option value="">Pilih posisi yang dicari...</option>
            {jobTitles.map((jt) => (
              <option key={jt.id} value={jt.title}>
                {jt.title}
              </option>
            ))}
          </select>
        </div>

        {DIVIDER}

        {/* Skill Teknis */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Skill Teknis
        </div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Skill yang Dimiliki
        </label>

        {/* Selected skills tags */}
        {skills.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {skill}
                <X
                  size={12}
                  strokeWidth={2.5}
                  style={{ cursor: "pointer" }}
                  onClick={() => removeSkill(skill)}
                />
              </span>
            ))}
          </div>
        )}

        {/* Skill dropdown search */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `1.5px solid ${focused === "skill" ? "var(--color-primary)" : "var(--color-border)"}`,
              outline:
                focused === "skill"
                  ? `3px solid var(--color-primary-light)`
                  : "none",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-surface-raised)",
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          >
            <input
              value={skillSearch}
              onChange={(e) => {
                setSkillSearch(e.target.value);
                setShowSkillDropdown(true);
              }}
              onFocus={() => {
                setFocused("skill");
                setShowSkillDropdown(true);
              }}
              onBlur={() => {
                setFocused(null);
                setTimeout(() => setShowSkillDropdown(false), 150);
              }}
              placeholder="Cari atau ketik skill..."
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "none",
                outline: "none",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                background: "transparent",
                color: "var(--color-text)",
              }}
            />
            <ChevronDown
              size={16}
              color="var(--color-text-subtle)"
              strokeWidth={1.5}
              style={{
                marginRight: 12,
                flexShrink: 0,
                transform: showSkillDropdown ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </div>
          {showSkillDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 100,
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                maxHeight: 220,
                overflowY: "auto",
                marginTop: 4,
              }}
            >
              {filteredSkills.length === 0 ? (
                <div
                  style={{
                    padding: "12px 14px",
                    fontSize: 13,
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {skillSearch ? (
                    <span
                      style={{
                        cursor: "pointer",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                      }}
                      onMouseDown={() => {
                        if (skillSearch.trim()) addSkill(skillSearch.trim());
                      }}
                    >
                      + Tambah "{skillSearch}"
                    </span>
                  ) : (
                    "Tidak ada skill tersedia"
                  )}
                </div>
              ) : (
                <>
                  {filteredSkills.map((s) => (
                    <div
                      key={s}
                      onMouseDown={() => addSkill(s)}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        cursor: "pointer",
                        color: "var(--color-text)",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--color-primary-light)";
                        e.currentTarget.style.color = "var(--color-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text)";
                      }}
                    >
                      {s}
                    </div>
                  ))}
                  {skillSearch && !availableSkills.includes(skillSearch) && (
                    <div
                      onMouseDown={() => addSkill(skillSearch.trim())}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        cursor: "pointer",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      + Tambah "{skillSearch}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-subtle)",
            marginTop: 6,
          }}
        >
          Klik skill dari daftar atau ketik untuk menambah skill kustom
        </div>

        {DIVIDER}

        {/* Profil Fungsional */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Profil Fungsional
        </div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Ceritakan tentang dirimu
        </label>
        <textarea
          rows={4}
          value={form.functionalProfile}
          onChange={(e) =>
            setForm((f) => ({ ...f, functionalProfile: e.target.value }))
          }
          onFocus={() => setFocused("profil")}
          onBlur={() => setFocused(null)}
          placeholder="Ceritakan cara terbaik kamu bekerja, kebutuhan khusus, atau preferensi lingkungan kerja..."
          style={{
            ...inputStyle("profil"),
            resize: "vertical",
            lineHeight: 1.65,
            fontFamily: "var(--font-body)",
          }}
        />

        {DIVIDER}

        {/* Upload CV */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-subtle)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Dokumen
        </div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 8,
          }}
        >
          Upload CV
        </label>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
              setCvError("Ukuran file maksimal 5MB");
              setCvFile(null);
              return;
            }
            setCvError(null);
            setCvFile(file);
          }}
        />

        {cvFile ? (
          /* File selected — show info card */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary-light)",
              border: "1.5px solid var(--color-primary)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={20} color="white" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cvFile.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {(cvFile.size / 1024).toFixed(0)} KB ·{" "}
                {cvFile.name.split(".").pop()?.toUpperCase()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-primary)",
                  background: "transparent",
                  color: "var(--color-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Ganti
              </button>
              <button
                onClick={() => {
                  setCvFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setCvError("Ukuran file maksimal 5MB");
                return;
              }
              const ext = file.name.split(".").pop()?.toLowerCase();
              if (!["pdf", "doc", "docx"].includes(ext || "")) {
                setCvError(
                  "Format tidak didukung. Gunakan PDF, DOC, atau DOCX.",
                );
                return;
              }
              setCvError(null);
              setCvFile(file);
            }}
            style={{
              border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "32px 24px",
              textAlign: "center",
              background: dragging
                ? "var(--color-primary-light)"
                : "var(--color-surface-raised)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Upload
                size={22}
                color="var(--color-primary)"
                strokeWidth={1.5}
              />
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--color-text-muted)",
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              Seret CV ke sini atau{" "}
              <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                klik untuk pilih file
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
              PDF, DOC, DOCX — maks. 5MB
            </div>
          </div>
        )}

        {cvError && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "#fee2e2",
              color: "var(--color-danger)",
              fontSize: 13,
              border: "1px solid #fecaca",
            }}
          >
            {cvError}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "#fee2e2",
              color: "var(--color-danger)",
              fontSize: 13,
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-primary)",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              opacity: saving ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.2s",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
