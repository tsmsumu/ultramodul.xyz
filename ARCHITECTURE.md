# 🏛️ UltraModul Platform Architecture

> **AI SYSTEM INSTRUCTION:** Kamu WAJIB menaati semua aturan di dalam file ini sebelum mulai menulis kode apa pun untuk platform UltraModul.

## 1. Identitas Enterprise
*   **Aplikasi Utama:** UltraModul Enterprise Platform (ultramodul.xyz)
*   **Visi:** Menyediakan antarmuka manajemen super-app tingkat pemerintah dan enterprise dengan estetika mewah dan keamanan ekstrem.
*   **Multi-Platform Strategy:** Jika ada sub-aplikasi baru (seperti NexS, SS8, SS9), buatlah *Repository GitHub* terpisah untuk menjaga agar ingatan AI tidak tercampur (*Zero-Amnesia Boundaries*).

## 2. Tech Stack & Framework (Ultra Modern)
*   **Monorepo Engine:** `pnpm workspaces` / `Turborepo`. Sangat wajib untuk *Zero-Redundancy* kode. Package dipisah menjadi `@ultra/ui`, `@ultra/db`, `@ultra/core`.
*   **Frontend:** Next.js 15+ (App Router, Server Actions, React Server Components).
*   **Bahasa:** TypeScript Strict Mode. Dilarang keras menggunakan `any`.
*   **Styling Utama:** `Tailwind CSS` + `Framer Motion` + Komponen *Headless* (`Shadcn UI`). Ini standar absolut Vercel untuk stabilitas dan keindahan desain.
*   **Database Engine:** `DuckDB` (Data Lake/Parquet analitik) & `better-sqlite3` + `Drizzle ORM` (Relasional log/konfigurasi lokal paling cepat).
*   **State Management:** `Zustand` (untuk efisiensi memori di *Client*).

