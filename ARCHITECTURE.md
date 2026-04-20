# 🏛️ UltraModul Platform Architecture

> **AI SYSTEM INSTRUCTION:** Kamu WAJIB menaati semua aturan di dalam file ini sebelum mulai menulis kode apa pun untuk platform UltraModul.

## 1. Identitas Enterprise
*   **Aplikasi Utama:** UltraModul Enterprise Platform (ultramodul.xyz)
*   **Visi:** Menyediakan antarmuka manajemen super-app tingkat pemerintah dan enterprise dengan estetika mewah dan keamanan ekstrem.
*   **Multi-Platform Strategy:** Jika ada sub-aplikasi baru (seperti NexS, SS8, SS9), buatlah *Repository GitHub* terpisah untuk menjaga agar ingatan AI tidak tercampur (*Zero-Amnesia Boundaries*).

## 2. Tech Stack & Framework
*   **Frontend:** Next.js (App Router, Server Components).
*   **Bahasa:** TypeScript. Dilarang keras menggunakan tipe `any` kecuali mendesak.
*   **Styling Utama:** CSS Murni (Modular atau Vanilla). Jangan menggunakan Tailwind CSS secara abusif kecuali diinstruksikan khusus, demi menjaga kerapian kode dan kontrol absolut atas efek *Glassmorphism*.
*   **Database Engine:** DuckDB (untuk analitik besar data/Parquet) & SQLite lokal.

## 3. Aturan Desain Antarmuka (Aesthetics)
UltraModul WAJIB terlihat lebih mahal dari platform global mana pun:
*   **Color Palette:** *Dark Mode Default* (Hitam kelam, aksen Cyan/Ungu *Cyberpunk* namun tertata formal).
*   **Komponen UI:** 
    * Menggunakan efek tembus pandang (*Glassmorphism*. `backdrop-filter: blur()`).
    * Semua tombol dan kartu harus memiliki bayangan lembut dan animasi transisi responsif saat di-*hover*.
*   **Tipografi:** Font Sans-serif global (Inter/Outfit) berukuran proporsional. Tidak boleh ada font raksasa yang norak.

## 4. Partisi Kode (Zoning Code)
Semua pekerjaan wajib diisolasi dengan ketat:
*   `src/components/ui/` : Khusus tombol, tabel, dan kartu visual (Tidak boleh ada tarikan logika Fetch DB di sini).
*   `src/app/(dashboard)/` : Khusus pengaturan rute dan halaman statis.
*   `src/lib/` : Khusus otak logika komputasi, analitik DuckDB, dan koneksi API.

**Amnesia Prevention Active: TRUE**
