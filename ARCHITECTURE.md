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

**Amnesia Prevention Active: TRUE**
