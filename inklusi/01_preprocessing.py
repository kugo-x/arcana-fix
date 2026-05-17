"""
InklusiKerja — Step 1: Data Preprocessing Pipeline (v2)
=========================================================
Perubahan dari v1:
  - Normalisasi skill ambigu: 'r' → 'r programming', 'go' → 'golang'
  - Tambah JOB_SKILL_MAP: enrichment skill tags per job title
  - Tambah kolom 'skill_tags' di jobs (untuk fine-tuning & gap analysis)
  - document_text jobs diperkaya dengan '| skill relevan ...'
  - query_text kandidat pakai skills_list yang sudah dinormalisasi

Jalankan: python 01_preprocessing.py
"""

import pandas as pd
import numpy as np
import json
import re
import os

# ─── CONFIG ───────────────────────────────────────────────────────────────────
RAW_JOBS_CSV     = "data/job_titles_disabilitas.csv"
RAW_KANDIDAT_CSV = "data/kandidat_dummy.csv"
OUTPUT_DIR       = "data/processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─── SKILL NORMALIZATION ──────────────────────────────────────────────────────

# Skill yang terlalu pendek / ambigu → rename ke nama lengkap
# agar model embedding bisa mengenali konteksnya
SKILL_NORMALIZE = {
    "r"  : "r programming",
    "go" : "golang",
}

# Daftar skill yang dikenali untuk diekstrak dari deskripsi jobs
KNOWN_SKILLS = {
    # Programming languages
    "python", "r programming", "golang", "java", "javascript", "typescript",
    "php", "kotlin", "swift", "dart", "css", "html",
    # Frameworks & libraries
    "react", "vue.js", "node.js", "django", "fastapi", "spring boot",
    "laravel", "flutter", "react native", "bootstrap", "jetpack compose",
    "redis", "microservices", "rest api",
    # Data & BI
    "power bi", "tableau", "google data studio", "numpy", "pandas",
    "sql", "mysql", "postgresql", "sqlite", "excel", "google sheets",
    "machine learning dasar", "statistik", "data cleaning",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "gcp", "azure", "linux", "ci/cd",
    "jenkins", "terraform", "ansible",
    # Design & UX
    "figma", "adobe xd", "sketch", "invision", "canva",
    "adobe illustrator", "adobe photoshop", "coreldraw",
    "wireframing", "prototyping", "user research", "design system",
    # Marketing & Content
    "seo", "google ads", "facebook ads", "tiktok ads",
    "email marketing", "copywriting", "content creation",
    "digital marketing", "analitik media sosial",
    # Finance & ERP
    "hris", "sap", "erp", "myob", "accurate",
    # Security
    "firewall", "owasp", "penetration testing", "metasploit",
    "ethical hacking", "kriptografi", "iso 27001", "siem", "nmap",
    # QA
    "selenium", "cypress", "katalon", "postman", "jira",
    "qa documentation", "test case", "testing manual", "bug tracking",
    # Networking
    "cisco", "mikrotik", "vpn", "ccna",
    "monitoring jaringan", "server management", "networking",
    # Office & Admin
    "microsoft office", "microsoft excel", "microsoft word",
    "google workspace", "administrasi perkantoran",
    # Customer Service
    "zendesk", "freshdesk", "crm", "live chat",
    # Soft skills (relevan untuk CS/admin)
    "komunikasi", "problem solving", "empati", "penanganan keluhan",
    "notulensi", "manajemen jadwal", "pengarsipan",
    # Logistics
    "wms", "sap wm", "inventory", "supply chain",
    # HR
    "rekrutmen", "payroll", "manajemen kinerja",
    "pelatihan sdm", "hubungan industrial", "linkedin recruiter",
    # Education
    "e-learning", "zoom", "google classroom", "moodle",
    "microsoft teams", "kurikulum",
    # Creative / Media
    "motion graphics", "tipografi", "desain visual", "branding",
    "editing video", "capcut", "youtube", "instagram",
    "penulisan konten", "seo writing", "wordpress",
    # Finance
    "akuntansi", "jurnal keuangan", "pajak", "rekonsiliasi bank",
    "laporan keuangan", "audit internal",
    # Logistik / Gudang
    "manajemen gudang", "perencanaan distribusi",
    # Translation
    "penerjemahan", "proofreading", "lokalisasi", "sdl trados",
    "bahasa inggris", "bahasa jepang", "bahasa mandarin",
    # Data entry
    "ketelitian data", "pengetikan cepat", "spreadsheet",
}

