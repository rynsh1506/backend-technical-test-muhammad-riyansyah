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

**Core Requirements:**

- [x] **Authentication**: Login dengan JWT (HttpOnly Cookie), RBAC statis (USER & APPROVER).
- [x] **Master Data**: CRUD Produk, Supplier, dan Gudang (Warehouse).
- [x] **Purchase Request (PR)**: Pembuatan PR oleh USER, daftar PR.
- [x] **Approval Workflow**: Persetujuan/Penolakan PR oleh APPROVER.
- [x] **Purchase Order (PO)**: Konversi PR yang disetujui menjadi PO ke Supplier.
- [x] **Goods Receipt (GR) & Inventory**: Penerimaan barang (GR) yang otomatis menambah stok Inventory (Database Transaction).


**Bonus Points Achieved:**
- [x] **Audit Trail**: Melacak riwayat aksi penting di database.
- [x] **Idempotency**: Mencegah klik-ganda (*double-submit*) pada API transaksional.
- [x] **Docker & CI Pipeline**: Siap *deploy* dengan Docker Compose dan Github Actions.
- [x] **Clean Architecture (3-Tier)**: Pemisahan tegas antara Controller, Service, dan Model.

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
- `*.test.ts`: _Integration & E2E Type-Safe Testing_ menggunakan Eden Treaty diletakkan berdampingan langsung di dalam folder modul masing-masing.

## 🔄 Alur Bisnis Utama (Business Flow)

```mermaid
flowchart TD
    A([1. Login as USER]) --> B[Create DRAFT PR]
    B --> B1[Add PR Items]
    B1 --> B2[Submit PR]
    B2 --> C{2. Login as APPROVER}
    C -->|Reject| D[PR: REJECTED]
    C -->|Approve| E[PR: APPROVED]
    E --> F[3. Create Purchase Order]
    F --> G[4. Goods Receipt]
    G --> H[(Auto-Update Inventory)]
    H --> I{Is Fully Received?}
    I -->|No| J[PO: PARTIALLY_RECEIVED]
    J -.->|Next Delivery| G
    I -->|Yes| K[PO: RECEIVED]

    style A fill:#007ACC,color:#fff
    style C fill:#FF0420,color:#fff
    style H fill:#316192,color:#fff
    style K fill:#28a745,color:#fff
```

## 🗄️ Desain Database (Conceptual Model / Chen-style ERD)

Berikut adalah relasi konseptual antar entitas untuk memperjelas bagaimana satu tabel menyambung ke tabel lainnya secara logis. Kotak melambangkan **Entitas**, sedangkan belah ketupat melambangkan **Relasi (Kata Kerja)**.

```mermaid
flowchart TD
    %% Entities
    U[USERS]
    PR[PURCHASE_REQUESTS]
    PRI[PURCHASE_REQUEST_ITEMS]
    PO[PURCHASE_ORDERS]
    POI[PURCHASE_ORDER_ITEMS]
    GR[GOODS_RECEIPTS]
    GRI[GOODS_RECEIPT_ITEMS]
    PROD[PRODUCTS]
    WH[WAREHOUSES]
    INV[INVENTORY_BALANCES]
    SUPP[SUPPLIERS]

    %% Relationships (Diamonds)
    req{Membuat}
    conv{Dikonversi<br/>Menjadi}
    store{Diterima<br/>Ke}
    containPR{Memiliki}
    containPO{Memiliki}
    containGR{Memiliki}
    refProd1{Merujuk}
    refProd2{Merujuk}
    refProd3{Merujuk}
    refProd4{Mencatat}
    sup{Menyuplai}
    ful{Dipenuhi<br/>Oleh}
    hasInv{Menyimpan}

    %% Connections
    U --- req --- PR
    WH --- store --- PR
    
    PR --- containPR --- PRI
    PRI --- refProd1 --- PROD
    
    PR --- conv --- PO
    SUPP --- sup --- PO
    
    PO --- containPO --- POI
    POI --- refProd2 --- PROD
    
    PO --- ful --- GR
    GR --- containGR --- GRI
    GRI --- refProd3 --- PROD
    
    WH --- hasInv --- INV
    INV --- refProd4 --- PROD

    %% Styling
    classDef entity fill:#316192,color:#fff,stroke:#fff,stroke-width:2px;
    classDef relation fill:#FF0420,color:#fff,shape:diamond;
    
    class U,PR,PRI,PO,POI,GR,GRI,PROD,WH,INV,SUPP entity;
    class req,conv,store,containPR,containPO,containGR,refProd1,refProd2,refProd3,refProd4,sup,ful,hasInv relation;
```

*(Catatan: Diagram di atas merupakan pemetaan konseptual. Relasi fisik di database Postgres dihubungkan secara ketat (Strict Foreign Keys) melalui kolom `id` utama milik masing-masing tabel).*

## 🧠 Keputusan Teknis (Engineering Decisions)

- **Arsitektur Ketat (Controller vs Service)**: Mengikuti struktur berbasis fitur dari ElysiaJS. _Controller_ (`index.ts`) khusus mengurus HTTP (Cookie, status code), sedangkan _Service_ (`service.ts`) menangani logika bisnis.
- **Dokumentasi API Terpadu (@elysia/openapi)**: Memanfaatkan standar Swagger/OpenAPI (`@elysia/openapi`) namun dirender menggunakan Scalar UI untuk tampilan yang lebih modern, lengkap dengan _code snippet_.
- **E2E Type-Safe Testing (Eden Treaty)**: Menggunakan klien `@elysiajs/eden` (Treaty) untuk _integration testing_. Klien ini otomatis membaca tipe data dari _backend_ (Elysia App Instance) langsung ke file test tanpa harus menebak bentuk Response JSON.
- **Validasi DRY (Drizzle-Typebox)**: Men-generate skema validasi request/response Elysia (TypeBox) secara otomatis dari skema tabel Drizzle ORM.
- **Manajemen Peran (Role Enum)**: Diimplementasikan sebagai `pgEnum` ("USER", "APPROVER") native di PostgreSQL agar _type-safe_ di level database maupun aplikasi, menghindari tabel relasional yang _over-engineered_ untuk kasus sederhana ini.
- **Pemisahan Inventory**: Saldo saat ini (`inventory_balances`) dan histori mutasi (`inventory_movements`) dipisah. Hal ini memastikan setiap pergerakan terekam dengan jelas (Auditabilitas) dan mencegah *race condition* saat kalkulasi stok massal.
- **Data Consistency via Transactions**: Seluruh transaksi kritikal (Submit PR, Goods Receipt) dibungkus dalam *Database Transactions* (`db.transaction`). Jika proses update stok gagal, seluruh data Goods Receipt akan di-*rollback* otomatis.

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

**Penting:** Seluruh pengujian ini adalah _Integration/E2E Test_ yang menggunakan database PostgreSQL secara langsung melalui Eden Treaty. Pastikan database Anda sudah menyala dan _seeder_ (`bun run db:seed`) telah dijalankan sebelum memulai pengujian.

Menjalankan _Integration & E2E Type-Safe Test_ (termasuk skenario validasi, penolakan auth, dan flow success):

```bash
bun test
```

## 📚 Dokumentasi API (Swagger / Scalar UI)

Buka tautan berikut di _browser_ Anda untuk mengakses Dokumentasi API secara interaktif:
👉 **[http://localhost:3000/openapi](http://localhost:3000/openapi)**
