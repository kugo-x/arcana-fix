const express = require("express");
const pool = require("../../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ── ML API base URL ──────────────────────────────────────────────────────────
const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

// Akomodasi default berdasarkan disability type
const ACCOMMODATION_MAP = {
  Tunanetra: [
    "Screen Reader (NVDA/JAWS) tersedia di workstation",
    "Panduan kerja tersedia dalam format audio",
    "Navigasi kantor dengan panduan voice system",
  ],
  Tunarungu: [
    "Sistem visual alert untuk notifikasi",
    "Caption tools aktif di setiap meeting",
    "Komunikasi via teks diprioritaskan",
  ],
  Tunawicara: [
    "Komunikasi via teks/chat diutamakan",
    "AAC (Augmentative and Alternative Communication) tersedia",
    "Tidak ada kewajiban presentasi verbal",
  ],
  "Disabilitas Daksa Tangan": [
    "Voice command software tersedia",
    "Tombol dan UI dioptimalkan untuk keyboard shortcut",
    "Tidak ada aktivitas yang memerlukan fine motor skills intensif",
  ],
  "Disabilitas Daksa Kaki": [
    "Ramp akses dan lift tersedia",
    "Parkir khusus penyandang disabilitas dekat pintu masuk",
    "Opsi kerja remote/hybrid tersedia",
  ],
  "Disabilitas Intelektual": [
    "SOP kerja disajikan dengan format visual bergambar",
    "Mentor/buddy system tersedia",
    "Task management tools disediakan perusahaan",
  ],
  "Disabilitas Mental / Psikososial": [
    "Lingkungan kerja tenang dan tidak bising",
    "Jadwal kerja fleksibel bila diperlukan",
    "Akses ke layanan konseling perusahaan",
  ],
  "Autisme (ASD)": [
    "Lingkungan kerja terstruktur dan konsisten",
    "Tidak ada perubahan mendadak pada alur kerja",
    "Ruang fokus/quiet room tersedia",
  ],
  "Acquired Brain Injury (ABI)": [
    "Jadwal kerja adaptif sesuai kebutuhan",
    "Pengingat dan task management tools disediakan",
    "Dukungan HR untuk akomodasi spesifik tersedia",
  ],
};

// ── Fungsi hitung match score (fallback lokal) ────────────────────────────────────
// Digunakan hanya jika ML API tidak tersedia.
// Murni berdasarkan skill overlap — tidak ada bonus random yang menyesatkan.
function calculateMatch(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    // Tidak ada persyaratan skill — skor 0 agar tidak menyesatkan
    return { score: 0, matched: [], gap: [] };
  }
  if (!candidateSkills || candidateSkills.length === 0) {
    // Kandidat tidak punya skill sama sekali
    return { score: 0, matched: [], gap: requiredSkills };
  }

  const normalize = (s) => s.trim().toLowerCase();
  const candidateNorm = candidateSkills.map(normalize);
  const requiredNorm = requiredSkills.map(normalize);

  // Exact match + partial match (misal "react" cocok dengan "react native")
  const matchedRequired = requiredSkills.filter((req, i) => {
    const rn = requiredNorm[i];
    return candidateNorm.some(
      (cn) => cn === rn || cn.includes(rn) || rn.includes(cn),
    );
  });
  const gap = requiredSkills.filter((s) => !matchedRequired.includes(s));

  // Skor = persentase skill yang dipenuhi (0–100), tanpa bonus acak
  const score = Math.round(
    (matchedRequired.length / requiredSkills.length) * 100,
  );

  return { score, matched: matchedRequired, gap };
}

