# AGENTS.md — Development Constitution & Rules

This document serves as the project's development constitution and core engineering principles for ResolveAI.

---

## 📜 Fundamental Principles & Constitutional Rules

1. **AI Must Never Be a Single Point of Failure**  
   The application must remain 100% operational regardless of AI model downtime, network timeouts, invalid API keys, or rate limits.

2. **Never Expose API Keys in Frontend Code**  
   All AI model API keys (`ANTHROPIC_API_KEY`, etc.) must remain strictly on the backend server (`server.ts`, `/server/services/`). Never prefix API keys with `VITE_` or expose them to browser bundles.

3. **Human Approval Is Mandatory for High-Risk Actions**  
   Financial refunds, credit card disputes, account lockouts, account deletions, and fraud investigations MUST display prominent visual warnings and require explicit human agent review before execution.

4. **Never Allow AI to Directly Execute Sensitive Actions**  
   The AI system is strictly advisory. AI recommendations populate draft fields in the UI; only a human agent clicking "Approve" triggers email dispatch or financial actions.

5. **All Important Human Decisions Must Be Logged**  
   Every human interaction (approve, edit, reject, escalate) and AI analysis event must generate an immutable audit log entry containing timestamp, actor, action name, and details.

6. **Use Fallback Provider When AI Fails**  
   If the primary AI service times out (>8s) or encounters an error, the system must seamlessly fall back to the deterministic rule engine without throwing uncaught exceptions.

7. **Do Not Introduce Unnecessary Dependencies**  
   Keep package dependencies lightweight and maintainable. Prefer native Node.js APIs and utility functions over heavy external frameworks.

8. **Keep Frontend / Backend Separation Clear**  
   Frontend React components communicate with backend Express servers solely via clean REST endpoints (`/api/*`).

9. **Validate All AI-Generated Structured Output**  
   JSON outputs returned by AI providers must be validated against schema interfaces before being persisted or sent to clients.

10. **Never Commit Secrets**  
    Environment variables and secrets belong in `.env` (ignored by git). `.env.example` must contain empty template variables.

11. **Every Major Feature Must Be Testable**  
    All core workflow components (AI analysis, fallback engine, human approval, audit log, DB service) must have automated unit/integration tests running in CI without requiring live API keys.

12. **Preserve Existing Functionality When Modifying the Project**  
    Never overwrite working features or break existing endpoints during refactoring.

---

## 🛠️ Coding Conventions

- **TypeScript:** Strict type checks enabled (`tsc --noEmit`). Do not use `any` unless absolutely necessary.
- **Naming Conventions:**
  - React Components: PascalCase (e.g. `TicketDetail.tsx`)
  - Services/Classes: PascalCase (e.g. `SupportTriageAgent.ts`)
  - Utility Functions/Methods: camelCase (e.g. `analyzeTicket`)
  - Interfaces/Types: PascalCase (e.g. `TicketStatus`, `AIAnalysis`)
- **Error Handling:** Backend route handlers must wrap async execution in `try / catch` blocks and return informative JSON error objects.
- **Styling:** Use Tailwind CSS v4 classes directly. Maintain high visual contrast and dark theme consistency (`#0B0F1A` / slate palette).

---

## 🧪 Testing Expectations

- Tests must be executed using `npm test` (`vitest run`).
- Tests must pass deterministically in CI environments without external network or API key dependencies.
- Unit tests must cover:
  - Fallback Provider keyword matching & category/priority accuracy
  - High-risk detection logic
  - Support Triage Agent processing & schema validation
  - DB Service state transitions & audit log recording
