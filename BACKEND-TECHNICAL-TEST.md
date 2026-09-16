# Backend Engineer Take-Home Technical Test

## Inventory Procurement API

Technical test ini bertujuan untuk melihat bagaimana Anda menerjemahkan sebuah kebutuhan bisnis menjadi backend application yang dapat digunakan, diuji, didokumentasikan, dan didemonstrasikan kepada user.

Kami tidak hanya menilai apakah endpoint berhasil dibuat.

Kami ingin melihat bagaimana Anda:

* memahami business flow;
* merancang database;
* menentukan API contract;
* mengimplementasikan business rules;
* menjaga data consistency;
* melakukan testing;
* mendokumentasikan pekerjaan;
* dan mendeliver hasil pekerjaan kepada user.

---

# Timeline

Technical test dikerjakan secara take-home selama:

**Senin — Jumat**

Recruiter akan mulai melakukan pengecekan repository paling lambat pada:

**Jumat sore, 4 September 2026.**

Anda tidak diharapkan menghabiskan lima hari penuh untuk technical test ini.

Prioritaskan:

**correctness, maintainability, dan clarity dibanding jumlah fitur.**

---

# Repository Rules

Technical test wajib dikumpulkan melalui GitHub Repository.

Repository harus dibuat atau di-push menggunakan:

**akun GitHub yang Anda cantumkan pada CV.**

Repository wajib memiliki visibility:

```text
PUBLIC
```

Recruiter akan melakukan pengecekan repository paling lambat pada:

```text
Friday, 4 September 2026 — Sore
```

Commit history pada repository akan menjadi bagian dari proses pengecekan submission.

## Important

Setelah batas waktu submission, kandidat **tidak diperbolehkan melakukan perubahan terhadap technical test**.

Apabila ditemukan commit atau perubahan terhadap repository setelah batas waktu yang telah ditentukan, maka submission dapat dianggap:

```text
INVALID
```

dan technical test tersebut **tidak akan masuk ke proses penilaian**.

Pastikan seluruh:

* source code;
* documentation;
* migration;
* tests;
* API documentation;
* dan file pendukung lainnya

telah di-push sebelum batas waktu submission.

---

# Repository Naming

Gunakan format nama repository:

```text
Backend Technical Test - Nama yang tercantum pada CV
```

Contoh:

```text
Backend Technical Test - John Doe
```

Jika GitHub atau tooling yang digunakan tidak mendukung penggunaan spasi dengan nyaman, kandidat diperbolehkan menggunakan format repository seperti:

```text
backend-technical-test-john-doe
```

Namun nama kandidat tetap harus dapat diidentifikasi dengan jelas dari repository tersebut.

---

# Case Study

## Inventory Procurement

Sebuah perusahaan memiliki beberapa warehouse yang menyimpan berbagai jenis barang.

Saat ini proses permintaan pembelian barang dilakukan melalui spreadsheet dan komunikasi manual antara Warehouse dan Purchasing.

Perusahaan ingin memiliki backend system sederhana untuk mencatat proses procurement dari permintaan barang sampai barang diterima di warehouse.

Business flow utama:

```text
Purchase Request
      ↓
Approval
      ↓
Purchase Order
      ↓
Goods Receipt
      ↓
Inventory Updated
```

Anda diminta membuat backend service untuk mendukung proses tersebut.

---

# Actors

System memiliki minimal dua role:

```text
USER
APPROVER
```

### USER

USER merupakan staff yang membuat kebutuhan pembelian.

USER dapat:

* login;
* membuat Purchase Request;
* menambahkan Product ke Purchase Request;
* mengubah Purchase Request selama masih DRAFT;
* submit Purchase Request;
* melihat Purchase Request;
* melihat Purchase Order;
* mencatat Goods Receipt.

### APPROVER

APPROVER merupakan user yang memiliki authority untuk melakukan approval.

APPROVER dapat:

* melihat Purchase Request;
* approve Purchase Request;
* reject Purchase Request.