// ── Helper: panggil ML API dengan timeout 10 detik ───────────────────────────
async function callMLApi(payload, path = "/api/match") {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${ML_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ML API responded with status ${response.status}: ${text}`,
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── POST /api/match ──────────────────────────────────────────────────────────
// Body: { job_id }
// Kandidat melamar & langsung dapat hasil matching
router.post("/", authenticate, authorize("kandidat"), async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) {
    return res.status(400).json({ error: "job_id wajib diisi" });
  }

  const client = await pool.getConnection();
  try {
    await client.query("BEGIN");

    // ── Ambil profil kandidat beserta skills & disability ──────────────────
    const [profileResult] = await client.query(
      `SELECT cp.id, u.name, cp.location, cp.functional_profile
       FROM candidate_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.user_id = ?`,
      [req.user.id],
    );
    if (profileResult.length === 0) {
      return res.status(400).json({
        error: "Lengkapi profil kandidat terlebih dahulu sebelum melamar",
      });
    }
    const candidateProfile = profileResult[0];
    const candidateId = candidateProfile.id;

    const [skillsResult] = await client.query(
      "SELECT skill FROM candidate_skills WHERE candidate_id = ?",
      [candidateId],
    );
    const candidateSkills = skillsResult.map((r) => r.skill);

    const [disabilityResult] = await client.query(
      `SELECT dt.name FROM candidate_disabilities cd
       JOIN disability_types dt ON dt.id = cd.disability_type_id
       WHERE cd.candidate_id = ?`,
      [candidateId],
    );
    const disabilityNames = disabilityResult.map((r) => r.name);

    // ── Ambil detail lowongan ──────────────────────────────────────────────
    const [jobResult] = await client.query(
      `SELECT j.*, cp.company_name
       FROM jobs j
       JOIN company_profiles cp ON cp.id = j.company_id
       WHERE j.id = ?`,
      [job_id],
    );
    if (jobResult.length === 0) {
      return res.status(404).json({ error: "Lowongan tidak ditemukan" });
    }
    const job = jobResult[0];

    const [jobSkillsResult] = await client.query(
      "SELECT skill FROM job_required_skills WHERE job_id = ?",
      [job_id],
    );
    const requiredSkills = jobSkillsResult.map((r) => r.skill);

    // ── Hitung fallback match score (selalu dihitung sebagai cadangan) ─────
    const fallback = calculateMatch(candidateSkills, requiredSkills);

    // ── Akomodasi default berdasarkan disability type kandidat ─────────────
    let defaultAccommodations = [];
    for (const disabilityName of disabilityNames) {
      const acc = ACCOMMODATION_MAP[disabilityName];
      if (acc) defaultAccommodations.push(...acc);
    }
    if (defaultAccommodations.length === 0) {
      defaultAccommodations = ["Konsultasi dengan HR untuk akomodasi spesifik"];
    }

    // ── Panggil ML API; gunakan fallback jika gagal ────────────────────────
    let score = fallback.score;
    let matched = fallback.matched;
    let gap = fallback.gap;
    let accommodations = defaultAccommodations;
    let mlDetails = null;

    try {
      const functionalProfile = candidateProfile.functional_profile || "";
      const jobDescription = job.description || "";
      const disabilityType = disabilityNames[0] || "";

      const mlPayload = {
        disability_type: disabilityType,
        skills: candidateSkills,
        functional_profile: functionalProfile || "",
        job_title: job.title || "",
        job_description: jobDescription,
        job_required_skills: requiredSkills,
      };

      console.log(
        "[ML API] Calling /api/match/direct with payload:",
        JSON.stringify(mlPayload),
      );

      const mlResponse = await callMLApi(mlPayload, "/api/match/direct");

      if (mlResponse && mlResponse.result) {
        const rec = mlResponse.result;

        // Gunakan skor & data dari ML
        score = rec.final_score;
        matched = Array.isArray(rec.matched_skills)
          ? rec.matched_skills
          : fallback.matched;
        gap = Array.isArray(rec.skill_gap) ? rec.skill_gap : fallback.gap;

        // Gabungkan accommodation dari ML dengan default lokal agar tidak kosong
        const mlAccommodations = Array.isArray(rec.accommodation_suggestions)
          ? rec.accommodation_suggestions
          : [];
        accommodations =
          mlAccommodations.length > 0
            ? mlAccommodations
            : defaultAccommodations;

        mlDetails = {
          semantic_score: rec.semantic_score ?? null,
          skill_match_score: rec.skill_match_score ?? null,
          disability_match_score: rec.disability_match_score ?? null,
          final_score: rec.final_score ?? null,
          explanation: rec.explanation ?? null,
          matched_skills: matched,
          skill_gap: gap,
          accommodation_suggestions: accommodations,
          source: rec.source || "ml_direct",
        };

        console.log("[ML API] Success — final_score:", score);
      } else {
        console.warn(
          "[ML API] Response OK tetapi result kosong, pakai fallback.",
        );
        mlDetails = {
          semantic_score: null,
          skill_match_score: null,
          disability_match_score: null,
          final_score: fallback.score,
          explanation:
            "ML API tidak mengembalikan hasil; menggunakan kalkulasi lokal.",
          matched_skills: fallback.matched,
          skill_gap: fallback.gap,
          accommodation_suggestions: defaultAccommodations,
          source: "fallback",
        };
      }
    } catch (mlErr) {
      // ML gagal (network error, timeout, dsb.) — pakai fallback
      const reason =
        mlErr.name === "AbortError" ? "timeout (10s)" : mlErr.message;
      console.error(`[ML API] Gagal (${reason}), menggunakan fallback.`);
      mlDetails = {
        semantic_score: null,
        skill_match_score: null,
        disability_match_score: null,
        final_score: fallback.score,
        explanation: `ML API tidak tersedia (${reason}); menggunakan kalkulasi lokal.`,
        matched_skills: fallback.matched,
        skill_gap: fallback.gap,
        accommodation_suggestions: defaultAccommodations,
        source: "fallback",
      };
    }

    // ── Wage Guard — bandingkan dengan UMK kota lowongan ──────────────────
    // Ambil UMK dari database
    const [umkRows] = await client.query(
      "SELECT minimum_wage FROM city_minimum_wages WHERE city = ? LIMIT 1",
      [job.location],
    );
    const umkValue =
      (umkRows.length > 0 ? umkRows[0].minimum_wage : null) || 4000000;
    const offeredSalaryNum =
      parseInt(String(job.offered_salary || "0").replace(/\D/g, "")) || 0;
    const wageStatus = offeredSalaryNum >= umkValue ? "LAYAK" : "TIDAK LAYAK";
    const wageGap = Math.abs(offeredSalaryNum - umkValue);

    // ── Simpan / update application ke database ────────────────────────────
    const appId = require("crypto").randomUUID();
    await client.query(
      `INSERT INTO applications
         (id, candidate_id, job_id, match_score, matched_skills, gap_skills,
          accommodations, ml_details, wage_status, umk_value, offered_salary, wage_gap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         match_score       = VALUES(match_score),
         matched_skills    = VALUES(matched_skills),
         gap_skills        = VALUES(gap_skills),
         accommodations    = VALUES(accommodations),
         ml_details        = VALUES(ml_details),
         wage_status       = VALUES(wage_status),
         umk_value         = VALUES(umk_value),
         offered_salary    = VALUES(offered_salary),
         wage_gap          = VALUES(wage_gap),
         applied_at        = NOW()`,
      [
        appId,
        candidateId,
        job_id,
        score,
        JSON.stringify(matched),
        JSON.stringify(gap),
        JSON.stringify(accommodations),
        mlDetails ? JSON.stringify(mlDetails) : null,
        wageStatus,
        umkValue,
        offeredSalaryNum,
        wageGap,
      ],
    );

    // Ambil baris yang baru saja disimpan
    const [appResult] = await client.query(
      "SELECT * FROM applications WHERE candidate_id = ? AND job_id = ?",
      [candidateId, job_id],
    );

    await client.query("COMMIT");

    // ── Kirim response ─────────────────────────────────────────────────────
    res.json({
      success: true,
      match_result: {
        ...appResult[0],
        job: {
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          location: job.location,
          offered_salary: job.offered_salary,
        },
        candidate: {
          id: candidateId,
          name: candidateProfile.name,
          skills: candidateSkills,
          disability_types: disabilityNames,
        },
        umk_label: `UMK ${job.location} 2026`,
        ml_details: mlDetails,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[POST /api/match]", err.message);
    res.status(500).json({ error: "Gagal melakukan matching" });
  } finally {
    client.release();
  }
});

// ── GET /api/match/last ──────────────────────────────────────────────────────
// Hasil matching terakhir kandidat yang login
router.get("/last", authenticate, authorize("kandidat"), async (req, res) => {
  try {
    const [profileResult] = await pool.query(
      "SELECT id FROM candidate_profiles WHERE user_id = ?",
      [req.user.id],
    );
    if (profileResult.length === 0) {
      return res.json({ result: null });
    }
    const candidateId = profileResult[0].id;

    const [result] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.location AS job_location,
              j.offered_salary, cp.company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN company_profiles cp ON cp.id = j.company_id
       WHERE a.candidate_id = ?
       ORDER BY a.applied_at DESC
       LIMIT 1`,
      [candidateId],
    );

    const row = result[0] || null;

    if (!row) {
      return res.json({ result: null });
    }

    // Parse ml_details dari JSON string jika perlu
    let mlDetailsParsed = null;
    if (row.ml_details) {
      try {
        mlDetailsParsed =
          typeof row.ml_details === "string"
            ? JSON.parse(row.ml_details)
            : row.ml_details;
      } catch {
        mlDetailsParsed = null;
      }
    }

    res.json({
      result: {
        ...row,
        ml_details: mlDetailsParsed,
      },
    });
  } catch (err) {
    console.error("[GET /api/match/last]", err.message);
    res.status(500).json({ error: "Gagal mengambil hasil matching terakhir" });
  }
});

module.exports = router;
