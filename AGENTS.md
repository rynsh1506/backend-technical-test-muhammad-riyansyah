# AI Agent Instructions (Strict Adherence Required)

You are an Expert Backend Engineer Assistant. Your primary goal is to write clean, maintainable, and robust code.

**CRITICAL RULE:** You MUST read and follow this document before generating ANY code or answering ANY prompt within this project.

## 1. Task Management & The "Atomic" Principle

- **Read Core Requirements (CRITICAL):** Before starting ANY work, planning, or generating code, you MUST read the `BACKEND-TECHNICAL-TEST.md` file. This document is the absolute core of the project. Do not guess the requirements or write code blindly.
- **Strictly Atomic Tasks:** Tasks must be broken down into the smallest possible logical units (Atomic). Do not attempt to build a massive feature (e.g., "Build Goods Receipt") in one go. Break it down into bite-sized steps (e.g., "Create Goods Receipt Controller", "Implement Inventory Update Transaction").

## 2. Git & Branching Strategy

- **Merge Strategy (Classic Merge Commit):** You MUST ALWAYS use standard merge commits (`gh pr merge --merge`) to preserve the branching history graph (the 'railroad' look). DO NOT use 'Squash and Merge' or 'Rebase and Merge' unless explicitly asked, as the user prefers the branched visualization.

- **Branch Hierarchy:**
  - `main`: Production-ready code ONLY.
  - `dev`: Staging and integration branch. **(STRICTLY PROTECTED: NO DIRECT COMMITS ALLOWED)**
- **Workflow (Anti-Piggybacking):**
  1. ALWAYS pull the latest changes from the `dev` branch before starting any work.
  2. Create a new branch from `dev` using a descriptive format: `feature/<feature-name>` or `fix/<bug-name>` (e.g., `feature/product-schema`, `fix/goods-receipt-transaction`).
  3. Work entirely within this feature branch.
  4. **CRITICAL PRE-COMMIT (AUTO-FORMAT):** Before executing `git commit` or `git push`, the Agent MUST run an auto-formatter (`bunx prettier --write .`) across all modified files. This ensures the committed code strictly adheres to the user's IDE formatting rules and prevents dirty git diffs.
  5. **CRITICAL:** Before moving on to the next task, the Agent MUST proactively commit the code, push the current branch, and **automatically create a Pull Request (PR) to the `dev` branch using the `gh pr create` CLI command**. Do NOT piggyback (pile up) multiple unrelated tasks into a single branch or PR.
  6. **AUTO-MERGE & REVIEW:** The Agent MUST automatically merge the PR itself using `gh pr merge --merge`. Immediately after merging, the Agent MUST present a clear summary/review of the applied updates to the user in the chat. This allows the user to inspect what was merged and easily request a revert if they are unsatisfied with the changes.
  7. **ABSOLUTE RULE (NO EXCEPTIONS):** No matter how small the change is (even a single character typo or a 1-line configuration fix), you MUST NEVER commit directly to the `dev` branch. Every single change MUST be isolated in its own branch and submitted via a Pull Request.
- **Conventional Commits:** Write clean and standard commit messages in English (e.g., `feat: add product schema`, `fix: correct transaction rollback in goods receipt`).

## 3. Naming Conventions, Language & Strict Typing (CRITICAL)

- **English Only:** All variable names, function names, class names, comments, and API error messages MUST be written in clear, professional English. Do not use Indonesian or any mixed languages.
- **Absolute Imports (NO Relative Paths):** You MUST NEVER use relative path imports (`./`, `../`) anywhere in the codebase — including test files. ALL imports MUST use the `@/` alias (e.g., `import { db } from "@/utils/db"`). To enable this for the root entrypoint, the Elysia app instance MUST live in `src/app.ts`, not `index.ts`. The root `index.ts` is a thin entrypoint that only calls `app.listen()`.
- **Strict Static Typing (NO `any`):** You MUST use proper TypeScript types for all variables, parameters, and return values. The use of `any` is STRICTLY PROHIBITED. Fall back to `unknown` if the type is truly dynamically determined, but always prefer precise typing.
- **Code Conventions (TypeScript):**
  - Use `camelCase` for variables, functions, and object properties.
  - Use `PascalCase` for Classes, DTOs, Interfaces, and Types.
  - Use `UPPER_SNAKE_CASE` for global constants and environment variables.
- **Database Schema Conventions:**
  - DO NOT use `camelCase` for database tables or columns.
  - You MUST strictly use `snake_case` for all database structures (e.g., tables: `purchase_requests`, columns: `requested_by`, `created_at`).
  - When defining schemas in Drizzle ORM, ensure the database `snake_case` columns are properly mapped to `camelCase` properties in the TypeScript models. Do not let `camelCase` leak into the SQL schema.

## 4. Architecture & Project Structure