## 3. Aturan Desain Antarmuka (Aesthetics)
UltraModul WAJIB terlihat lebih mahal dari platform global mana pun:
*   **Color Palette:** *Dark Mode Exclusive* (Hitam kelam #09090b, aksen presisi).
*   **Komponen UI (`Shadcn`):** Wajib bersih, memiliki garis batas (border) halus, efek *Glassmorphism* (`backdrop-blur`), dan *Skeleton Loading* untuk setiap *Fetch* data.
*   **Micro-Interactions:** Transisi instan (0.2s) dengan *Framer Motion*. Dilarang menggunakan *Loading Spinner* yang muter-muter tanpa batas.

## 4. Partisi Kode (Zoning Code)
Semua pekerjaan wajib diisolasi dengan ketat:
*   `src/components/ui/` : Khusus tombol, tabel, dan kartu visual (Tidak boleh ada tarikan logika Fetch DB di sini).
*   `src/app/(dashboard)/` : Khusus pengaturan rute dan halaman statis.
*   `src/lib/` : Khusus otak logika komputasi, analitik DuckDB, dan koneksi API.

## 5. Hukum Mutlak Akses (The IAM Absolute Gatekeeper)
*   **Sentralisasi Kehormatan IAM:** Semua menu, modul, fitur, dan *tools* (seperti PUM Nexus, Data Sanitizer, dll) **WAJIB** bermuara pada persetujuan sistem *IAM (Identity & Access Management)*. IAM adalah **The Ultimate Gatekeeper**.
*   **Anti-Hardcode Menu:** Dilarang keras menanamkan *(Hardcode)* menu navigasi di *Sidebar*. Setiap kemunculan rute UI harus berdasarkan hak akses *(Role/Access Matrix)* yang terdaftar resmi di IAM.
*   **Zero Bypass:** Tidak boleh ada satupun halaman/kanvas yang bocor atau bisa diakses jika belum dicentang hijau.

## 6. Hukum Kepatuhan Bahasa (Zero-Hardcode i18n)
*   Segala bentuk tulisan, label, instruksi, placeholder, dan teks peringatan di *Frontend* **TIDAK BOLEH** di-*hardcode* memakai bahasa tertentu (Misal: langsung mengetik bahasa Indonesia di dalam komponen file `.tsx`).
*   Semuanya **WAJIB** diregistrasikan dan ditarik melalui *Dictionary* Kamus Internasional (`messages/en.json` dan `id.json`) menggunakan `next-intl`.
*   **HUKUM MUTLAK DEFAULT BAHASA:** Bahasa Indonesia (id) HANYALAH pilihan (*Optional Skin*). Bahasa baku **DEFAULT** untuk seluruh URL (*Routing*), Nama Kolom Database, Struktur Internal, dan Variabel Sistem adalah **BAHASA INGGRIS (en)**. Sumpah ini harus diingat selamanya untuk menjaga standar Arsitektur Skala Global tanpa Amnesia.

## 7. Skalabilitas Publik (The Citizen Expansion Rule)
*   Perancangan skema database, otentikasi, dan rute navigasi untuk struktur ke depannya harus **selalu menyediakan ruang** *(Future-Proof)* untuk kedatangan entitas eksternal di luar otoritas internal.
*   Sistem harus bisa mewadahi *Role* seperti **"User Member / Client / Masyarakat Umum"** yang menggunakan aplikasi ini sebagai portal publik, bukan hanya melayani pegawai instansi secara manajerial.

## 8. Tritunggal Hukum UltraModul (The Unbreakable Triad)
*   **Hukum Keterikatan Mutlak:** Aturan #5 (IAM), #6 (Bahasa), dan #7 (Member Publik) **TIDAK BISA BERDIRI SENDIRI. KETIGANYA SALING TERKAIT MUTLAK SATU SAMA LAIN.**
*    *Buktinya:* Modul Member Publik tidak boleh dibuat jika menabrak otoritas IAM. IAM tidak boleh dibangun jika bahasanya di-hardcode. Tampilan Publik Member harus sepenuhnya menggunakan kamus i18n *next-intl*, dan menunya ditarik eksklusif dari *Registry IAM*. Jika salah satu pilar ini diabaikan pada saat perakitan antarmuka apapun, maka arsitektur gagal.

## 9. Universal Data Gateway (Hukum Ekspor/Impor PUM)
Jika ada perintah perancangan modul penarikan data (*Export*) atau pemasukan data (*Import*), UI/UX **WAJIB MUTLAK** selalu menyediakan opsi *Dropdown/List* berikut secara universal tanpa diminta dua kali:

*   **Database on Server / Persisten:**
    *   `DuckDB` (Default)
    *   `Drizzle/SQLite`
    *   `PostgreSQL`
    *   `MySQL`
    *   `MsSQL`
    *   `Oracle`
*   **Database on File:**
    *   `Parquet`
    *   `Excel`
    *   `Tableau`
    *   `Stata`
    *   `CSV`
    *   `TXT`
    *   `JSON`
    *   `HTML`
*   **Export to File (Laporan Fisik):**
    *   `Word` (Default)
    *   `PDF`
    *   `HTML`
    *   `JSON`
    *   `TXT`

## 10. Hukum Kecerdasan Udara Tertutup (Local Query-LLM)
*   Dilarang keras menanamkan *Prompting* ke server AI Eksternal (seperti OpenAI ChatGPT, Claude, atau Gemini API) untuk mengeksekusi data tabel/database milik sistem.
*   AI yang diizinkan tertanam (*embedded*) di dalam PUM UltraModul haruslah berjenis **LLM Lite On-Premise (Local SLM)** seperti model Qwen 3B (berformat terkompresi ~4GB) yang sanggup menelan instruksi Bahasa Indonesia.
*   **Fungsi Absolut LLM Lite:** Bertindak sebagai *Database Router* atau penterjemah pikiran manusia menjadi perintah mesin (**Text-to-SQL/Text-to-Query**). Tujuannya murni untuk mencari/menggali data secara interaktif tanpa menyentuh *cloud* pihak ketiga.

**Amnesia Prevention Active: TRUE**
