# SkillBridge Design Documentation


## 1. Design

### 1.1 Problem Statement

Students and early-career professionals often find a "skills gap" between their academic knowledge and the specific technical requirements of job postings. Navigating multiple job boards and certification sites makes it difficult to see a clear path from their current skill set to their target role.

SkillBridge narrows that gap by turning raw profile information (resume text or GitHub profile) into a concrete readiness score, explainable gap analysis, prioritized learning roadmap, and tailored interview questions.

### 1.2 Target Audiences

- **Recent Graduates** — focus on certifications, foundational projects, and role-entry readiness
- **Career Switchers** — identify transferable skills and bridge roles
- **Mentors** — data-backed guidance for mentees’ development

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js App Router)                │
│  / (landing) → /analyze (input flow) → /dashboard (results)          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Routes (Next.js)                         │
│  POST /api/analyze  │  POST /api/roadmap  │  POST /api/interview     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Core Library Modules                         │
│  githubProfile  │  skillExtractor  │  gapAnalysis                    │
│  roadmapGenerator  │  interviewGenerator  │  jobMarket  │  privacy   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              data/roles.ts   jobDescriptions   OpenAI (optional)
              (local)         (synthetic 100+)  GitHub API
```

### 1.4 User Flow

1. **Input** — User pastes resume text, GitHub profile URL, or both in a single text area.
2. **Resolve** — System determines input type (resume-only, GitHub-only, or combined) and fetches GitHub profile + repo languages when applicable.
3. **Extract** — AI extracts technical skills from the combined text; falls back to keyword matching if AI fails.
4. **Analyze** — Skills are compared against role requirements; readiness score, matching/missing skills, and market insights are computed.
5. **Roadmap** — AI generates a structured learning roadmap (weeks, focus areas, resources, cost, estimated hours).
6. **Interview** — AI generates role-specific technical questions based on missing skills.
7. **Dashboard** — Results are shown with transferable roles, projected readiness, and job-market insights.

### 1.5 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Local role dataset** | Explicit, reviewable comparison logic; no live scraping; predictable for MVP. |
| **Synthetic job descriptions** | 100+ postings enable demand-frequency insights without external job APIs. |
| **AI + keyword fallback** | AI for quality; deterministic fallback for reliability when AI is unavailable. |
| **Dual input (resume + GitHub)** | Combined signal improves accuracy; GitHub repo languages add code-level skills. |
| **No persistence** | Privacy-first; no database or user accounts; all analysis is ephemeral. |
| **PII redaction** | Email, phone, addresses redacted before AI processing. |
| **Audience modes** | Tailored messaging for graduates, switchers, and mentors. |

### 1.6 Data Model

- **Roles** — Curated skill requirements per role (Cloud Engineer, Data Engineer, etc.).
- **Job Descriptions** — Synthetic postings with required/preferred skills for market insights.
- **Learning Resources** — Mapped per skill (course, project, certification, practice) with cost and hours.
- **Analysis Result** — Detected skills, readiness score, roadmap, interview questions, warnings.

---

## 2. Tech Stack

### 2.1 Core Technologies

| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Node.js | v18+ (v20+ recommended) |
| **Framework** | Next.js | 16.1.6 (App Router) |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | ^4 |
| **Language** | TypeScript | ^5 |

### 2.2 External Services

| Service | Purpose | Fallback |
|---------|---------|----------|
| **OpenAI API** (or compatible) | Skill extraction, roadmap, interview questions | Keyword-based extraction, template-based roadmap/interview |
| **GitHub API** | Profile metadata, repo descriptions, languages | N/A (GitHub input only when URL provided) |

### 2.3 Development & Quality

| Tool | Purpose |
|------|---------|
| ESLint + eslint-config-next | Linting |
| Vitest | Unit and integration tests |
| Vite (via vitest) | Test runner, path resolution |

### 2.4 Project Structure

```
skillbridge/
├── app/
│   ├── layout.tsx, page.tsx
│   ├── analyze/           # Analysis input flow
│   ├── dashboard/         # Results dashboard
│   └── api/
│       ├── analyze/       # POST - skill gap analysis
│       ├── roadmap/       # POST - learning roadmap
│       └── interview/     # POST - interview questions
├── components/            # React UI components
├── data/
│   ├── roles.ts           # Role definitions
│   ├── jobDescriptions.ts # Synthetic job postings
│   └── learningResources.ts
├── lib/
│   ├── skillExtractor.ts  # AI + keyword skill extraction
│   ├── gapAnalysis.ts     # Readiness, matching, projections
│   ├── roadmapGenerator.ts
│   ├── interviewGenerator.ts
│   ├── githubProfile.ts   # GitHub API, combined input
│   ├── jobMarket.ts       # Market demand insights
│   ├── privacy.ts         # PII redaction
│   └── ai.ts              # OpenAI client, fallbacks
├── types/                 # TypeScript types
└── tests/                 # Vitest tests
```

---

## 3. Future Enhancements

1. **Progress tracking** — Save analyses, track readiness over time, compare before/after.
2. **User accounts & persistence** — Auth, saved history, sharing links (with privacy controls).
3. **Smarter scoring** — Weight skills by recency, depth, and seniority instead of flat match count.
4. **Live job data** — Integrate job board APIs for real posting data.
5. **Gap visualization** — Charts showing coverage vs. gaps and suggested learning order.

---

## Appendix: References

- [README.md](./README.md) — Quick start, features, tradeoffs