Role dan authorization harus divalidasi pada backend.

---

# Master Data

System membutuhkan minimal master data berikut.

## Product

Product memiliki minimal:

```text
id
sku
name
unit
is_active
created_at
updated_at
```

Rules:

* SKU wajib unik.
* Product yang tidak aktif tidak dapat digunakan pada transaksi baru.

---

## Supplier

Supplier memiliki minimal:

```text
id
name
email
phone
is_active
created_at
updated_at
```

Supplier yang tidak aktif tidak dapat digunakan untuk Purchase Order baru.

---

## Warehouse

Warehouse memiliki minimal:

```text
id
code
name
location
is_active
created_at
updated_at
```

Rules:

* Warehouse Code wajib unik.
* Warehouse yang tidak aktif tidak dapat digunakan untuk transaksi baru.

---

# Inventory

Setiap Product dapat memiliki stock yang berbeda pada setiap Warehouse.

Contoh:

```text
Industrial Oil

Jakarta Warehouse
Stock: 120 PCS

Surabaya Warehouse
Stock: 45 PCS
```

System harus dapat menampilkan stock Product berdasarkan Warehouse.

Struktur database Inventory dibebaskan kepada kandidat.

---

# Purchase Request

USER dapat membuat Purchase Request.

Satu Purchase Request hanya ditujukan untuk:

**1 Warehouse**

Namun satu Purchase Request dapat memiliki:

**lebih dari satu Product.**

Contoh:

```text
PR-2026-000001

Warehouse:
Jakarta Warehouse

Requested By:
John

Items:

Industrial Oil
100 PCS

Safety Gloves
50 BOX
```

Minimal informasi Purchase Request:

```text
id
request_number
warehouse
requested_by
status
created_at
updated_at
```

Purchase Request memiliki collection:

```text
items
```

Setiap item minimal memiliki:

```text
product
quantity
```

---

# Purchase Request Status

Gunakan minimal status berikut:

```text
DRAFT
SUBMITTED
APPROVED
REJECTED
```

Expected transition:

```text
DRAFT
  ↓
SUBMITTED
  ↓
APPROVED
```

atau:

```text
DRAFT
  ↓
SUBMITTED
  ↓
REJECTED
```

---

# Purchase Request Rules

### DRAFT

Ketika status masih:

```text
DRAFT
```

USER dapat:

* menambah item;
* mengubah quantity;
* menghapus item;
* mengubah Warehouse.

### SUBMITTED

Setelah Purchase Request di-submit:

```text
SUBMITTED
```

Purchase Request tidak dapat diedit oleh USER.

### APPROVAL

Hanya Purchase Request dengan status:

```text
SUBMITTED
```

yang dapat:

```text
APPROVED
```

atau:

```text
REJECTED
```

Approval hanya dapat dilakukan oleh:

```text
APPROVER
```

### Empty Purchase Request

Purchase Request tidak dapat di-submit apabila tidak memiliki item.

### Quantity

Quantity setiap item harus:

```text
> 0
```

Product yang sama tidak boleh muncul lebih dari satu kali dalam Purchase Request yang sama.

---

# Purchase Order

Purchase Request yang telah:

```text
APPROVED
```

dapat dikonversi menjadi Purchase Order.

Purchase Order ditujukan kepada:

```text
1 Supplier
```

Minimal informasi:

```text
id
po_number
purchase_request_id
supplier_id
warehouse_id
status
created_at
updated_at
```

Purchase Order memiliki collection:

```text
items
```

Minimal:

```text
product
ordered_quantity
received_quantity
```

---

# Purchase Order Status

Gunakan minimal:

```text
DRAFT
ORDERED
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
```

---

# Purchase Order Rules

Purchase Order hanya dapat dibuat dari Purchase Request dengan status:

```text
APPROVED
```

Satu Purchase Request hanya dapat menghasilkan:

```text
1 Purchase Order
```