# Mapping Job Title → canonical skill pool
# Ini yang paling menentukan kualitas matching!
# Tambahkan / sesuaikan jika ada job title baru di data kamu
JOB_SKILL_MAP = {
    "Customer Service Representative" : ["komunikasi", "problem solving", "crm", "penanganan keluhan", "empati"],
    "Customer Support Agent"          : ["zendesk", "freshdesk", "komunikasi", "live chat", "penanganan keluhan"],
    "Customer Support Specialist"     : ["crm", "komunikasi", "problem solving", "live chat", "empati"],
    "Telemarketer"                    : ["komunikasi", "crm", "problem solving"],
    "Telesales Agent"                 : ["komunikasi", "crm", "problem solving"],
    "Data Analyst"                    : ["sql", "excel", "python", "tableau", "power bi", "statistik", "pandas"],
    "Data Entry Operator"             : ["microsoft excel", "ketelitian data", "pengetikan cepat", "accurate", "spreadsheet"],
    "Data Entry Specialist"           : ["microsoft excel", "ketelitian data", "pengetikan cepat", "accurate", "spreadsheet"],
    "Graphic Designer"                : ["adobe illustrator", "adobe photoshop", "canva", "coreldraw", "desain visual", "tipografi"],
    "Illustrator"                     : ["adobe illustrator", "adobe photoshop", "coreldraw", "desain visual"],
    "Animator"                        : ["motion graphics", "canva", "adobe illustrator", "adobe photoshop", "tipografi"],
    "UI/UX Designer"                  : ["figma", "adobe xd", "wireframing", "prototyping", "user research", "design system", "sketch", "invision"],
    "Software Developer"              : ["python", "java", "javascript", "typescript", "react", "node.js", "docker", "git", "rest api"],
    "Programmer"                      : ["python", "java", "javascript", "php", "git", "rest api"],
    "QA Tester"                       : ["selenium", "cypress", "katalon", "postman", "jira", "qa documentation", "test case", "bug tracking", "testing manual"],
    "Digital Marketing Specialist"    : ["seo", "google ads", "facebook ads", "tiktok ads", "email marketing", "copywriting", "content creation", "analitik media sosial"],
    "Social Media Manager"            : ["instagram", "analitik media sosial", "copywriting", "content creation", "canva"],
    "Content Writer"                  : ["copywriting", "seo writing", "penulisan konten", "wordpress", "instagram"],
    "Freelance Writer"                : ["copywriting", "penulisan konten", "seo writing", "proofreading"],
    "Translator"                      : ["penerjemahan", "bahasa inggris", "bahasa jepang", "bahasa mandarin", "proofreading", "lokalisasi", "sdl trados"],
    "HR Specialist (Remote)"          : ["hris", "rekrutmen", "payroll", "manajemen kinerja", "pelatihan sdm", "linkedin recruiter", "hubungan industrial"],
    "Accountant"                      : ["akuntansi", "jurnal keuangan", "pajak", "accurate", "sap", "myob", "rekonsiliasi bank"],
    "Bookkeeper"                      : ["jurnal keuangan", "akuntansi", "accurate", "microsoft excel", "rekonsiliasi bank"],
    "Financial Analyst"               : ["microsoft excel", "sql", "python", "tableau", "laporan keuangan", "statistik"],
    "Administrative Clerk"            : ["microsoft office", "administrasi perkantoran", "manajemen jadwal", "notulensi", "surat menyurat", "google workspace"],
    "Virtual Assistant"               : ["microsoft office", "google workspace", "manajemen jadwal", "administrasi perkantoran", "notulensi"],
    "Remote Project Manager"          : ["microsoft office", "google workspace", "manajemen jadwal", "jira"],
    "Online Tutor"                    : ["e-learning", "zoom", "google classroom", "moodle", "microsoft teams", "kurikulum"],
    "Video Editor"                    : ["capcut", "editing video", "adobe photoshop", "youtube"],
    "Podcast Producer"                : ["editing video", "copywriting"],
    "Voice-over Artist"               : ["komunikasi"],
    "Transcriptionist"                : ["pengetikan cepat", "ketelitian data", "microsoft word"],
    "Researcher"                      : ["statistik", "python", "r programming", "google sheets", "microsoft excel"],
    "E-commerce Manager"              : ["digital marketing", "microsoft excel", "seo", "content creation"],
    "Online Moderator"                : ["komunikasi", "microsoft office", "google workspace"],
    "Archivist"                       : ["pengarsipan", "administrasi perkantoran", "microsoft office", "ketelitian data"],
    "Library Assistant"               : ["pengarsipan", "administrasi perkantoran", "microsoft office"],
    "Retail Stock Assistant"          : ["inventory", "microsoft excel", "manajemen gudang"],
    # Job manual/fisik — sengaja dibiarkan kosong, tidak butuh skill digital
    "Garden Maintenance Worker"       : [],
    "Laundry Worker"                  : [],
    "Food Packaging Worker"           : [],
    "Craft/Artisan Worker"            : [],
    "Cleaning Service"                : [],
    "Horticultural Therapist Assistant": [],
    "Art Therapist Assistant"         : [],
}


# ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """Lowercase, hapus karakter aneh, normalisasi spasi."""
    if pd.isna(text):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s,./\-+()]", "", text)
    return text


def normalize_skill(s: str) -> str:
    """
    Normalisasi satu skill:
      - strip + lowercase
      - ganti alias ambigu ke nama lengkap (r → r programming, go → golang)
    """
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    return SKILL_NORMALIZE.get(s, s)


def extract_skills_from_text(text: str) -> list:
    """
    Cari skill yang dikenal (KNOWN_SKILLS) dari teks deskripsi.
    Menggunakan word-boundary agar 'sql' tidak mencocokkan 'nosql'.
    """
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return found


def get_job_skill_tags(row: pd.Series) -> list:
    """
    Gabungkan skill dari 2 sumber (urutan prioritas):
      1. Skill yang tersebut eksplisit di Deskripsi Kualifikasi
      2. Canonical skill pool dari JOB_SKILL_MAP berdasarkan Job Title
    Deduplikasi, pertahankan urutan.
    """
    extracted = extract_skills_from_text(row["Deskripsi Kualifikasi"])
    mapped    = JOB_SKILL_MAP.get(row["Job Title"], [])
    combined  = list(dict.fromkeys(extracted + mapped))   # deduplicate
    return combined


def build_job_document(row: pd.Series) -> str:
    """
    Buat document_text untuk embedding jobs.
    Diperkaya dengan 'skill relevan' agar ada shared vocabulary
    dengan query kandidat yang mengandung nama skill eksplisit.

    Format:
      posisi X | jenis disabilitas Y | level Z |
      kualifikasi ... | skill relevan a, b, c |
      aksesibilitas yang disediakan ...
    """
    skill_part = ""
    if row["skill_tags"]:
        skill_part = f" | skill relevan {', '.join(row['skill_tags'])}"

    parts = [
        f"posisi {clean_text(row['Job Title'])}",
        f"jenis disabilitas {clean_text(row['Jenis Disabilitas'])}",
        f"level {clean_text(row['Level'])}",
        f"kualifikasi {clean_text(row['Deskripsi Kualifikasi'])}",
    ]
    doc = " | ".join(parts)
    doc += skill_part
    doc += f" | aksesibilitas yang disediakan {clean_text(row['Kebutuhan Aksesibilitas'])}"
    return doc


def build_kandidat_document(row: pd.Series) -> str:
    """
    Buat query_text untuk embedding kandidat.
    Menggunakan skills_list yang sudah dinormalisasi
    (bukan kolom 'skills' raw).
    """
    skills_str = ", ".join(row["skills_list"])
    parts = [
        f"jenis disabilitas {clean_text(row['disability_type'])}",
        f"skill yang dimiliki {skills_str}",
        f"profil fungsional {clean_text(row['functional_profile'])}",
    ]
    return " | ".join(parts)


# ─── MAIN PROCESSING ──────────────────────────────────────────────────────────

