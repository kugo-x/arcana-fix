const express = require('express');
const pool = require('../../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('perusahaan'));

// ── GET /api/perusahaan/profile ──────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT cp.id, cp.user_id, u.name AS contact_name, u.email,
              cp.company_name, cp.location, cp.updated_at
       FROM company_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.user_id = ?`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.json({ profile: null });
    }

    const profile = result[0];
    const [conditions] = await pool.query(
      'SELECT `condition` FROM company_office_conditions WHERE company_id = ?',
      [profile.id]
    );

    res.json({
      profile: {
        ...profile,
        office_conditions: conditions.map((r) => r.condition),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil profil perusahaan' });
  }
});

// ── POST /api/perusahaan/profile ─────────────────────────────────────────────
router.post('/profile', async (req, res) => {
  const { company_name, location, office_conditions } = req.body;

  if (!company_name || !location) {
    return res.status(400).json({ error: 'Nama perusahaan dan lokasi wajib diisi' });
  }

  const client = await pool.getConnection();
  try {
    await client.query('BEGIN');

    await client.query('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [
      company_name,
      req.user.id,
    ]);

    let companyId;
    const [existing] = await client.query('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    if (existing.length > 0) {
      companyId = existing[0].id;
      await client.query(
        `UPDATE company_profiles SET company_name = ?, location = ?, updated_at = NOW() WHERE user_id = ?`,
        [company_name, location, req.user.id]
      );
    } else {
      companyId = require('crypto').randomUUID();
      await client.query(
        `INSERT INTO company_profiles (id, user_id, company_name, location) VALUES (?, ?, ?, ?)`,
        [companyId, req.user.id, company_name, location]
      );
    }

    await client.query('DELETE FROM company_office_conditions WHERE company_id = ?', [companyId]);
    if (Array.isArray(office_conditions) && office_conditions.length > 0) {
      for (const cond of office_conditions) {
        await client.query(
          `INSERT IGNORE INTO company_office_conditions (company_id, \`condition\`) VALUES (?, ?)`,
          [companyId, cond.trim()]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Profil perusahaan berhasil disimpan', companyId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Gagal menyimpan profil perusahaan' });
  } finally {
    client.release();
  }
});

// ── GET /api/perusahaan/kandidat ─────────────────────────────────────────────
router.get('/kandidat', async (req, res) => {
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      return res.json({ candidates: [] });
    }
    const companyId = companyResult[0].id;

    const [result] = await pool.query(
      `SELECT candidate_id, candidate_name, location, match_score, wage_status,
              job_id, job_title, applied_at, disability_types
       FROM (
         SELECT cp.id AS candidate_id, u.name AS candidate_name,
                cp.location, a.match_score, a.wage_status,
                j.id AS job_id, j.title AS job_title,
                a.applied_at,
                (SELECT GROUP_CONCAT(dt.name SEPARATOR ', ')
                 FROM candidate_disabilities cd
                 JOIN disability_types dt ON dt.id = cd.disability_type_id
                 WHERE cd.candidate_id = cp.id) AS disability_types,
                ROW_NUMBER() OVER(PARTITION BY cp.id ORDER BY a.match_score DESC) as rn
         FROM applications a
         JOIN candidate_profiles cp ON cp.id = a.candidate_id
         JOIN users u ON u.id = cp.user_id
         JOIN jobs j ON j.id = a.job_id
         WHERE j.company_id = ?
       ) t
       WHERE rn = 1
       ORDER BY match_score DESC`,
      [companyId]
    );

    res.json({ candidates: result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil daftar kandidat' });
  }
});