Ketika Purchase Order dibuat, Product dan Quantity berasal dari Purchase Request.

Supplier ditentukan ketika membuat Purchase Order.

Purchase Order yang:

```text
CANCELLED
```

tidak dapat menerima barang.

Purchase Order yang:

```text
RECEIVED
```

tidak dapat menerima barang kembali.

---

# Goods Receipt

Barang yang dipesan tidak selalu datang sekaligus.

System harus mendukung:

**Partial Goods Receipt.**

Contoh Purchase Order:

```text
PO-2026-000001

Industrial Oil
Ordered: 100 PCS
```

Delivery pertama:

```text
Received: 60 PCS
```

Setelah Goods Receipt:

```text
Ordered: 100
Received: 60
Remaining: 40

PO Status:
PARTIALLY_RECEIVED
```

Delivery kedua:

```text
Received: 40 PCS
```

Setelah Goods Receipt:

```text
Ordered: 100
Received: 100
Remaining: 0

PO Status:
RECEIVED
```

---

# Goods Receipt Rules

Goods Receipt harus mereferensikan Purchase Order.

Satu Goods Receipt dapat memiliki beberapa Product.

Product yang diterima harus merupakan Product yang terdapat pada Purchase Order.

Received Quantity harus:

```text
> 0
```

Total quantity yang diterima tidak boleh melebihi:

```text
ordered_quantity
```

Contoh:

```text
Ordered:
100

Already Received:
80

New Receipt:
30
```

Request tersebut harus ditolak karena total penerimaan menjadi:

```text
110
```

---

# Purchase Order Status Calculation

Jika belum terdapat barang yang diterima:

```text
ORDERED
```

Jika sebagian barang sudah diterima:

```text
PARTIALLY_RECEIVED
```

Jika seluruh quantity seluruh Product telah diterima:

```text
RECEIVED
```

---

# Inventory Update

Goods Receipt yang berhasil harus menambahkan stock Warehouse.

Contoh kondisi awal:

```text
Warehouse:
Jakarta

Product:
Industrial Oil

Stock:
20
```

Goods Receipt:

```text
+60
```

Stock setelah transaksi:

```text
80
```

---

# Inventory Movement

Perubahan stock tidak cukup hanya dengan mengubah nilai stock saat ini.

System harus menyimpan riwayat perubahan inventory.

Minimal data Inventory Movement:

```text
id
warehouse_id
product_id
movement_type
quantity
reference
created_at
```

Untuk case study ini minimal terdapat:

```text
PURCHASE_RECEIPT
```

Contoh:

```text
Product:
Industrial Oil

Warehouse:
Jakarta Warehouse

Movement:
PURCHASE_RECEIPT

Quantity:
+60

Reference:
GR-2026-000001
```

---

# Data Consistency

Goods Receipt merupakan operasi yang mempengaruhi beberapa data:

```text
Create Goods Receipt
        ↓
Update PO Received Quantity
        ↓
Update Purchase Order Status
        ↓
Update Inventory
        ↓
Create Inventory Movement
```

Implementasi harus mempertimbangkan kondisi ketika salah satu proses tersebut gagal.

Data tidak boleh berada dalam kondisi:

**partially updated.**

---

# Authentication

Implementasikan authentication sederhana.

Tidak diperlukan:

```text
Registration
Forgot Password
Email Verification
OAuth
```

User boleh dibuat menggunakan seeder.

Minimal terdapat:

```text
1 USER
1 APPROVER
```

Pendekatan authentication dibebaskan.

Contoh:

```text
JWT
Session
Bearer Token
```

---

# Required API Capabilities

Kami tidak menentukan nama endpoint secara detail.

Anda bebas merancang API contract.

Backend minimal harus menyediakan kemampuan untuk:

### Authentication

```text
Login
Get authenticated user
```

### Products

```text
Create
List
Get Detail
Update
```

### Suppliers

```text
Create
List
Get Detail
Update
```

