# Banking System

## Tools & Dependencies

- **Languages & Runtimes**: Java 21, Node.js 20+
- **Backend Framework**: Spring Boot 3.5.7 (Spring Web, Spring Security, Spring Data JPA)
- **Database**: PostgreSQL (production), H2 in-memory (local development & tests)
- **Build & Utilities**: Maven Wrapper (`mvnw`), Lombok, JWT (Spring Security)
- **Frontend Stack**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios

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
