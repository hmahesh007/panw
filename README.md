## SkillBridge Career Navigator

SkillBridge is an AI-assisted MVP that helps students and early-career professionals understand the gap between their current skills and a target technical role. It accepts either pasted resume / project-summary text or a public GitHub profile URL, extracts technical skills, compares them against a local role dataset, calculates readiness, generates a learning roadmap, and creates interview questions.

https://github.com/hmahesh007/panw
---

## Candidate Summary

- **Candidate Name**: Hardik Maheshwari
- **Scenario Chosen**: Career Navigator - AI-assisted skill gap analysis and learning roadmap for target technical roles
- **Estimated Time Spent**: ~4 hours (design, implementation, testing, documentation). Was traveling so most work was done broken up on airplane/airport as mentioned in email.

---

## Quick Start

- **Prerequisites**
  - **Node.js**: v18+ (v20+ recommended)
  - **Package manager**: `npm`
  - Optional but recommended: an OpenAI-compatible API key and a GitHub personal access token

- **Run Commands**
  - **Install dependencies**

    ```bash
    npm install
    ```

  - **Start the dev server**

    ```bash
    npm run dev
    ```

  - The app will be available at `http://localhost:3000`.

- **Test Commands**
  - **Lint**

    ```bash
    npm run lint
    ```

  - **Unit / integration tests**

    ```bash
    npm run test
    ```

  - **Production build**

    ```bash
    npm run build
    ```

---

## Environment Configuration

- **Create a local env file**

  ```bash
  cp .env.example .env.local
  ```

- **Core variables**
  - **`OPENAI_API_KEY`**: your OpenAI (or compatible) API key
  - **`OPENAI_MODEL`**: model name, e.g. `gpt-4o-mini`

- **Optional variables**
  - **`OPENAI_BASE_URL`**: for OpenAI-compatible providers
  - **`GITHUB_TOKEN`**: to reduce GitHub API rate-limits when analyzing public profiles

The committed `.env.example` file provides safe placeholders only. The app is designed to work in a degraded mode when AI credentials are missing by falling back to deterministic logic.

---

## AI Disclosure

- **Did you use an AI assistant (Copilot, ChatGPT, etc.)? (Yes/No)**  
  Yes — used an AI coding assistant (Cursor) for scaffolding, refactoring, and documentation.

- **How did you verify the suggestions?**  
  I reviewed all generated code before accepting it, ran `npm run lint` and `npm run test` to catch regressions, and manually tested the analyze flow and dashboard in the browser. I also cross-checked API contracts and fallback logic against the product spec.

- **Give one example of a suggestion you rejected or changed:**  
  The assistant initially proposed a more complex state structure for the analysis flow (e.g., separate loading states per step). I simplified it to a single linear flow with one loading state, which was sufficient for the MVP and easier to reason about.

---

## Tradeoffs & Prioritization

- **What did you cut to stay within the 4–6 hour limit?**  
  - **Cut**: Full user authentication and persistence — no database, no user accounts, no saved history. All analysis is ephemeral.
  - **Cut**: Deep GitHub code analysis — using profile and repo metadata only, not parsing individual files or commit history.
  - **Cut**: Multi-role comparison — one target role per analysis; no side-by-side comparison across roles.
  - **Cut**: Live job scraping — role requirements are curated locally in `data/roles.ts` for predictability and speed.

- **What would you build next if you had more time?**  
  - **Progress tracking** — save analyses, track readiness over time, and compare before/after.
  - **Smarter scoring** — weight skills by recency, depth, and seniority instead of a flat match count.
  - **Gap visualization** — charts showing coverage vs. gaps and suggested learning order.
  - **Expanded role catalog** — more roles and sub-specializations, possibly with configurable weights.

- **Known limitations**  
  - GitHub ingestion can be rate-limited without `GITHUB_TOKEN`.
  - Local dataset covers only six target roles.
  - Keyword fallback is simple and may miss nuanced skills.
  - No persistent history, sharing, or user accounts.
  - Readiness score is a heuristic, not a formal assessment.

---

## Product Overview