### Warehouses

```text
Create
List
Get Detail
Update
```

### Inventory

```text
View stock by Warehouse
View stock by Product
View Inventory Movement
```

### Purchase Request

```text
Create
Get List
Get Detail
Update Draft
Submit
Approve
Reject
```

### Purchase Order

```text
Create from Approved Purchase Request
Get List
Get Detail
Mark as Ordered
```

### Goods Receipt

```text
Create Goods Receipt
Get Goods Receipt Detail
```

Kami ingin melihat bagaimana Anda menentukan sendiri endpoint dan API contract yang sesuai dengan requirement tersebut.

---

# Technical Stack

Kandidat **bebas menggunakan technology stack apa pun** yang dianggap sesuai untuk menyelesaikan technical test.

Kami tidak mewajibkan penggunaan framework, programming language, atau ORM tertentu.

Namun kandidat akan mendapatkan **additional consideration / point plus** apabila menggunakan stack berikut:

## Backend

```text
TypeScript

Hono
atau
Elysia
```

Preferred combination:

```text
TypeScript + Hono
```

atau:

```text
TypeScript + Elysia
```

## Database

Preferred database:

```text
PostgreSQL
```

Untuk database access, kandidat akan mendapatkan point plus apabila menggunakan:

```text
Raw SQL
```

atau:

```text
Drizzle ORM
```

Contoh preferred stack:

```text
TypeScript
+
Hono / Elysia
+
PostgreSQL
+
Raw SQL / Drizzle ORM
```

### Important

Preferred stack **bukan mandatory requirement**.

Kandidat tetap diperbolehkan menggunakan stack lain.

Contoh:

```text
Go

Java

Python

.NET

Node.js dengan framework lain

ORM lain
```

Pemilihan technology tidak akan menggantikan penilaian terhadap:

* business understanding;
* correctness;
* database design;
* data integrity;
* code quality;
* testing;
* dan kemampuan menjelaskan implementation.

Stack yang sophisticated tidak otomatis mendapatkan nilai lebih apabila implementation business logic tidak benar.

---

# Database Requirements

Gunakan:

* database migration;
* foreign key;
* appropriate constraints;
* appropriate unique constraint;
* appropriate index.

Kami ingin schema database dapat dibangun kembali dari repository.

Hindari requirement setup database secara manual.

---

# Validation & Error Handling

Backend harus melakukan input dan business validation.

Error response harus konsisten.

Contoh:

```json
{
  "error": {
    "code": "PURCHASE_REQUEST_NOT_APPROVED",
    "message": "Purchase Request must be approved before creating Purchase Order."
  }
}
```

Format tersebut hanya contoh.

Anda bebas menentukan error contract sendiri.

---

# Automated Testing

Buat automated tests untuk business rule yang menurut Anda paling penting.

Minimal kami mengharapkan test terhadap scenario seperti:

```text
Cannot submit Purchase Request without items

Cannot approve Purchase Request that is not SUBMITTED

Cannot create Purchase Order from non-approved Purchase Request

Cannot create multiple Purchase Orders from the same Purchase Request

Cannot receive quantity greater than ordered quantity

Goods Receipt increases warehouse stock

Fully received Purchase Order becomes RECEIVED
```

Anda boleh menambahkan test lain yang dianggap penting.

Kami lebih menghargai:

**meaningful business tests**

dibandingkan banyak test yang hanya memeriksa trivial implementation.

---

# Documentation

Repository harus menyediakan:

```text
README.md
```

README minimal menjelaskan:

## Project Overview

Apa yang dibuat.

## Tech Stack

Technology yang digunakan.

## Project Structure

Penjelasan singkat struktur code.

## Database Design

Penjelasan schema dan relationship penting.

## Setup

Cara menjalankan project dari awal.

## Environment Variables

Environment yang diperlukan.

## Migration

Cara menjalankan migration.

## Seed

Cara menjalankan seed jika tersedia.

## Run Application

