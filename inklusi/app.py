# =============================================================================
# Portal Inklusi - Sistem Rekomendasi Lowongan Kerja Penyandang Disabilitas
# Tim 3 Roda | Hackathon Project
# Metode: NLP Semantic Search (Sentence Transformers + FAISS)
# =============================================================================

import streamlit as st
import pandas as pd
import numpy as np
import faiss
import os
import io
from sentence_transformers import SentenceTransformer

# =============================================================================
# KONFIGURASI HALAMAN STREAMLIT
# =============================================================================
st.set_page_config(
    page_title="Portal Inklusi - Tim 3 Roda",
    page_icon="♿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS kustom untuk tampilan yang lebih rapi dan profesional
st.markdown("""
<style>
    /* Header utama */
    .main-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .main-header h1 {
        color: #e94560;
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0;
    }
    .main-header p {
        color: #a8b2c1;
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    /* Kartu profil kandidat */
    .profile-card {
        background: linear-gradient(135deg, #0f3460, #16213e);
        border: 1px solid #e94560;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 12px rgba(233, 69, 96, 0.2);
    }
    .profile-card h3 {
        color: #e94560;
        margin-bottom: 0.5rem;
    }
    .profile-card p {
        color: #c9d1d9;
        margin: 0.3rem 0;
        font-size: 0.95rem;
    }
    .profile-card .label {
        color: #8b949e;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Kartu hasil lowongan */
    .job-card {
        background: #161b22;
        border: 1px solid #30363d;
        border-left: 4px solid #e94560;
        border-radius: 10px;
        padding: 1.4rem;
        margin-bottom: 1rem;
        transition: transform 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .job-card:hover {
        transform: translateX(4px);
        border-left-color: #f97316;
    }
    .job-card h4 {
        color: #58a6ff;
        margin: 0 0 0.5rem 0;
        font-size: 1.15rem;
    }
    .job-card .match-score {
        font-size: 1.6rem;
        font-weight: 900;
        color: #3fb950;
        float: right;
    }
    .job-card .match-score.medium {
        color: #f0883e;
    }
    .job-card .match-score.low {
        color: #ff7b72;
    }
    .job-card .meta {
        color: #8b949e;
        font-size: 0.85rem;
        margin: 0.2rem 0;
    }
    .job-card .description {
        color: #c9d1d9;
        font-size: 0.9rem;
        margin-top: 0.8rem;
        border-top: 1px solid #30363d;
        padding-top: 0.8rem;
    }
    .penalty-badge {
        background: #3d1f1f;
        color: #ff7b72;
        font-size: 0.72rem;
        padding: 2px 8px;
        border-radius: 20px;
        border: 1px solid #ff7b72;
        margin-left: 8px;
        vertical-align: middle;
    }

    /* Tag skills */
    .skill-tag {
        display: inline-block;
        background: #1f3a5f;
        color: #79c0ff;
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 0.8rem;
        margin: 2px;
        border: 1px solid #388bfd;
    }
    .disability-badge {
        display: inline-block;
        background: #2d1b4e;
        color: #bc8cff;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 0.85rem;
        border: 1px solid #8957e5;
        font-weight: 600;
    }

    /* Ranking nomor */
    .rank-number {
        display: inline-block;
        background: #e94560;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        text-align: center;
        line-height: 28px;
        font-weight: bold;
        font-size: 0.9rem;
        margin-right: 8px;
    }

    /* Progress bar kecocokan */
    .match-bar-container {
        background: #21262d;
        border-radius: 10px;
        height: 8px;
        margin: 6px 0;
        overflow: hidden;
    }
    .match-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.5s ease;
    }

    /* Info box */
    .info-box {
        background: #0d2137;
        border: 1px solid #1f6feb;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        color: #79c0ff;
        font-size: 0.9rem;
        margin: 1rem 0;
    }

    /* Sidebar styling */
    .stSidebar {
        background: #0d1117 !important;
    }

    /* Sembunyikan watermark default streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# =============================================================================
# LANGKAH 1: FUNGSI LOADING & PREPROCESSING DATA
# =============================================================================

@st.cache_data
def load_data(kandidat_file=None, lowongan_file=None):
    """
    Memuat data kandidat dan lowongan dari file CSV.
    Mendukung upload file melalui UI atau menggunakan file lokal sebagai fallback.
    """
    # --- Load Kandidat ---
    if kandidat_file is not None:
        df_kandidat = pd.read_csv(kandidat_file)
    else:
        # Fallback ke file lokal jika tidak ada upload
        local_path = "kandidat_dummy.csv"
        if os.path.exists(local_path):
            df_kandidat = pd.read_csv(local_path)
        else:
            st.error("❌ File kandidat_dummy.csv tidak ditemukan. Silakan upload file melalui sidebar.")
            st.stop()

    # --- Load Lowongan ---
    if lowongan_file is not None:
        df_lowongan = pd.read_csv(lowongan_file)
    else:
        local_path = "lowongan_dummy.csv"
        if os.path.exists(local_path):
            df_lowongan = pd.read_csv(local_path)
        else:
            st.error("❌ File lowongan_dummy.csv tidak ditemukan. Silakan upload file melalui sidebar.")
            st.stop()

    # --- Preprocessing: Gabungkan kolom teks untuk representasi semantik ---
    # Teks lowongan = required_skills + deskripsi pekerjaan (konteks lengkap)
    df_lowongan["teks_lowongan"] = (
        df_lowongan["required_skills"].fillna("") + " " +
        df_lowongan["description"].fillna("")
    )

    # Teks kandidat = skills + profil fungsional (mendeskripsikan kemampuan & kondisi)
    df_kandidat["teks_kandidat"] = (
        df_kandidat["skills"].fillna("") + " " +
        df_kandidat["functional_profile"].fillna("")
    )

    return df_kandidat, df_lowongan


# =============================================================================
# LANGKAH 2: FUNGSI VECTORIZATION & INDEXING DENGAN FAISS
# =============================================================================

@st.cache_resource
def build_faiss_index(_df_lowongan, _model):
    """
    Mengubah semua teks lowongan menjadi vektor semantik menggunakan
    SentenceTransformer, lalu membangun FAISS index untuk pencarian cepat.
    
    Catatan: Parameter diawali _ agar Streamlit tidak mencoba hash DataFrame/model.
    """
    teks_list = _df_lowongan["teks_lowongan"].tolist()

    # Encode semua teks lowongan → vektor float32
    # show_progress_bar=False agar tidak flood output di Streamlit
    with st.spinner("⚙️ Membangun indeks semantik lowongan... (hanya sekali saat pertama kali)"):
        embeddings = _model.encode(
            teks_list,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=64
        )

    # Konversi ke float32 (diperlukan FAISS)
    embeddings = embeddings.astype(np.float32)

    # Normalisasi L2 → Inner Product = Cosine Similarity
    faiss.normalize_L2(embeddings)

    # Buat FAISS Index dengan IndexFlatIP (Inner Product)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    return index, embeddings


@st.cache_resource
def load_model():
    """
    Memuat model SentenceTransformer multilingual.
    Di-cache agar hanya diload sekali selama sesi.
    """
    with st.spinner("🤖 Memuat model NLP... (hanya sekali)"):
        model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return model


# =============================================================================
# LANGKAH 3: RULE-BASED PENALTY SYSTEM
# =============================================================================

def hitung_penalti(disability_type: str, job_description: str) -> tuple[float, list[str]]:
    """
    Menerapkan sistem penalti berbasis aturan (rule-based) berdasarkan
    jenis disabilitas dan konten deskripsi lowongan.
    
    Returns:
        penalti_factor (float): Pengali skor. 1.0 = tidak ada penalti, 0.5 = penalti 50%
        alasan_penalti (list[str]): Daftar kata kunci yang memicu penalti
    """
    desc_lower = job_description.lower()
    disability_lower = disability_type.lower()
    penalti_factor = 1.0
    alasan_penalti = []

    # --- RULE 1: Tunanetra / Gangguan Penglihatan ---
    # Pekerjaan yang membutuhkan kemampuan visual intensif
    if "tunanetra" in disability_lower or "gangguan penglihatan" in disability_lower:
        kata_visual = ["visual", "ui/ux", "desain", "photoshop", "canva",
                       "mengemudi", "lapangan", "ilustrasi", "videografi",
                       "color grading", "figma", "adobe xd", "3d modeling"]
        for kata in kata_visual:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 2: Tunadaksa / Gangguan Daksa ---
    # Pekerjaan yang membutuhkan mobilitas fisik tinggi atau angkat beban
    if "tunadaksa" in disability_lower or "gangguan daksa" in disability_lower:
        kata_fisik = ["lapangan", "mobilitas tinggi", "sales", "mengangkat beban",
                      "berkendara", "instalasi langsung", "kunjungan lapangan",
                      "survei lapangan", "patroli", "fisik prima"]
        for kata in kata_fisik:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 3: Tunarungu / Gangguan Pendengaran ---
    # Pekerjaan yang sangat bergantung pada komunikasi audio
    if "tunarungu" in disability_lower or "gangguan pendengaran" in disability_lower or "tuli" in disability_lower:
        kata_audio = ["telepon", "call center", "customer service audio",
                      "komunikasi telepon", "voice over", "podcast",
                      "transcribing audio", "inbound call", "outbound call"]
        for kata in kata_audio:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 4: Tunawicara / Gangguan Bicara ---
    # Pekerjaan yang membutuhkan komunikasi lisan sebagai inti tugas
    if "tunawicara" in disability_lower or "gangguan bicara" in disability_lower:
        kata_bicara = ["presentasi langsung", "public speaking", "pitching langsung",
                       "telemarketing", "voice talent", "siaran langsung",
                       "customer facing verbal", "negosiasi lisan"]
        for kata in kata_bicara:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 5: Gangguan Mental / Psikososial ---
    # Pekerjaan dengan tekanan tinggi atau lingkungan tidak terstruktur
    if "mental" in disability_lower or "psikososial" in disability_lower:
        kata_tekanan = ["tekanan tinggi", "deadline ketat", "target agresif",
                        "lingkungan tidak terstruktur", "jam kerja tidak menentu",
                        "on-call 24 jam", "crisis management langsung",
                        "target penjualan harian"]
        for kata in kata_tekanan:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 6: Gangguan Intelektual ---
    # Pekerjaan dengan kompleksitas kognitif sangat tinggi tanpa struktur jelas
    if "intelektual" in disability_lower:
        kata_kognitif = ["analisis kompleks independen", "pengambilan keputusan strategis",
                         "multi-tasking intensif", "kreasi konsep abstrak", "riset mandiri mendalam"]
        for kata in kata_kognitif:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    # --- RULE 7: Acquired Brain Injury (ABI) ---
    # Mirip gangguan intelektual + fisik, hindari pekerjaan multi-tugas berat
    if "acquired brain injury" in disability_lower or "abi" in disability_lower:
        kata_abi = ["multi-tasking", "tekanan tinggi", "lapangan", "fisik prima",
                    "on-call 24 jam", "rotasi shift tidak beraturan"]
        for kata in kata_abi:
            if kata in desc_lower:
                penalti_factor = min(penalti_factor, 0.5)
                alasan_penalti.append(f'"{kata}"')

    return penalti_factor, list(set(alasan_penalti))  # deduplikasi alasan


# =============================================================================
# LANGKAH 3 (lanjutan): FUNGSI UTAMA PENCARIAN REKOMENDASI
# =============================================================================

def cari_rekomendasi(
    kandidat_id: str,
    df_kandidat: pd.DataFrame,
    df_lowongan: pd.DataFrame,
    model: SentenceTransformer,
    faiss_index,
    top_k: int = 10
) -> tuple[dict, pd.DataFrame]:
    """
    Fungsi utama: Mencari Top-N rekomendasi lowongan untuk kandidat tertentu.
    
    Alur:
    1. Ambil data kandidat berdasarkan ID
    2. Encode teks kandidat → vektor
    3. Cari Top-K lowongan terdekat dengan FAISS (cosine similarity)
    4. Terapkan rule-based penalty
    5. Urutkan ulang berdasarkan skor final
    
    Returns:
        info_kandidat (dict): Data profil kandidat
        hasil_df (pd.DataFrame): DataFrame rekomendasi yang sudah diberi skor
    """
    # --- Ambil data kandidat ---
    kandidat_row = df_kandidat[df_kandidat["kandidat_id"] == kandidat_id]
    if kandidat_row.empty:
        st.error(f"Kandidat dengan ID '{kandidat_id}' tidak ditemukan.")
        return None, None

    kandidat_row = kandidat_row.iloc[0]
    info_kandidat = {
        "id": kandidat_row["kandidat_id"],
        "disability_type": kandidat_row["disability_type"],
        "skills": kandidat_row["skills"],
        "functional_profile": kandidat_row["functional_profile"],
        "teks_kandidat": kandidat_row["teks_kandidat"]
    }

    # --- Encode teks kandidat → vektor ---
    query_vector = model.encode(
        [info_kandidat["teks_kandidat"]],
        convert_to_numpy=True
    ).astype(np.float32)

    # Normalisasi L2 agar konsisten dengan index (cosine similarity)
    faiss.normalize_L2(query_vector)

    # --- Pencarian FAISS: ambil Top-K lowongan berdasarkan cosine similarity ---
    scores, indices = faiss_index.search(query_vector, top_k)

    # scores[0] = array cosine similarity, indices[0] = array index baris di df_lowongan
    raw_scores = scores[0]
    raw_indices = indices[0]

    # --- Terapkan Rule-Based Penalty ---
    hasil = []
    for rank, (idx, raw_score) in enumerate(zip(raw_indices, raw_scores)):
        if idx < 0:  # FAISS kadang return -1 jika tidak cukup hasil
            continue

        lowongan = df_lowongan.iloc[idx]
        description = str(lowongan.get("description", ""))

        # Hitung penalti berdasarkan jenis disabilitas & konten deskripsi
        penalti_factor, alasan_penalti = hitung_penalti(
            info_kandidat["disability_type"],
            description
        )

        # Skor final setelah penalti (masih dalam skala 0-1)
        final_score = float(raw_score) * penalti_factor

        hasil.append({
            "rank_awal": rank + 1,
            "lowongan_id": lowongan["lowongan_id"],
            "title": lowongan["title"],
            "required_skills": lowongan["required_skills"],
            "description": description,
            "offered_salary": lowongan["offered_salary"],
            "location": lowongan["location"],
            "skor_mentah": float(raw_score),
            "penalti_factor": penalti_factor,
            "alasan_penalti": ", ".join(alasan_penalti) if alasan_penalti else None,
            "skor_final": final_score,
            # Konversi ke persentase, clamp antara 0%-100%
            "persentase_kecocokan": min(100, max(0, round(final_score * 100, 1)))
        })

    # Urutkan berdasarkan skor final (descending)
    hasil_df = pd.DataFrame(hasil).sort_values("skor_final", ascending=False).reset_index(drop=True)

    return info_kandidat, hasil_df


# =============================================================================
# LANGKAH 4: STREAMLIT UI
# =============================================================================

def render_skill_tags(skills_str: str) -> str:
    """Mengubah string skills (dipisah koma) menjadi HTML badge tags."""
    if not skills_str:
        return ""
    tags_html = ""
    for skill in skills_str.split(","):
        skill = skill.strip()
        if skill:
            tags_html += f'<span class="skill-tag">{skill}</span>'
    return tags_html


def format_salary(salary: int) -> str:
    """Format angka gaji menjadi format Rupiah yang mudah dibaca."""
    try:
        salary = int(salary)
        if salary >= 1_000_000:
            return f"Rp {salary:,.0f}".replace(",", ".")
        return f"Rp {salary:,}"
    except (ValueError, TypeError):
        return str(salary)


def get_score_color(score: float) -> str:
    """Menentukan warna berdasarkan persentase kecocokan."""
    if score >= 65:
        return "#3fb950"   # hijau
    elif score >= 40:
        return "#f0883e"   # oranye
    else:
        return "#ff7b72"   # merah


def main():
    # ── Header Utama ──────────────────────────────────────────────────────────
    st.markdown("""
    <div class="main-header">
        <h1>♿ Portal Inklusi</h1>
        <p>Sistem Rekomendasi Lowongan Kerja untuk Penyandang Disabilitas &nbsp;|&nbsp; <strong>Tim 3 Roda</strong></p>
        <p style="font-size:0.8rem; color:#555e6b; margin-top:0.3rem;">
            Powered by NLP Semantic Search · SentenceTransformers · FAISS
        </p>
    </div>
    """, unsafe_allow_html=True)

    # ── Sidebar: Upload File & Pengaturan ────────────────────────────────────
    with st.sidebar:
        st.image("https://img.icons8.com/fluency/96/accessibility.png", width=80)
        st.title("⚙️ Pengaturan")

        st.markdown("### 📂 Upload Data")
        st.info("Jika tidak diupload, sistem akan menggunakan file lokal `kandidat_dummy.csv` dan `lowongan_dummy.csv`.")

        uploaded_kandidat = st.file_uploader(
            "Upload Kandidat CSV",
            type=["csv"],
            help="Format: kandidat_id, disability_type, skills, functional_profile"
        )
        uploaded_lowongan = st.file_uploader(
            "Upload Lowongan CSV",
            type=["csv"],
            help="Format: lowongan_id, title, required_skills, description, offered_salary, location"
        )

        st.divider()
        st.markdown("### 📊 Pengaturan Hasil")
        top_n = st.slider(
            "Jumlah Rekomendasi Ditampilkan",
            min_value=1, max_value=10, value=5, step=1,
            help="Menampilkan N lowongan teratas setelah penalti"
        )

        st.divider()
        st.markdown("### ℹ️ Tentang Sistem")
        st.markdown("""
        **Metode:** NLP Semantic Search  
        **Model:** `paraphrase-multilingual-MiniLM-L12-v2`  
        **Index:** FAISS IndexFlatIP (Cosine Similarity)  
        **Penalti:** Rule-based per tipe disabilitas  
        
        > ⚡ Tidak memerlukan data training — murni data mining & semantic search.
        """)

    # ── Load Data ─────────────────────────────────────────────────────────────
    df_kandidat, df_lowongan = load_data(
        kandidat_file=uploaded_kandidat,
        lowongan_file=uploaded_lowongan
    )

    # ── Load Model & Build Index ───────────────────────────────────────────────
    model = load_model()
    faiss_index, _ = build_faiss_index(df_lowongan, model)

    # ── Tampilkan Statistik Ringkas ────────────────────────────────────────────
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        st.metric("👤 Total Kandidat", f"{len(df_kandidat):,}")
    with col_b:
        st.metric("💼 Total Lowongan", f"{len(df_lowongan):,}")
    with col_c:
        n_disability = df_kandidat["disability_type"].nunique()
        st.metric("♿ Tipe Disabilitas", f"{n_disability} Tipe")

    st.divider()

    # ── Panel Pencarian ────────────────────────────────────────────────────────
    st.markdown("## 🔍 Cari Rekomendasi Lowongan")

    col1, col2 = st.columns([3, 1])
    with col1:
        # Dropdown pilih kandidat
        list_kandidat_ids = df_kandidat["kandidat_id"].tolist()
        selected_id = st.selectbox(
            "Pilih ID Kandidat",
            options=list_kandidat_ids,
            help="Pilih ID kandidat untuk mencari lowongan yang paling sesuai",
            index=0
        )

        # Tampilkan preview profil singkat saat ID dipilih
        preview = df_kandidat[df_kandidat["kandidat_id"] == selected_id].iloc[0]
        st.caption(
            f"📌 {preview['disability_type']}  ·  🛠️ {preview['skills'][:80]}{'...' if len(str(preview['skills'])) > 80 else ''}"
        )

    with col2:
        st.markdown("<br>", unsafe_allow_html=True)  # spacer vertikal
        cari_button = st.button(
            "🚀 Cari Kecocokan",
            type="primary",
            use_container_width=True
        )

    # ── Proses & Tampilkan Hasil ───────────────────────────────────────────────
    if cari_button:
        with st.spinner(f"🔄 Menganalisis kecocokan untuk kandidat **{selected_id}**..."):
            info_kandidat, hasil_df = cari_rekomendasi(
                kandidat_id=selected_id,
                df_kandidat=df_kandidat,
                df_lowongan=df_lowongan,
                model=model,
                faiss_index=faiss_index,
                top_k=10  # Ambil 10 dulu, lalu tampilkan top_n setelah penalti
            )

        if info_kandidat is None:
            st.error("Kandidat tidak ditemukan. Periksa kembali ID yang dipilih.")
            return

        # ── Kartu Profil Kandidat ──────────────────────────────────────────
        st.markdown("### 👤 Profil Kandidat")
        skill_tags_html = render_skill_tags(info_kandidat['skills'])
        st.markdown(f"""
        <div class="profile-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap;">
                <div>
                    <h3>🆔 {info_kandidat['id']}</h3>
                    <p class="label">Tipe Disabilitas</p>
                    <p><span class="disability-badge">♿ {info_kandidat['disability_type']}</span></p>
                </div>
            </div>
            <br>
            <p class="label">Keahlian Utama</p>
            <p>{skill_tags_html}</p>
            <br>
            <p class="label">Profil Fungsional</p>
            <p>{info_kandidat['functional_profile'][:300]}{'...' if len(info_kandidat['functional_profile']) > 300 else ''}</p>
        </div>
        """, unsafe_allow_html=True)

        # ── Top-N Rekomendasi Lowongan ─────────────────────────────────────
        tampil_df = hasil_df.head(top_n)

        st.markdown(f"### 💼 Top {top_n} Lowongan Paling Cocok")

        # Hitung berapa yang kena penalti untuk info user
        ada_penalti = hasil_df.head(top_n)["alasan_penalti"].notna().sum()
        if ada_penalti > 0:
            st.markdown(f"""
            <div class="info-box">
                ⚠️ <strong>{ada_penalti} dari {top_n} lowongan</strong> mendapat penyesuaian skor karena 
                mengandung persyaratan yang kurang sesuai dengan profil disabilitas kandidat.
                Skor yang ditampilkan sudah memperhitungkan penyesuaian ini.
            </div>
            """, unsafe_allow_html=True)

        for rank_idx, (_, row) in enumerate(tampil_df.iterrows()):
            score_pct = row["persentase_kecocokan"]
            score_color = get_score_color(score_pct)
            score_class = "match-score" + (" medium" if 40 <= score_pct < 65 else " low" if score_pct < 40 else "")

            # Tag penalti (jika ada)
            penalti_html = ""
            if row["alasan_penalti"]:
                penalti_html = f'<span class="penalty-badge">⚠️ Penalti: {row["alasan_penalti"]}</span>'

            # Tag keahlian yang dibutuhkan
            req_skills_tags = render_skill_tags(row["required_skills"])

            # Deskripsi dipotong agar ringkas
            desc_pendek = str(row["description"])[:200] + ("..." if len(str(row["description"])) > 200 else "")

            # Bar visual kecocokan
            bar_color = score_color
            bar_width = score_pct

            st.markdown(f"""
            <div class="job-card">
                <div style="overflow:hidden;">
                    <span class="rank-number">{rank_idx + 1}</span>
                    <span style="font-size:1.1rem; font-weight:700; color:#58a6ff;">{row['title']}</span>
                    {penalti_html}
                    <span class="{score_class}" style="float:right; color:{score_color};">{score_pct}%</span>
                </div>

                <div class="match-bar-container" style="clear:both; margin-top:8px;">
                    <div class="match-bar" style="width:{bar_width}%; background:{bar_color};"></div>
                </div>

                <div style="margin-top:0.8rem;">
                    <p class="meta">📍 <strong>Lokasi:</strong> {row['location']}</p>
                    <p class="meta">💰 <strong>Gaji:</strong> {format_salary(row['offered_salary'])} / bulan</p>
                    <p class="meta">🆔 <strong>ID Lowongan:</strong> {row['lowongan_id']}</p>
                </div>

                <div style="margin-top:0.6rem;">
                    <p class="meta"><strong>Keahlian Dibutuhkan:</strong></p>
                    <p>{req_skills_tags}</p>
                </div>

                <div class="description">
                    <strong>Deskripsi Singkat:</strong><br>
                    {desc_pendek}
                </div>
            </div>
            """, unsafe_allow_html=True)

        # ── Tabel Lengkap (Expandable) ─────────────────────────────────────
        with st.expander("📊 Lihat Data Lengkap Semua 10 Kandidat Teratas (Sebelum Filter Top-N)"):
            tabel_tampil = hasil_df[[
                "rank_awal", "lowongan_id", "title", "location",
                "offered_salary", "skor_mentah", "penalti_factor",
                "alasan_penalti", "skor_final", "persentase_kecocokan"
            ]].copy()
            tabel_tampil.columns = [
                "Rank Awal", "ID Lowongan", "Judul", "Lokasi",
                "Gaji", "Skor Mentah", "Faktor Penalti",
                "Alasan Penalti", "Skor Final", "Kecocokan (%)"
            ]
            tabel_tampil["Skor Mentah"] = tabel_tampil["Skor Mentah"].map("{:.4f}".format)
            tabel_tampil["Skor Final"] = tabel_tampil["Skor Final"].map("{:.4f}".format)
            tabel_tampil["Gaji"] = tabel_tampil["Gaji"].apply(format_salary)
            st.dataframe(tabel_tampil, use_container_width=True, hide_index=True)

        # ── Download Hasil ─────────────────────────────────────────────────
        csv_export = hasil_df.drop(columns=["description"]).to_csv(index=False)
        st.download_button(
            label="⬇️ Download Hasil Rekomendasi (CSV)",
            data=csv_export,
            file_name=f"rekomendasi_{selected_id}.csv",
            mime="text/csv"
        )

    else:
        # Tampilan default sebelum tombol ditekan
        st.markdown("""
        <div style="text-align:center; padding:3rem 1rem; color:#8b949e;">
            <p style="font-size:3rem;">🎯</p>
            <p style="font-size:1.1rem;">Pilih ID kandidat dan tekan <strong>🚀 Cari Kecocokan</strong><br>untuk melihat rekomendasi lowongan yang paling sesuai.</p>
        </div>
        """, unsafe_allow_html=True)


# =============================================================================
# ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    main()
