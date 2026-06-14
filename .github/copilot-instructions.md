# Copilot instructions for reconGG

Quick reference for Copilot sessions working in this repository.

---

## Repo layout (high level)
- frontend/: Next.js (app router) TypeScript UI using Tailwind CSS, shadcn/ui, and Aceternity UI. Entry: frontend/src/app
- theggwp-orchestrator-service/: Spring Boot service (Java 21). Main: com.theggwp.theggwp_orchestrator_service.TheggwpOrchestratorServiceApplication
- API-SPEC.md: canonical API contract (VLR.gg-style) used by frontend/backend integrations

---

## Build / run / test / lint commands
Use the project-root and the service-specific subdirectories as shown.

Frontend (inside repo root or cd frontend):
- Install deps: cd frontend && npm install
- Dev server: cd frontend && npm run dev
- Build: cd frontend && npm run build
- Start (production): cd frontend && npm run start
- Lint: cd frontend && npm run lint
- Notes: there are no frontend test scripts in package.json; follow frontend/.docs/FRONTEND_GUIDELINES.md for adding tests.

Backend (theggwp-orchestrator-service):
- Build (with wrapper): cd theggwp-orchestrator-service && ./mvnw clean package
- Build (global maven): mvn -f theggwp-orchestrator-service/pom.xml clean package
- Run (dev): cd theggwp-orchestrator-service && ./mvnw spring-boot:run
- Run JAR: java -jar theggwp-orchestrator-service/target/*.jar
- Tests (full): cd theggwp-orchestrator-service && ./mvnw test
- Run a single test class: ./mvnw -Dtest=TheggwpOrchestratorServiceApplicationTests test
- Run a single test method: ./mvnw -Dtest=TheggwpOrchestratorServiceApplicationTests#contextLoads test
- Java version: 21 (ensure IDE/CI toolchains target Java 21)

---

## High-level architecture notes
- Frontend and backend are separate deployables. The frontend is a Next.js app that consumes REST endpoints described in API-SPEC.md.
- Backend is a lightweight Spring Boot "orchestrator" service. It includes both WebFlux and WebMVC starters (project may use reactive or servlet APIs depending on code paths).
- The main backend entrypoint is at: theggwp-orchestrator-service/src/main/java/com/theggwp/theggwp_orchestrator_service/TheggwpOrchestratorServiceApplication.java
- Backend tests use JUnit Jupiter + SpringBootTest (see src/test/... for examples).

---

## Key conventions and repository-specific rules
- Frontend rules (authoritative): Read frontend/.docs/FRONTEND_GUIDELINES.md before making UI changes. Key enforced conventions:
  - TypeScript mandatory for all components
  - Use shadcn/ui components (use: npx shadcn@latest add <component-name>)
  - Tailwind CSS only for styling (no raw CSS unless documented)
  - Use import aliases with `@/` (e.g., `@/components/ui/button`)
  - Mobile-first responsive classes and dark mode support required
  - Run `npm run lint` before committing
  - The repository includes a custom note: "This is NOT the Next.js you know" — read node_modules/next/dist/docs/ before writing Next.js-specific code.

- Backend conventions:
  - Package name uses underscores (com.theggwp.theggwp_orchestrator_service) — IDEs may need manual setup if they expect hyphens
  - Lombok is present as an optional dependency; enable annotation processing in IDE to avoid compilation issues
  - Use the included Maven wrapper (`./mvnw`) from the service directory for consistent builds in CI/local dev

- AI / agent guidance files present:
  - frontend/AGENTS.md (contains mandatory Next.js and frontend authoring rules)
  - frontend/.docs/FRONTEND_GUIDELINES.md (primary frontend onboarding doc)
  - frontend/CLAUDE.md references AGENTS.md
  Ensure any Copilot session reads those before editing the frontend.

---

## Files to read first when starting a Copilot session
1. frontend/.docs/FRONTEND_GUIDELINES.md (frontend rules & examples)
2. frontend/AGENTS.md (agent-specific constraints, Next.js differences)
3. theggwp-orchestrator-service/HELP.md (backend notes)
4. API-SPEC.md (API expectations and shapes)

---

If any AI-specific config files exist, include their important rules in suggestions: CLAUDE.md and AGENTS.md are already present under frontend and should be applied to frontend edits.

---

Created by Copilot CLI helper. Ask if you'd like adjustments or additional coverage (examples, CI snippets, or expansion of conventions).