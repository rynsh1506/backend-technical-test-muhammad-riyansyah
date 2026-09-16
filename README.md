<div align="center">
  <h1>Backend Technical Test</h1>
  <p><strong>Inventory Procurement API</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
    <img src="https://img.shields.io/badge/ElysiaJS-FFB5E8?style=for-the-badge&logo=elysiajs&logoColor=black" alt="ElysiaJS" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 📖 Project Overview

This project is an **Inventory Procurement API** backend built to handle the end-to-end workflow of purchasing goods. The core business flow covers everything from generating **Purchase Requests (PR)** and securing **Approval**, to issuing **Purchase Orders (PO)**, processing **Goods Receipts (GR)**, and finally automating **Inventory Updates**.

## 🛠️ Tech Stack

- **Framework**: ElysiaJS
- **Runtime**: Bun
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Containerization**: Docker & Docker Compose

## 🚀 Setup

_(Instructions will be added as the project is built)_

## 🔐 Environment Variables

Ensure you have a `.env` file based on the provided `.env.example`.

> **Warning:** Do NOT upload your `.env` file to version control.

## 🗄️ Migration

To apply the database schema to your local PostgreSQL instance:

```bash
bunx drizzle-kit migrate
```

## 🌱 Seed (Crucial for Reviewers)

To populate the database with default test data (1 User, 1 Approver, Products, Suppliers, and Warehouses), run:

```bash
bun run src/utils/db/seed.ts
```

**Default Credentials:**

- USER: `staff_user` / `password123`
- APPROVER: `manager_approver` / `password123`

## 🏃 Run Application

_(Instructions will be added as the project is built)_

## 🧪 Testing

_(Instructions will be added as the project is built)_

## 📚 API Documentation

_(Instructions will be added as the project is built)_

## 🧠 Engineering Decisions

- **Strict Architecture (Controller vs Service)**: Following the official ElysiaJS feature-based structure, the *Controller* (`index.ts`) strictly handles HTTP specifics (Routing, Cookie assignment, JWT signing, Status Codes), while the *Service* (`service.ts`) is completely decoupled from the HTTP Context and focuses purely on Business Logic and Database operations. This ensures 100% Type Safety without resorting to `any` or manual type assertions.
- **Modern API Documentation**: Transitioned from classic Swagger UI (`@elysiajs/swagger`) to the modern Scalar UI (`@elysia/openapi`) to provide a highly interactive, fast, and aesthetically pleasing API playground for reviewers.
- **Robust Route Guards (Middleware)**: Leveraged Elysia's `.resolve` lifecycle hook to create an `isAuthenticated` middleware. This acts as a highly typed "Guard" that automatically rejects unauthorized requests before they reach the controller, ensuring the controller receives a strictly non-null User object.
- **Comprehensive Edge-Case Testing**: Automated test coverage goes beyond happy paths. The test suite aggressively validates malformed payloads, forged JWT signatures, absence of cookies, and idempotency of logout operations to guarantee a bulletproof Auth module.

- **Framework Choice**: Chosen **ElysiaJS** running on **Bun** for maximum performance and excellent end-to-end TypeScript support.
- **Database Architecture**: **PostgreSQL** is used as the relational engine. **Drizzle ORM** was chosen to maintain type-safe queries and strict `snake_case` database schema while elegantly keeping `camelCase` in the TypeScript codebase.
- **Authentication & Security**: Utilized Bun's native `Bun.password.hash` for password hashing to minimize dependencies. For Session Management, **JWT via HttpOnly Cookies** was chosen over traditional LocalStorage/Bearer tokens. This protects the application against XSS (Cross-Site Scripting) attacks and simplifies the frontend implementation, fulfilling the test's security and simplicity mandates.
- **Role Management**: Implemented `role` as a simple `VARCHAR` column in the `users` table rather than creating a separate relational `roles` table. Since the business requirements strictly mandate only two static roles (USER and APPROVER) without complex hierarchical permissions, this approach satisfies the "keep the solution simple" requirement and prevents over-engineering.

## 💡 Assumptions

_(Will be updated as assumptions are made during development)_
