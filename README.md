# 📦 Backend Technical Test - Inventory & Purchase System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![ElysiaJS](https://img.shields.io/badge/ElysiaJS-FF0420?style=for-the-badge&logo=bun&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📖 Ringkasan Proyek (Project Overview)
Proyek ini adalah sistem *Backend* untuk manajemen **Inventory dan Purchase Request**. Sistem ini dirancang untuk menangani pencatatan Master Data (Produk, Supplier, Gudang), pergerakan stok barang, hingga alur persetujuan (Approval) untuk pengadaan barang secara *End-to-End*.

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
Proyek ini secara ketat mengadopsi struktur berbasis fitur (*Vertical Slice / Domain-Driven*).
- `src/modules/`: Berisi berbagai domain bisnis (seperti `auth`, `products`, dll). Setiap modul wajib memisahkan HTTP Controller (`index.ts`), Logika Bisnis (`service.ts`), dan Skema Database/Validasi (`model.ts`).
- `src/config/`: Konfigurasi global (Database, Env).
- `src/utils/`: Fungsi utilitas *reusable* (seperti setup JWT, *Route Guard/Middleware*, dll).
- `test/`: *End-to-End Type-Safe Unit Testing* menggunakan Eden Treaty.

## 🗄️ Desain Database (Database Design)
*(Akan diperbarui saat modul Master Data & Transaksi dikerjakan)*

## 🧠 Keputusan Teknis (Engineering Decisions)

- **Arsitektur Ketat (Controller vs Service)**: Mengikuti struktur berbasis fitur resmi dari ElysiaJS. *Controller* (`index.ts`) secara khusus hanya mengurus urusan HTTP (seperti *Cookie*, kode status, rute), sedangkan *Service* (`service.ts`) murni menangani logika bisnis dan operasi *database*.
  - **Kenapa?** Untuk memastikan pemisahan tanggung jawab (*separation of concerns*) yang murni dan mencapai 100% *Type Safety* tanpa menggunakan *casting* tipe data secara paksa (`any` / `as unknown`).
- **Dokumentasi API Modern (Scalar UI)**: Beralih dari antarmuka Swagger UI klasik ke Scalar UI (`@elysia/openapi`) yang jauh lebih modern.
  - **Kenapa?** Untuk memberikan *playground* API yang sangat interaktif, responsif, dan estetis, lengkap dengan cuplikan kode (*code snippet*) multibahasa bagi para penguji (*Reviewer*).
- **Penjaga Rute yang Kuat (Middleware)**: Memanfaatkan fungsi siklus hidup (*lifecycle hook*) `.resolve` dari Elysia untuk menciptakan *middleware* `isAuthenticated`.
  - **Kenapa?** Berfungsi sebagai "Penjaga" (*Guard*) ber-tipe kuat yang otomatis memblokir *request* tanpa izin sebelum mencapai *Controller*. Ini menjaga *Controller* tetap bersih dan menjamin bahwa ia selalu menerima objek *User* yang tidak mungkin bernilai `null`.
- **Validasi DRY (Drizzle-Typebox)**: Mengadopsi `drizzle-typebox` untuk secara otomatis menghasilkan skema validasi Elysia (TypeBox) langsung dari skema PostgreSQL Drizzle (menggunakan fungsi `t.Pick`).
  - **Kenapa?** Untuk membangun *Single Source of Truth* (Satu Sumber Kebenaran). Hal ini memastikan lapisan validasi API selalu 100% sinkron dengan struktur *database* tanpa perlu mengetik ulang kodenya (menerapkan prinsip DRY - *Don't Repeat Yourself*).
- **E2E Type-Safe Testing (Eden Treaty)**: Menggunakan klien `@elysiajs/eden` (Treaty) untuk *unit testing* alih-alih menyusun objek `Request` secara manual.
  - **Kenapa?** Untuk menegakkan *End-to-End Type Safety* mutlak. Klien ini secara otomatis membaca tipe data dari *backend* langsung di dalam file *test*, mencegah *typo*, dan memastikan setiap perubahan pada skema API akan langsung memunculkan *error* TypeScript pada sesi pengujian.
- **Arsitektur Database**: Menggunakan **PostgreSQL** bersama **Drizzle ORM**.
  - **Kenapa?** Untuk menjaga *query* yang aman dari tipe data (*type-safe*) dan secara ketat menerapkan standar penamaan `snake_case` di tabel *database*, sambil dengan elegan memetakannya ke `camelCase` di dalam *codebase* TypeScript.
- **Keamanan (JWT via HttpOnly Cookies)**: Dipilih sebagai pengganti token *Bearer/LocalStorage* tradisional.
  - **Kenapa?** Untuk melindungi aplikasi dari serangan *XSS (Cross-Site Scripting)* dan menyederhanakan manajemen *state* di *frontend*, sekaligus memenuhi mandat keamanan dari *technical test* ini.
- **Manajemen Peran (Role)**: Diimplementasikan sebagai kolom `VARCHAR` sederhana di dalam tabel `users` daripada membuat tabel relasional `roles` terpisah.
  - **Kenapa?** Aturan bisnis di soal secara tegas hanya meminta dua peran statis (USER dan APPROVER). Pendekatan ini mencegah *over-engineering* dan memenuhi instruksi untuk menjaga solusi tetap sederhana (*Keep it simple*).

## 💡 Asumsi (Assumptions)

*(Akan diisi ketika ada kondisi bisnis yang tidak disebutkan dalam spesifikasi soal dan membutuhkan pengambilan keputusan mandiri)*

## 🚀 Cara Menjalankan (Setup & Run)

### 1. Environment Variables
Salin contoh file *env*:
```bash
cp .env.example .env
```

### 2. Menggunakan Docker (Direkomendasikan)
Cara paling mudah untuk menjalankan aplikasi dan *database* sekaligus:
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
3. Jalankan migrasi *database*:
   ```bash
   bun run db:migrate
   ```
4. Jalankan aplikasi:
   ```bash
   bun run dev
   ```

## 🧪 Pengujian (Testing)
Untuk menjalankan *End-to-End Type-Safe Unit Test* (menggunakan Bun Test + Eden Treaty):
```bash
bun test
```

## 📚 Dokumentasi API
Buka tautan berikut di *browser* Anda untuk mengakses Dokumentasi API (Scalar UI) secara interaktif:
👉 **[http://localhost:3000/openapi](http://localhost:3000/openapi)**