// ── GET /api/perusahaan/laporan/:candidateId ─────────────────────────────────
router.get('/laporan/:candidateId', async (req, res) => {
  const { candidateId } = req.params;
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      return res.status(403).json({ error: 'Profil perusahaan belum dibuat' });
    }
    const companyId = companyResult[0].id;

    const [appResult] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.offered_salary, j.location AS job_location
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.candidate_id = ? AND j.company_id = ?
       ORDER BY a.match_score DESC
       LIMIT 1`,
      [candidateId, companyId]
    );

    if (appResult.length === 0) {
      return res.status(404).json({ error: 'Data kandidat tidak ditemukan' });
    }

    const application = appResult[0];

    const [profileResult] = await pool.query(
      `SELECT cp.*, u.name, u.email
       FROM candidate_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.id = ?`,
      [candidateId]
    );

    const [disabilitiesResult] = await pool.query(
      `SELECT dt.name, dt.accessibility_needs
       FROM candidate_disabilities cd
       JOIN disability_types dt ON dt.id = cd.disability_type_id
       WHERE cd.candidate_id = ?`,
      [candidateId]
    );

    const [skillsResult] = await pool.query(
      'SELECT skill FROM candidate_skills WHERE candidate_id = ?',
      [candidateId]
    );

    res.json({
      application,
      candidate_profile: {
        ...profileResult[0],
        disability_types: disabilitiesResult,
        skills: skillsResult.map((r) => r.skill),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil laporan kandidat' });
  }
});

// ── SHARED HELPER: hitung kepatuhan perusahaan ───────────────────────────────
// Digunakan oleh KEDUA endpoint /compliance dan /badge-status
// agar angka compliance score SELALU IDENTIK di kedua halaman
async function calculateCompliance(companyId) {
  // Semua lowongan + UMK sesuai kota
  const [jobs] = await pool.query(
    `SELECT j.id, j.title, j.location, j.offered_salary,
            cmw.minimum_wage AS umk
     FROM jobs j
     LEFT JOIN city_minimum_wages cmw ON cmw.city = j.location
     WHERE j.company_id = ?`,
    [companyId]
  );

  // Semua aplikasi beserta status disabilitas kandidat
  const [applications] = await pool.query(
    `SELECT a.job_id, a.wage_status, a.applied_at,
            cp.id AS candidate_id,
            (SELECT COUNT(*) FROM candidate_disabilities cd
             WHERE cd.candidate_id = cp.id) AS disability_count
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN candidate_profiles cp ON cp.id = a.candidate_id
     WHERE j.company_id = ?
     ORDER BY a.applied_at DESC`,
    [companyId]
  );

  // Wage compliance per lowongan (berdasarkan job, bukan aplikasi)
  const jobCompliance = jobs.map(job => {
    const offered = parseInt(String(job.offered_salary).replace(/\D/g, '')) || 0;
    const umk = job.umk || 0;
    const diff = offered - umk;
    // Jika tidak ada data UMK untuk kota ini, anggap layak (agar tidak false-penalize)
    return { title: job.title, city: job.location, offered, umk, diff, isLayak: umk > 0 ? diff >= 0 : true };
  });

  const wageLayakJobs = jobCompliance.filter(j => j.isLayak).length;
  const wagePct = jobs.length > 0 ? (wageLayakJobs / jobs.length) * 100 : 0;

  // Kandidat disabilitas unik
  const disabilityApps = applications.filter(a => parseInt(a.disability_count) > 0);
  const uniqueDisabilityCandidates = new Set(disabilityApps.map(a => a.candidate_id)).size;
  const totalApps = applications.length;

  // Kuota 1%: minimal 1 kandidat disabilitas per 20 pelamar (minimal 1)
  const requiredDisability = Math.max(1, Math.floor(totalApps / 20));
  const disabilityPct = Math.min(100, (uniqueDisabilityCandidates / requiredDisability) * 100);

  // Skor akhir = 50% wage compliance + 50% kuota disabilitas
  const complianceScore = Math.round(wagePct * 0.5 + disabilityPct * 0.5);

  const layakCount = applications.filter(a => a.wage_status === 'LAYAK').length;
  const hasDisabilityRecruit = uniqueDisabilityCandidates >= 1;
  const allWageCompliant = jobs.length > 0 && wageLayakJobs === jobs.length;

  // Timeline 5 event terbaru
  const timeline = applications.slice(0, 5).map(a => {
    const job = jobs.find(j => j.id === a.job_id);
    const isLayak = a.wage_status === 'LAYAK';
    return {
      label: new Date(a.applied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      text: `Kandidat melamar '${job?.title || 'Tidak Diketahui'}' — ${isLayak ? 'LAYAK' : 'BELUM LAYAK'}`,
      type: isLayak ? 'success' : 'warning',
    };
  });

  return {
    complianceScore,
    jobs: jobCompliance,
    stats: {
      totalJobs: jobs.length,
      totalApplicants: totalApps,
      disabilityCandidates: uniqueDisabilityCandidates,
      requiredDisability,
      layakCount,
      wageLayakJobs,
      wagePct: Math.round(wagePct),
      disabilityPct: Math.round(disabilityPct),
    },
    timeline,
    hasDisabilityRecruit,
    allWageCompliant,
  };
}

// ── GET /api/perusahaan/compliance ───────────────────────────────────────────
router.get('/compliance', async (req, res) => {
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) return res.json({ hasProfile: false });

    const data = await calculateCompliance(companyResult[0].id);
    res.json({ hasProfile: true, ...data });
  } catch (err) {
    console.error('Compliance error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data kepatuhan' });
  }
});

// ── GET /api/perusahaan/badge-status ─────────────────────────────────────────
// Menggunakan calculateCompliance() yang SAMA — angka selalu konsisten
router.get('/badge-status', async (req, res) => {
  try {
    const [companyResult] = await pool.query(
      'SELECT id, company_name FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) return res.json({ hasProfile: false, badgeEarned: false });

    const companyId = companyResult[0].id;
    const companyName = companyResult[0].company_name;

    // Gunakan helper yang sama dengan /compliance
    const compliance = await calculateCompliance(companyId);

    // Cek profil lengkap: nama + lokasi + minimal 1 kondisi kantor
    const [profile] = await pool.query(
      `SELECT cp.company_name, cp.location, COUNT(coc.id) AS conditionCount
       FROM company_profiles cp
       LEFT JOIN company_office_conditions coc ON coc.company_id = cp.id
       WHERE cp.id = ?
       GROUP BY cp.id`,
      [companyId]
    );
    const profileComplete = profile.length > 0 &&
      !!profile[0].company_name &&
      !!profile[0].location &&
      profile[0].conditionCount > 0;

    const { complianceScore, hasDisabilityRecruit, allWageCompliant } = compliance;

    const requirements = [
      { label: 'Minimal 1 rekrutmen disabilitas aktif', done: hasDisabilityRecruit },
      { label: 'Semua lowongan aktif wage-compliant (≥ UMK)', done: allWageCompliant },
      { label: `Compliance Score minimal 80% — saat ini: ${complianceScore}%`, done: complianceScore >= 80 },
      { label: 'Profil perusahaan 100% lengkap (termasuk kondisi kantor)', done: profileComplete },
    ];

    const badgeEarned = requirements.every(r => r.done);
    const fulfilledCount = requirements.filter(r => r.done).length;
    // Cert number unik berdasarkan company ID dari database
    const certNumber = `ARC-2026-${companyId.slice(0, 6).toUpperCase()}`;

    res.json({
      hasProfile: true,
      badgeEarned,
      companyName,
      certNumber,
      complianceScore,
      requirements,
      fulfilledCount,
      totalRequirements: requirements.length,
    });
  } catch (err) {
    console.error('Badge status error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil status badge' });
  }
});

module.exports = router;
