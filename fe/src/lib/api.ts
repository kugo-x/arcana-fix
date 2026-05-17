const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "inklusikerja_token";

// ── TOKEN HELPERS ────────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── GENERIC FETCH HELPER ─────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
export async function register(
  email: string,
  password: string,
  name: string,
  role: string,
) {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
  });
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  clearToken();
}

export async function getMe() {
  return apiFetch("/api/auth/me");
}

// ── REFERENCE DATA ───────────────────────────────────────────────────────────
export async function getDisabilityTypes() {
  return apiFetch("/api/ref/disability-types");
}

export async function getJobTitles() {
  return apiFetch("/api/ref/job-titles");
}

export async function getSkills() {
  return apiFetch("/api/ref/skills");
}

export async function getUMK() {
  return apiFetch("/api/ref/umk");
}

// GET semua kota dari city_minimum_wages (untuk dropdown lokasi)
export async function getCities(): Promise<{
  cities: { city: string; province: string; minimum_wage: number }[];
}> {
  return apiFetch("/api/ref/cities");
}

// GET provinsi unik dari city_minimum_wages
export async function getProvinces(): Promise<string[]> {
  return apiFetch("/api/umk/provinces");
}

// GET kota + UMK per provinsi
export async function getCitiesByProvince(
  province: string,
): Promise<{ city: string; minimum_wage: number }[]> {
  return apiFetch(`/api/umk?province=${encodeURIComponent(province)}`);
}

// ── JOBS ─────────────────────────────────────────────────────────────────────
export async function getJobs(params?: { location?: string; title?: string }) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v) as [string, string][],
      ).toString()
    : "";
  return apiFetch(`/api/jobs${qs}`);
}

export async function getJobById(id: string) {
  return apiFetch(`/api/jobs/${id}`);
}

export async function createJob(job: {
  title: string;
  description: string;
  requiredSkills: string[];
  offeredSalary: string;
  location: string;
  officeConditions: string[];
}) {
  return apiFetch("/api/jobs", {
    method: "POST",
    body: JSON.stringify({
      title: job.title,
      description: job.description,
      location: job.location,
      offered_salary: job.offeredSalary,
      required_skills: job.requiredSkills,
    }),
  });
}

export async function deleteJob(jobId: string) {
  return apiFetch(`/api/jobs/${jobId}`, { method: "DELETE" });
}

// ── CANDIDATE ────────────────────────────────────────────────────────────────
export async function getCandidateProfile() {
  const data = await apiFetch("/api/kandidat/profile");
  if (!data.profile) return { profile: null };
  const p = data.profile;
  return {
    profile: {
      ...p,
      disabilityType: p.disability_types?.[0]?.name || "",
      disabilityTypeId: p.disability_types?.[0]?.id || null,
      functionalProfile: p.functional_profile || "",
      skills: p.skills || [],
    },
  };
}

export async function saveCandidateProfile(profile: {
  name: string;
  disabilityType: string;
  disabilityTypeId?: number | null;
  location: string;
  skills: string[];
  functionalProfile: string;
}) {
  const disability_type_ids = profile.disabilityTypeId
    ? [profile.disabilityTypeId]
    : [];
  return apiFetch("/api/kandidat/profile", {
    method: "POST",
    body: JSON.stringify({
      name: profile.name,
      location: profile.location,
      functional_profile: profile.functionalProfile,
      disability_type_ids,
      skills: profile.skills,
    }),
  });
}

export async function getCandidateApplications() {
  return apiFetch("/api/kandidat/applications");
}

// ── MATCHING ─────────────────────────────────────────────────────────────────
export async function applyAndMatch(jobId: string) {
  return apiFetch("/api/match", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });
}

