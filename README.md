# 📦 Backend Technical Test - Inventory & Purchase System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![ElysiaJS](https://img.shields.io/badge/ElysiaJS-FF0420?style=for-the-badge&logo=bun&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📖 Ringkasan Proyek (Project Overview)

Proyek ini adalah sistem _Backend_ untuk manajemen **Inventory dan Purchase Request**. Sistem ini dirancang untuk menangani pencatatan Master Data (Produk, Supplier, Gudang), pergerakan stok barang, hingga alur persetujuan (Approval) untuk pengadaan barang secara _End-to-End_.

### 🗺️ Status Fitur (Roadmap)

- [x] **Authentication**: Login dengan JWT (HttpOnly Cookie), RBAC statis (USER & APPROVER).
- [x] **Master Data**: CRUD Produk, Supplier, dan Gudang (Warehouse).
- [ ] **Purchase Request (PR)**: Pembuatan PR oleh USER, daftar PR.
- [ ] **Approval Workflow**: Persetujuan/Penolakan PR oleh APPROVER.
- [ ] **Purchase Order (PO)**: Konversi PR yang disetujui menjadi PO ke Supplier.
- [ ] **Goods Receipt (GR) & Inventory**: Penerimaan barang (GR) yang otomatis menambah stok Inventory (Database Transaction).

## 🛠️ Tech Stack

- **Runtime & Package Manager**: Bun
- **Web Framework**: ElysiaJS
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL 15
- **ORM & Migrations**: Drizzle ORM
- **Validation**: Elysia TypeBox (`t.Object`, `t.String`, dll) + Drizzle-Typebox
- **Documentation**: Swagger/OpenAPI (Dirender menggunakan Scalar UI)
- **Infrastructure**: Docker & Docker Compose

## 📂 Struktur Proyek (Project Structure)

Proyek ini secara ketat mengadopsi struktur berbasis fitur (_Vertical Slice / Domain-Driven_).

- `src/modules/`: Berisi berbagai domain bisnis (seperti `auth`, `products`, dll). Setiap modul wajib memisahkan HTTP Controller (`index.ts`), Logika Bisnis (`service.ts`), dan Skema Database/Validasi (`model.ts`).
- `src/config/`: Konfigurasi global (Database, Env).
- `src/utils/`: Fungsi utilitas _reusable_ (seperti setup JWT, _Route Guard/Middleware_, Seeder).
- `*.test.ts`: _End-to-End Type-Safe Unit Testing_ menggunakan Eden Treaty diletakkan berdampingan langsung di dalam folder modul masing-masing.

## 🔄 Alur Bisnis Utama (Business Flow)

```mermaid
flowchart TD
    A([1. Login as USER]) --> B[Create Purchase Request]
    B --> C{2. Login as APPROVER}
    C -->|Reject| D[PR Status: REJECTED]
    C -->|Approve| E[PR Status: APPROVED]
    E --> F[3. Create Purchase Order]
    F --> G[4. Goods Receipt]
    G --> H[(5. Auto-Update Inventory Stock)]

    style A fill:#007ACC,color:#fff
    style C fill:#FF0420,color:#fff
    style H fill:#316192,color:#fff
```

## 🗄️ Desain Database Saat Ini (Current ERD)

```mermaid
erDiagram
    USERS {
        serial id PK
        varchar username UK
        varchar password
        enum role "USER | APPROVER"
        timestamp created_at
    }

    PRODUCTS {
        serial id PK
        varchar sku UK
        varchar name
        varchar unit
        boolean is_active
    }

    SUPPLIERS {
        serial id PK
        varchar name
        varchar email
        varchar phone
        boolean is_active
    }

    WAREHOUSES {
        serial id PK
        varchar code UK
        varchar name
        varchar location
        boolean is_active
    }
```

_(Catatan: Diagram ini akan terus berkembang seiring penyelesaian fitur PR, PO, dan GR)._

## 🧠 Keputusan Teknis (Engineering Decisions)

- **Arsitektur Ketat (Controller vs Service)**: Mengikuti struktur berbasis fitur dari ElysiaJS. _Controller_ (`index.ts`) khusus mengurus HTTP (Cookie, status code), sedangkan _Service_ (`service.ts`) menangani logika bisnis.
- **Dokumentasi API Terpadu (Swagger / Scalar UI)**: Memanfaatkan standar Swagger/OpenAPI (`@elysiajs/swagger`) namun dirender menggunakan Scalar UI untuk tampilan yang lebih modern, lengkap dengan _code snippet_.
- **E2E Type-Safe Testing (Eden Treaty)**: Menggunakan klien `@elysiajs/eden` (Treaty) untuk _unit testing_. Klien ini otomatis membaca tipe data dari _backend_ (Elysia App Instance) langsung ke file test tanpa harus menebak bentuk Response JSON.
- **Validasi DRY (Drizzle-Typebox)**: Men-generate skema validasi request/response Elysia (TypeBox) secara otomatis dari skema tabel Drizzle ORM.
- **Manajemen Peran (Role Enum)**: Diimplementasikan sebagai `pgEnum` ("USER", "APPROVER") native di PostgreSQL agar _type-safe_ di level database maupun aplikasi, menghindari tabel relasional yang _over-engineered_ untuk kasus sederhana ini.

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
2. Install dependensi: `bun install`
3. Jalankan migrasi _database_: `bun run db:migrate`
4. Jalankan aplikasi: `bun run dev`

---

## 🌱 Seeding Database (Penting untuk Penguji)

Untuk memudahkan pengujian (baik via Scalar UI maupun Postman), jalankan _Seeder_ untuk mengisi _Master Data_ dan 2 Akun Utama secara otomatis:

```bash
bun run db:seed
```

**Akun yang digenerate:**

- **USER:** username: `staff_user` | password: `password123`
- **APPROVER:** username: `manager_approver` | password: `password123`

_(Catatan: Jika menggunakan Docker, Anda bisa menjalankan seeder ke dalam container dengan `docker exec -it <container_name> bun run db:seed`)_

---

## 🧪 Pengujian (Testing)

Menjalankan _End-to-End Type-Safe Unit Test_ (termasuk skenario validasi, penolakan auth, dan flow success):

```bash
bun test
```

## 📚 Dokumentasi API (Swagger / Scalar UI)

Buka tautan berikut di _browser_ Anda untuk mengakses Dokumentasi API secara interaktif:
👉 **[http://localhost:3000/openapi](http://localhost:3000/openapi)**