Cara menjalankan backend.

## Testing

Cara menjalankan automated test.

## API Documentation

Cara mengakses atau menggunakan API documentation.

---

# API Documentation

Sediakan minimal salah satu:

```text
OpenAPI / Swagger
Postman Collection
Bruno Collection
Insomnia Collection
```

atau dokumentasi lain yang memungkinkan interviewer mencoba API dengan mudah.

---

# Engineering Decisions

Tambahkan section berikut pada README:

```text
Engineering Decisions
```

Tuliskan minimal:

**3 keputusan engineering penting yang Anda buat.**

Contoh:

```text
Why this database structure was chosen

Why inventory movement is separated from inventory balance

How Goods Receipt consistency is handled
```

Tidak ada jawaban yang wajib sama dengan contoh di atas.

Kami ingin memahami reasoning di balik implementation Anda.

---

# Assumptions

Tidak semua kondisi bisnis akan dijelaskan secara exhaustive.

Jika Anda menemukan kondisi yang tidak dijelaskan pada requirement:

**buat reasonable assumption dan lanjutkan implementasi.**

Catat assumption penting pada README.

Kemampuan menentukan reasonable assumption merupakan bagian dari pekerjaan software development.

---

# Out of Scope

Anda tidak perlu membuat:

```text
Frontend Application
Mobile Application
Email Notification
File Upload
Payment
Complex Reporting
Microservices
Message Queue
Kubernetes
```

Jangan menambahkan complexity yang tidak memberikan value terhadap case study.

---

# Optional Improvements

Setelah core requirement selesai, Anda dapat menambahkan improvement jika memiliki waktu.

Contoh:

```text
Pagination

Filtering

Audit Trail

Idempotency

Docker

Docker Compose

CI Pipeline

Deployed API
```

Bagian ini sepenuhnya optional.

Core requirement yang benar lebih penting dibanding optional features.

---

# Submission

Submission dilakukan melalui:

**Public GitHub Repository**

menggunakan akun GitHub yang tercantum pada CV kandidat.

Repository harus sudah dalam kondisi final sebelum:

**Jumat sore, 4 September 2026.**

Submission minimal harus memiliki:

```text
Source Code

README.md

Database Migration

Seeder / Test Credentials

API Documentation

Automated Tests
```

Pastikan interviewer dapat menjalankan project hanya dengan mengikuti dokumentasi yang tersedia pada repository.

Perubahan atau commit setelah batas waktu submission dapat menyebabkan technical test:

```text
TIDAK DINILAI
```

---

# Delivery Session

Setelah repository selesai direview, kandidat akan mengikuti sesi:

**Technical Test Delivery**

Pada sesi tersebut Anda akan diminta melakukan demo terhadap system yang telah dibuat.

Siapkan demo business flow utama:

```text
Login

↓

Create Purchase Request

↓

Add Products

↓

Submit Purchase Request

↓

Approve Purchase Request

↓

Create Purchase Order

↓

Mark Purchase Order as Ordered

↓

Receive Partial Goods

↓

Check Inventory

↓

Receive Remaining Goods

↓

Check Purchase Order Status

↓

Check Inventory Movement
```

Presentasikan system seperti Anda sedang mendeliver hasil pekerjaan kepada user yang memberikan requirement.

Anda dipersilakan menjelaskan:

* business flow;
* bagaimana solusi digunakan;
* hal penting dari implementation;
* assumption yang dibuat;
* limitation yang masih terdapat pada solusi.

---

# Final Notes

Kami tidak mencari system yang paling kompleks.

Kami lebih menghargai:

```text
Clear Business Understanding

Correct Business Rules

Consistent Data

Readable Code

Reasonable Architecture

Useful Tests

Clear Documentation

Good Delivery
```

dibandingkan implementation yang memiliki banyak technology tetapi sulit dipahami atau tidak menyelesaikan business problem dengan benar.

**Keep the solution simple, correct, maintainable, and explainable.**