export async function getLastMatchResult() {
  const data = await apiFetch("/api/match/last");
  if (!data.result) return { result: null };
  const r = data.result;

  // Parse ml_details — bisa sudah object atau masih string
  const mlRaw = r.ml_details
    ? typeof r.ml_details === "string"
      ? tryParseJSON(r.ml_details, null)
      : r.ml_details
    : null;

  return {
    result: {
      matchScore: r.match_score,
      gapSkills: tryParseJSON(r.gap_skills, []),
      matchedSkills: tryParseJSON(r.matched_skills, []),
      accommodations: tryParseJSON(r.accommodations, []),
      wageStatus: r.wage_status,
      umkValue: r.umk_value,
      offeredSalary: r.offered_salary,
      wageGap: r.wage_gap,
      umkLabel: `UMK ${r.job_location} 2026`,
      job: {
        title: r.job_title,
        companyName: r.company_name,
        location: r.job_location,
      },
      mlDetails: mlRaw
        ? {
            semanticScore: mlRaw.semantic_score ?? null,
            skillMatchScore: mlRaw.skill_match_score ?? null,
            disabilityMatchScore: mlRaw.disability_match_score ?? null,
            finalScore: mlRaw.final_score ?? null,
            explanation: mlRaw.explanation ?? null,
            matchedSkills: mlRaw.matched_skills ?? [],
            skillGap: mlRaw.skill_gap ?? [],
            accommodationSuggestions: mlRaw.accommodation_suggestions ?? [],
            source: mlRaw.source ?? "unknown",
          }
        : null,
    },
  };
}

// ── COMPANY ───────────────────────────────────────────────────────────────────
export async function getCompanyProfile() {
  return apiFetch("/api/perusahaan/profile");
}

export async function saveCompanyProfile(profile: {
  companyName: string;
  location: string;
  officeConditions: string[];
}) {
  return apiFetch("/api/perusahaan/profile", {
    method: "POST",
    body: JSON.stringify({
      company_name: profile.companyName,
      location: profile.location,
      office_conditions: profile.officeConditions,
    }),
  });
}

export async function getCompanyCandidates() {
  const data = await apiFetch("/api/perusahaan/kandidat");
  return {
    candidates: (data.candidates || []).map((c: any) => ({
      candidateId: c.candidate_id,
      candidateName: c.candidate_name,
      location: c.location,
      matchScore: c.match_score,
      wageStatus: c.wage_status,
      jobId: c.job_id,
      jobTitle: c.job_title,
      appliedAt: c.applied_at,
      disabilityType: c.disability_types || "",
      skills: [],
    })),
  };
}

export async function getCandidateReport(candidateId: string) {
  const data = await apiFetch(`/api/perusahaan/laporan/${candidateId}`);
  const app = data.application || {};
  const cp = data.candidate_profile || {};
  return {
    summary: {
      candidateName: cp.name || "",
      disabilityType: cp.disability_types?.[0]?.name || "",
      matchScore: app.match_score || 0,
      wageStatus: app.wage_status || "",
    },
    matchResult: {
      matchScore: app.match_score || 0,
      matchedSkills: tryParseJSON(app.matched_skills, []),
      gapSkills: tryParseJSON(app.gap_skills, []),
      wageStatus: app.wage_status || "",
      umkLabel: `UMK ${app.job_location} 2026`,
      umkValue: app.umk_value || 0,
      offeredSalary: app.offered_salary || 0,
      wageGap: app.wage_gap || 0,
    },
    candidateProfile: {
      name: cp.name || "",
      disabilityType: cp.disability_types?.[0]?.name || "",
      skills: cp.skills || [],
    },
  };
}

export async function getVerifiedEmployers() {
  return apiFetch("/api/jobs/verified-employers");
}

export async function getComplianceData() {
  return apiFetch("/api/perusahaan/compliance");
}

export async function getBadgeStatus() {
  return apiFetch("/api/perusahaan/badge-status");
}

// ── UTILITY ───────────────────────────────────────────────────────────────────
function tryParseJSON(value: any, fallback: any) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}