def process_jobs() -> pd.DataFrame:
    print("📂 Membaca data pekerjaan...")
    df = pd.read_csv(RAW_JOBS_CSV)
    print(f"   → {len(df)} baris ditemukan")
    print(f"   → Kolom: {df.columns.tolist()}")

    # Deduplikasi
    before = len(df)
    df = df.drop_duplicates()
    print(f"   → Setelah dedup: {len(df)} baris ({before - len(df)} dihapus)")

    # Reset index & buat job_id
    df = df.reset_index(drop=True)
    df["job_id"] = df.index.map(lambda i: f"JOB{i:04d}")

    # ── BARU: Skill tags (enrichment) ──
    df["skill_tags"] = df.apply(get_job_skill_tags, axis=1)

    # ── BARU: document_text diperkaya ──
    df["document_text"] = df.apply(build_job_document, axis=1)

    # Level ranking
    level_order = {
        "entry level"      : 1,
        "mid level"        : 2,
        "senior level"     : 3,
        "lead / manajerial": 4,
    }
    df["level_rank"] = df["Level"].str.lower().map(level_order).fillna(2)

    # Statistik
    print(f"\n📊 Distribusi Jenis Disabilitas:")
    print(df["Jenis Disabilitas"].value_counts().to_string())
    print(f"\n📊 Distribusi Level:")
    print(df["Level"].value_counts().to_string())

    jobs_with_skills = df[df["skill_tags"].str.len() > 0]
    print(f"\n📊 Jobs dengan skill tags: {len(jobs_with_skills)}/{len(df)}")

    out_path = f"{OUTPUT_DIR}/jobs_processed.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Saved → {out_path}")
    return df


def process_kandidat() -> pd.DataFrame:
    print("\n📂 Membaca data kandidat...")
    df = pd.read_csv(RAW_KANDIDAT_CSV)
    print(f"   → {len(df)} kandidat ditemukan")

    # ── BARU: Normalisasi skills sebelum dipakai ──
    # Parse → normalize tiap skill → simpan kembali
    def parse_and_normalize(skills_raw: str) -> list:
        skills = [s.strip() for s in str(skills_raw).split(",") if s.strip()]
        normalized = [normalize_skill(s) for s in skills]
        # Deduplicate, pertahankan urutan
        seen, result = set(), []
        for s in normalized:
            if s not in seen:
                seen.add(s)
                result.append(s)
        return result

    df["skills_list"] = df["skills"].apply(parse_and_normalize)

    # Update kolom 'skills' (versi display, Title Case)
    def to_display(skills_list: list) -> str:
        display_map = {
            "r programming": "R Programming",
            "golang"       : "Golang",
        }
        return ", ".join(display_map.get(s, s.title()) for s in skills_list)

    df["skills"] = df["skills_list"].apply(to_display)

    # ── query_text pakai skills_list yang sudah bersih ──
    df["query_text"] = df.apply(build_kandidat_document, axis=1)

    print(f"\n📊 Distribusi Jenis Disabilitas Kandidat:")
    print(df["disability_type"].value_counts().to_string())

    # Cek skill ambigu yang berhasil dinormalisasi
    all_skills = [s for lst in df["skills_list"] for s in lst]
    normalized_count = sum(1 for s in all_skills if s in ("r programming", "golang"))
    print(f"\n✅ Skill ternormalisasi (r/go → nama lengkap): {normalized_count} entri")

    out_path = f"{OUTPUT_DIR}/kandidat_processed.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Saved → {out_path}")
    return df


def generate_data_report(jobs_df: pd.DataFrame, kandidat_df: pd.DataFrame):
    """Buat laporan statistik dataset."""
    report = {
        "jobs": {
            "total_rows"         : len(jobs_df),
            "unique_job_titles"  : jobs_df["Job Title"].nunique(),
            "disability_types"   : jobs_df["Jenis Disabilitas"].nunique(),
            "levels"             : jobs_df["Level"].unique().tolist(),
            "jobs_with_skill_tags": int((jobs_df["skill_tags"].str.len() > 0).sum()),
            "sample_document"    : jobs_df["document_text"].iloc[0],
        },
        "kandidat": {
            "total_rows"      : len(kandidat_df),
            "disability_types": kandidat_df["disability_type"].nunique(),
            "sample_query"    : kandidat_df["query_text"].iloc[0],
        }
    }

    report_path = f"{OUTPUT_DIR}/data_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n📋 Data report → {report_path}")

    print("\n━━━ SAMPLE JOB DOCUMENT (akan di-embed) ━━━")
    print(jobs_df["document_text"].iloc[0])
    print("\n━━━ SAMPLE KANDIDAT QUERY ━━━")
    print(kandidat_df["query_text"].iloc[0])


if __name__ == "__main__":
    print("=" * 60)
    print("InklusiKerja — Data Preprocessing Pipeline v2")
    print("=" * 60)

    jobs_df     = process_jobs()
    kandidat_df = process_kandidat()
    generate_data_report(jobs_df, kandidat_df)

    print("\n✅ Preprocessing selesai! Lanjut ke 02_embedding.py")
    print("   Catatan: jalankan 02_embedding.py untuk rebuild FAISS index")
    print("   dengan data yang sudah diperkaya.")