- **Problem**: Many early-career candidates do not know how their current experience maps to real job requirements.
- **Solution**: SkillBridge narrows that gap by turning raw profile information into:
  - a concrete readiness score for a target role
  - an explainable gap analysis
  - a prioritized learning roadmap
  - tailored interview questions

This MVP intentionally focuses on:

- **role-fit clarity**
- **explainable gap analysis**
- **AI assistance with deterministic fallbacks**
- **fast local setup without auth or a database**

---

## Architecture

- **Frontend**
  - Next.js App Router
  - analysis flow at `/analyze`
  - results dashboard at `/dashboard`

- **Backend**
  - `POST /api/analyze`
  - `POST /api/roadmap`
  - `POST /api/interview`

- **Core Modules**
  - `lib/skillExtractor.ts`
  - `lib/gapAnalysis.ts`
  - `lib/roadmapGenerator.ts`
  - `lib/interviewGenerator.ts`
  - `lib/githubProfile.ts`

- **Data**
  - local role requirements in `data/roles.ts`
  - synthetic sample JSON in `data/sample-job-postings.json`
  - no database
  - no user authentication

This design keeps the logic explicit and easy to reason about, while remaining small enough for a time-boxed exercise.

---

## Features

- **Profile ingestion**
  - **pasted resume text analysis**
  - **public GitHub profile URL ingestion**

- **Skill & gap analysis**
  - **skill extraction** with AI plus keyword-based fallback
  - **role comparison and readiness score**
  - **missing-skill roadmap generation**
  - **basic search + section filtering** on the dashboard for reviewing results

- **Interview preparation**
  - **role- and profile-aware interview question generation**
  - **transferable role suggestions** for adjacent roles

- **Resilience & UX**
  - empty-input and unsupported-role handling
  - AI failure fallback behavior
  - clear messaging around limitations and assumptions

- **Supported roles**
  - Cloud Engineer
  - Data Engineer
  - Backend Engineer
  - Frontend Engineer
  - DevOps Engineer
  - Machine Learning Engineer

---

## Testing & Quality

- **Static analysis**
  - `npm run lint` uses ESLint with the Next.js config.

- **Automated tests**
  - `npm run test` runs the Vitest test suite, covering:
    - core analysis utilities (skill extraction, gap analysis, roadmap generation)
    - API routes where applicable

- **Build verification**
  - `npm run build` ensures the Next.js app compiles successfully for production.

Together, these commands provide quick feedback that the project is healthy before you submit or demo it.

---

## Tradeoffs

- **Local role datasets instead of live scraping**
  - Role requirements are manually curated and live in the repo, making comparison logic explicit and easy to review.

- **Metadata-based GitHub ingestion**
  - Uses public profile and repository metadata rather than deep code parsing, trading off depth for reliability and scope within the timebox.

- **Constrained but fallible AI outputs**
  - AI output is constrained into JSON contracts but can still be incomplete or inaccurate; deterministic fallbacks provide a safety net.

- **Fallbacks over blocking**
  - The system prefers graceful degradation (e.g. keyword-based analysis) instead of blocking the user when AI calls fail.

These tradeoffs keep the prototype small, explainable, and reliable within the MVP scope and interview timeframe.

---

## Responsible AI

- **No persistent resume storage**
  - Resume and GitHub inputs are processed temporarily and not stored in a database.

- **AI is advisory**
  - AI-generated outputs can contain inaccuracies and should be reviewed critically by the user.

- **Deterministic fallbacks**
  - When AI is unavailable or fails, the app falls back to deterministic keyword-based behavior.

- **Partial visibility of skills**
  - GitHub analysis may miss skills that are not visible in public metadata or repositories.

- **Non-binding guidance**
  - Recommendations are intended as guidance, not hiring or career guarantees.

---

## Known Limitations

- GitHub profile ingestion can be **rate-limited** without a `GITHUB_TOKEN`.
- The local dataset covers **only a small set of target roles**.
- Keyword fallback is intentionally **simple** and may miss nuanced or domain-specific skills.
- There is **no persistent history**, sharing, or user accounts in this MVP.
- The readiness score is a **heuristic signal**, not a formal assessment of seniority or on-the-job performance.



