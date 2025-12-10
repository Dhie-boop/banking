# Banking System

This repository implements a minimal, realistic banking system. It models core banking flows including user and account management, authenticated access, and basic transactional operations. The backend is built with Spring Boot and Spring Data JPA for reliable, ACID-compliant persistence, while the frontend is a single‑page React application that consumes the backend API.

Designed to be easy to run locally (H2 in‑memory DB by default) and configurable for production testing against PostgreSQL, the project emphasizes clarity, auditability, and developer ergonomics.

## Key features
- Secure authentication and authorization
  - JWT-based authentication integrated with Spring Security.
  - Role-based access for admin and standard users.
- User & account management
  - Create and manage customer profiles and accounts.
  - Account types, statuses, and basic metadata support.
- Core transaction operations
  - Deposits, withdrawals, and internal transfers with audit trails.
  - Idempotent request handling and transactional consistency.
- Persistence & seeding
  - Spring Data JPA for entity mapping and repository access.
  - H2 in-memory database for local development and tests; PostgreSQL support for production.
  - Built-in DataSeeder to provide initial users and demo data (including a seeded admin).
- Frontend SPA
  - React + TypeScript powered UI using Vite for fast development and HMR.
  - Tailwind CSS for utility-first styling and responsive dashboards.
  - Axios-based API client patterns and React Router for navigation.
- Developer tooling & testing
  - Maven Wrapper for consistent backend build and run steps.
  - Frontend ESLint/TypeScript guidance and build scripts.
  - Unit and integration test scaffolding for backend; production build for frontend.

## Technology stack
- Backend: Java 21, Spring Boot 3.5.x, Spring Security, Spring Data JPA, Lombok
- Database: H2 (development/tests), PostgreSQL (recommended for production)
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Build: Maven (mvnw), npm/yarn for frontend

## Fork, Clone, and Run Locally

1. **Fork on GitHub**
   - Open the repository in GitHub and select **Fork** to create your copy.

2. **Clone your fork**
   
   ```bash
   git clone https://github.com/<your-github-username>/banking.git
   cd banking
   ```

3. **Backend setup**
   - Ensure JDK 21 and Maven Wrapper prerequisites are installed.
   - Optional: adjust `src/main/resources/application.properties` for PostgreSQL credentials. By default the application boots with H2.

   ```bash
   ./mvnw clean compile
   ./mvnw spring-boot:run
   ```

   - API root: `http://localhost:8080/api`
   - Default seeded admin credentials (from `DataSeeder`): `admin` / `admin123`

4. **Frontend setup**
   - Install dependencies and start Vite dev server.

   ```bash
   cd banking-frontend
   npm install
   npm run dev
   ```

   - UI entry point: `http://localhost:5173`

5. **Run tests (optional)**

   ```bash
   ./mvnw test        # backend tests
   cd banking-frontend && npm run build   # type-check + production build
   ```

The backend must be running before exercising the frontend dashboards. Configure PostgreSQL connection values in `application.properties` when deploying beyond local development.
