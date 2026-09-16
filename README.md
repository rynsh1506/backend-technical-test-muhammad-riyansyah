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

- **Strict Architecture (Controller vs Service)**: Following the official ElysiaJS feature-based structure, the *Controller* strictly handles HTTP specifics (Cookie assignment, JWT, Status Codes), while the *Service* is completely decoupled from the HTTP Context. 
  - **Why?** To ensure pure separation of concerns and 100% Type Safety without resorting to `any` or brute-force type assertions.
- **Modern API Documentation (Scalar UI)**: Transitioned from classic Swagger UI to the modern Scalar UI (`@elysia/openapi`). 
  - **Why?** To provide a highly interactive, fast, and aesthetically pleasing API playground with auto-generated multi-language request snippets for the reviewers.
- **Robust Route Guards (Middleware)**: Leveraged Elysia's `.resolve` lifecycle hook to create an `isAuthenticated` middleware. 
  - **Why?** To act as a highly typed "Guard" that automatically rejects unauthorized requests before they reach the controller. This keeps the controller clean and guarantees it receives a strictly non-null User object.
- **DRY Validation (Drizzle-Typebox)**: Adopted `drizzle-typebox` to automatically generate Elysia (TypeBox) validation schemas directly from Drizzle PostgreSQL schemas using `t.Pick`. 
  - **Why?** To establish a Single Source of Truth. It ensures the API validation layer is always 100% in sync with the database structure without repeating code (DRY principle).
- **E2E Type-Safe Testing (Eden Treaty)**: Adopted Elysia's `@elysiajs/eden` Treaty client for unit testing instead of manual `Request` crafting. 
  - **Why?** To enforce absolute End-to-End Type Safety. It infers backend types directly in the test file, eliminating typos and ensuring that any API schema changes immediately flag as TypeScript errors in the tests.
- **Database Architecture**: **PostgreSQL** with **Drizzle ORM**.
  - **Why?** To maintain type-safe queries and strictly enforce standard `snake_case` database schemas while elegantly mapping them to `camelCase` in the TypeScript codebase.
- **Security (JWT via HttpOnly Cookies)**: Chosen over traditional LocalStorage/Bearer tokens. 
  - **Why?** To protect the application against XSS (Cross-Site Scripting) attacks and simplify the frontend state management, fulfilling the technical test's security mandates.
- **Role Management**: Implemented `role` as a simple `VARCHAR` column rather than a separate relational table. 
  - **Why?** The business requirements mandate only two static roles (USER and APPROVER). This approach prevents over-engineering and satisfies the "keep the solution simple" requirement.

## 💡 Assumptions

_(Will be updated as assumptions are made during development)_
