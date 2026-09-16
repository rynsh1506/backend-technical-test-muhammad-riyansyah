# 📦 Backend Technical Test - Inventory & Purchase System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![ElysiaJS](https://img.shields.io/badge/ElysiaJS-FF0420?style=for-the-badge&logo=bun&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📖 Ringkasan Proyek (Project Overview)

Proyek ini adalah sistem _Backend_ untuk manajemen **Inventory dan Purchase Request**. Sistem ini dirancang untuk menangani pencatatan Master Data (Produk, Supplier, Gudang), pergerakan stok barang, hingga alur persetujuan (Approval) untuk pengadaan barang secara _End-to-End_.

## 🛠️ Tech Stack

- **Runtime & Package Manager**: Bun
- **Web Framework**: ElysiaJS
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL 15
- **ORM & Migrations**: Drizzle ORM
- **Validation**: Elysia TypeBox (`t.Object`, `t.String`, dll) + Drizzle-Typebox
- **Documentation**: Scalar UI (OpenAPI)
- **Infrastructure**: Docker & Docker Compose

## 📂 Struktur Proyek (Project Structure)

Proyek ini secara ketat mengadopsi struktur berbasis fitur (_Vertical Slice / Domain-Driven_).

- `src/modules/`: Berisi berbagai domain bisnis (seperti `auth`, `products`, dll). Setiap modul wajib memisahkan HTTP Controller (`index.ts`), Logika Bisnis (`service.ts`), dan Skema Database/Validasi (`model.ts`).
- `src/config/`: Konfigurasi global (Database, Env).
- `src/utils/`: Fungsi utilitas _reusable_ (seperti setup JWT, _Route Guard/Middleware_, dll).
- `*.test.ts`: _End-to-End Type-Safe Unit Testing_ menggunakan Eden Treaty diletakkan berdampingan langsung di dalam folder modul masing-masing.

## 🗄️ Desain Database (Database Design)

_(Akan diperbarui saat modul Master Data & Transaksi dikerjakan)_

## 🧠 Keputusan Teknis (Engineering Decisions)

- **Arsitektur Ketat (Controller vs Service)**: Mengikuti struktur berbasis fitur resmi dari ElysiaJS. _Controller_ (`index.ts`) secara khusus hanya mengurus urusan HTTP (seperti _Cookie_, kode status, rute), sedangkan _Service_ (`service.ts`) murni menangani logika bisnis dan operasi _database_.
  - **Kenapa?** Untuk memastikan pemisahan tanggung jawab (_separation of concerns_) yang murni dan mencapai 100% _Type Safety_ tanpa menggunakan _casting_ tipe data secara paksa (`any` / `as unknown`).
- **Dokumentasi API Modern (Scalar UI)**: Beralih dari antarmuka Swagger UI klasik ke Scalar UI (`@elysia/openapi`) yang jauh lebih modern.
  - **Kenapa?** Untuk memberikan _playground_ API yang sangat interaktif, responsif, dan estetis, lengkap dengan cuplikan kode (_code snippet_) multibahasa bagi para penguji (_Reviewer_).
- **Penjaga Rute yang Kuat (Middleware)**: Memanfaatkan fungsi siklus hidup (_lifecycle hook_) `.resolve` dari Elysia untuk menciptakan _middleware_ `isAuthenticated`.
  - **Kenapa?** Berfungsi sebagai "Penjaga" (_Guard_) ber-tipe kuat yang otomatis memblokir _request_ tanpa izin sebelum mencapai _Controller_. Ini menjaga _Controller_ tetap bersih dan menjamin bahwa ia selalu menerima objek _User_ yang tidak mungkin bernilai `null`.
- **Validasi DRY (Drizzle-Typebox)**: Mengadopsi `drizzle-typebox` untuk secara otomatis menghasilkan skema validasi Elysia (TypeBox) langsung dari skema PostgreSQL Drizzle (menggunakan fungsi `t.Pick`).
  - **Kenapa?** Untuk membangun _Single Source of Truth_ (Satu Sumber Kebenaran). Hal ini memastikan lapisan validasi API selalu 100% sinkron dengan struktur _database_ tanpa perlu mengetik ulang kodenya (menerapkan prinsip DRY - _Don't Repeat Yourself_).
- **E2E Type-Safe Testing (Eden Treaty)**: Menggunakan klien `@elysiajs/eden` (Treaty) untuk _unit testing_ alih-alih menyusun objek `Request` secara manual.
  - **Kenapa?** Untuk menegakkan _End-to-End Type Safety_ mutlak. Klien ini secara otomatis membaca tipe data dari _backend_ langsung di dalam file _test_, mencegah _typo_, dan memastikan setiap perubahan pada skema API akan langsung memunculkan _error_ TypeScript pada sesi pengujian.
- **Arsitektur Database**: Menggunakan **PostgreSQL** bersama **Drizzle ORM**.
  - **Kenapa?** Untuk menjaga _query_ yang aman dari tipe data (_type-safe_) dan secara ketat menerapkan standar penamaan `snake_case` di tabel _database_, sambil dengan elegan memetakannya ke `camelCase` di dalam _codebase_ TypeScript.
- **Keamanan (JWT via HttpOnly Cookies)**: Dipilih sebagai pengganti token _Bearer/LocalStorage_ tradisional.
  - **Kenapa?** Untuk melindungi aplikasi dari serangan _XSS (Cross-Site Scripting)_ dan menyederhanakan manajemen _state_ di _frontend_, sekaligus memenuhi mandat keamanan dari _technical test_ ini.
- **Manajemen Peran (Role)**: Diimplementasikan sebagai kolom `VARCHAR` sederhana di dalam tabel `users` daripada membuat tabel relasional `roles` terpisah.
  - **Kenapa?** Aturan bisnis di soal secara tegas hanya meminta dua peran statis (USER dan APPROVER). Pendekatan ini mencegah _over-engineering_ dan memenuhi instruksi untuk menjaga solusi tetap sederhana (_Keep it simple_).

## 💡 Asumsi (Assumptions)

_(Akan diisi ketika ada kondisi bisnis yang tidak disebutkan dalam spesifikasi soal dan membutuhkan pengambilan keputusan mandiri)_

## 🚀 Cara Menjalankan (Setup & Run)

### 1. Environment Variables

Salin contoh file _env_:

```bash
cp .env.example .env
```

### 2. Menggunakan Docker (Direkomendasikan)

Cara paling mudah untuk menjalankan aplikasi dan _database_ sekaligus:

```bash
docker compose up -d --build
```

Aplikasi akan menyala di `http://localhost:3000`.

### 3. Cara Menjalankan Tanpa Docker (Lokal)

Jika Anda ingin menjalankannya secara lokal menggunakan Bun:

1. Pastikan PostgreSQL sudah menyala dan sesuaikan `DATABASE_URL` di `.env`.
2. Install dependensi:
   ```bash
   bun install
   ```
3. Jalankan migrasi _database_:
   ```bash
   bun run db:migrate
   ```
4. Jalankan aplikasi:
   ```bash
   bun run dev
   ```

## 🧪 Pengujian (Testing)

Untuk menjalankan _End-to-End Type-Safe Unit Test_ (menggunakan Bun Test + Eden Treaty):

```bash
bun test
```

## 📚 Dokumentasi API

Buka tautan berikut di _browser_ Anda untuk mengakses Dokumentasi API (Scalar UI) secara interaktif:
👉 **[http://localhost:3000/openapi](http://localhost:3000/openapi)**