- **Tech Stack:** This project MUST use **ElysiaJS**, **Drizzle ORM**, and strictly **PostgreSQL** as the database engine.
- **API Documentation (Swagger):** You MUST implement Swagger (OpenAPI) using Elysia's Swagger plugin. Ensure all endpoints, request bodies, and responses are properly typed and documented automatically.
- **No API Versioning:** DO NOT use API versioning in the routes (e.g., NO `/api/v1/...`). Keep the route paths clean, direct, and simple (e.g., `/api/purchase-requests`).
- **Vertical Slice / Domain-Driven Structure:** You MUST strictly follow this feature-based folder structure. Do not group files by their technical role (e.g., no global `controllers` or `services` folders).
  src/
  ├── modules/
  │ ├── auth/
  │ │ ├── index.ts # Elysia controller / route definitions
  │ │ ├── service.ts # Business logic & algorithms
  │ │ └── model.ts # Drizzle schema & type validations
  │ ├── user/
  │ │ ├── index.ts
  │ │ ├── service.ts
  │ │ └── model.ts
  ├── utils/
  │ ├── a/
  │ │ └── index.ts
  │ └── b/
  │ └── index.ts

## 5. Engineering Standards & Infrastructure

- **Test File Structure (NO Section Comments):** In `*.test.ts` files, you MUST NEVER use `// --- section ---` style comments to group tests. Instead, use nested `describe()` blocks. Add a JSDoc block above the root `describe()` explaining what module is being tested. The `// @ts-expect-error` directive is the only allowed inline comment in test files (for intentional type violations).
- **Comprehensive Unit Testing:** All business logic functions (especially in `service.ts`) MUST have comprehensive unit tests covering both positive and edge cases. Do not write dummy tests; write meaningful tests that validate business rules.
- **Data Consistency is King:** When dealing with multiple database operations (e.g., inserting a record and updating a balance simultaneously), you MUST use Drizzle Database Transactions to prevent partial updates or race conditions.
- **Interviewer-Friendly Infrastructure (Docker):** The project MUST be easy to test. You must maintain a `Dockerfile` for the ElysiaJS app and a `docker-compose.yml` that seamlessly spins up both the application and the PostgreSQL database together. No manual database setup should be required by the reviewer.
- **Strict Security (NO .env UPLOAD):** You MUST NEVER commit, upload, or push `.env` files to the repository. All secrets must remain local. Ensure `.env` is explicitly listed in `.gitignore`. Provide a `.env.example` file instead for setup documentation.

## 6. Execution Workflow

When receiving a prompt from the user, you MUST respond with your plan in this exact format before writing any code:

1. **Current Context:** (Acknowledge the task you are addressing)
2. **Target Branch:** (State the exact branch name you will create/use, derived from `dev`)
3. **Action Plan:** (List the step-by-step atomic actions you will take)
4. **PR Automation:** (Confirm that the Agent will automatically commit, push, and create a PR to `dev` using the `gh` CLI once the task is done, to avoid piggybacking)

## 7. Production Readiness & Quality Assurance

- **Validation & Error Handling:** You MUST implement consistent JSON error responses (e.g., `{ error: { code, message } }`). You MUST use the correct HTTP Status Codes (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity). Do NOT fallback to `500 Internal Server Error` for predictable client or business logic errors.
- **Informative Logging:** You MUST implement a neat, structured logger. All incoming requests, outgoing errors, and critical business transactions (like Goods Receipt) must be logged informatively to allow easy tracing and debugging.
- **Database Migrations & Seeders:** Every schema change MUST be accompanied by a valid database migration. You MUST also provide seeder scripts for essential master data (e.g., creating 1 USER and 1 APPROVER) so the reviewer can run the app without manual database entry.
- **Continuous Documentation & Aesthetics:** You MUST maintain a comprehensive and **visually attractive** `README.md` from the beginning of the project. Use professional formatting, including **real technology icons/badges** (e.g., via Shields.io or Markdown SVGs) rather than plain emojis. It MUST clearly explain how to use the app, including sections for: Project Overview, Tech Stack, Setup, Env Vars, Migration, **Seed (crucial for reviewers)**, Run Application, Testing, and API Documentation. Additionally, whenever you make a significant technical choice or business assumption, immediately document it under `Engineering Decisions` or `Assumptions`.

## 8. Bonus Points Targets (Mandatory Implementation)

To achieve maximum points on this technical test, you MUST integrate the following features into the system design and implementation once the core requirements are met:

- **Pagination & Filtering:** Implement cursor or offset pagination and robust filtering for all list endpoints (e.g., Products, Purchase Requests).
- **Audit Trail:** Ensure that critical actions (e.g., Approvals, Goods Receipts, Inventory Updates) leave a traceable history in the database.
- **Idempotency:** Implement idempotency keys for critical transactional endpoints (like Submit PR, Approve PR, Create PO, Goods Receipt) to prevent duplicate processing.
- **Infrastructure:** Strictly utilize **Docker** and **Docker Compose** for local development and database provisioning (already covered in Section 5, but highly emphasized here).
- **CI Pipeline:** Create a GitHub Actions workflow for automated testing and building.
- **Deployed API:** Prepare the application to be easily deployable (e.g., via Docker container) and provide instructions or a live link if possible.
