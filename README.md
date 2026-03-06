# SkillsMatch

> AI-powered resume alignment tool for international students in Canada pursuing PR-eligible skilled employment.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [What Is SkillsMatch?](#what-is-skillsmatch)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [AI Pipeline](#ai-pipeline)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## What Is SkillsMatch?

SkillsMatch is a focused, production-grade micro-SaaS built for a high-stakes niche: **international students in Canada** who are job hunting while navigating the complexity of Permanent Residency (PR) pathways.

Most resume tools are generic. SkillsMatch is not. It understands **Canadian NOC (National Occupational Classification) codes**, **TEER levels**, and **Express Entry eligibility** — and uses that context to generate resume improvements that actually matter for this audience.

**Core user flow:**

1. Upload resume (PDF/DOCX) or paste plain text + paste job description
2. Backend extracts text from file, AI parses both inputs
3. System maps the job to a NOC/TEER classification and returns a match score, missing skills, and rewritten resume bullets
4. Pro users get a full resume rewrite export and PR alignment report (Express Entry + PNP)

---

## The Problem

International students in Canada face a compounded challenge that generic tools don't address:

| Pain Point                   | Why It Matters                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------- |
| TEER confusion               | Not all jobs qualify for Express Entry — students don't know if a job is skilled |
| Resume not getting callbacks | Canadian resume norms differ from other countries                                |
| NOC mismatch                 | Wrong NOC code in a job offer can invalidate a PR application                    |
| Skill gap blindness          | Students don't know which skills to emphasize for Canadian ATS systems           |
| High emotional stakes        | A missed job isn't just a missed paycheck — it delays or kills a PR application  |

---

## The Solution

SkillsMatch provides a 4-step AI pipeline that transforms a raw resume + job description into actionable, PR-aware career intelligence:

```
Resume + JD Input
      ↓
[Step 1] Resume Parser       → Structured skills, titles, experience
[Step 2] JD Parser           → Required skills, seniority, TEER estimate
[Step 3] Matching Engine     → Match score, gaps, keyword recommendations
[Step 4] Rewrite Engine      → Rewritten bullets, new summary, skill suggestions
      ↓
Output: Match Report + Resume Improvements
```

---

## Features

### Free Tier (3 analyses/lifetime)

- Resume upload (PDF/DOCX) or paste plain text
- Match score (0–100)
- Missing skills list
- NOC/TEER classification estimate (AI-inferred)
- Top 5 resume improvement suggestions

### Pro Tier ($19/month)

- Unlimited analyses
- Full resume bullet rewrites
- New professional summary generation
- PR alignment insights — Express Entry (CEC, FSW, FST) **and** Provincial Nominee Programs (PNP)
- PDF export of rewritten resume sections
- Analysis history dashboard

---

## Tech Stack

### Frontend

| Tool                          | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| **Next.js 15** (App Router)   | React framework with SSR/SSG for SEO              |
| **TypeScript**                | Type safety across the entire frontend            |
| **TailwindCSS**               | Utility-first styling                             |
| **shadcn/ui**                 | Accessible, composable UI components              |
| **Clerk**                     | Authentication (social login, session management) |
| **Redux Toolkit + RTK Query** | Global state + data fetching/caching              |
| **Resend**                    | Transactional email (welcome, export, billing)    |

### Backend

| Tool              | Purpose                                  |
| ----------------- | ---------------------------------------- |
| **Express.js**    | REST API server                          |
| **TypeScript**    | Type safety + shared types with frontend |
| **Clerk SDK**     | Server-side JWT verification             |
| **Prisma ORM**    | Type-safe database access layer          |
| **PostgreSQL**    | Primary relational database              |
| **AWS S3**        | File storage for uploaded PDFs/DOCX      |
| **pdf-parse**     | Server-side PDF text extraction          |
| **mammoth**       | Server-side DOCX text extraction         |
| **Inngest**       | Background job queue for AI workflows    |
| **Google Gemini** | AI model powering the 4-step pipeline    |
| **Winston**       | Structured logging                       |

### Infrastructure

| Tool                | Purpose                      |
| ------------------- | ---------------------------- |
| **AWS**             | Cloud deployment (ECS + RDS) |
| **Docker**          | Containerization             |
| **GitHub Actions**  | CI/CD pipeline               |
| **pnpm workspaces** | Monorepo package management  |

---

## Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design, data flow diagrams, and decision records.

```
┌─────────────────────────────────────────────────────────┐
│                      MONOREPO                           │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │    client/      │    │        server/            │   │
│  │   (Next.js)     │◄──►│      (Express.js)         │   │
│  └────────┬────────┘    └──────────┬───────────────┘   │
│           │                        │                    │
│  ┌────────▼────────────────────────▼───────────────┐   │
│  │           packages/shared (TypeScript)           │   │
│  │         Shared types, constants, utils           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                         │
    ┌────▼────┐               ┌────▼────────┐
    │  Clerk  │               │  PostgreSQL │
    │  Auth   │               │  (Prisma)   │
    └─────────┘               └─────────────┘
                                     │
                              ┌──────▼──────┐
                              │   Inngest   │
                              │  (AI queue) │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │   Gemini    │
                              │  AI Engine  │
                              └─────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- A Clerk account (free)
- A Google AI Studio account (for Gemini API key)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/skillsmatch.git
cd skillsmatch
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start local infrastructure

```bash
docker-compose up -d
# Starts PostgreSQL on localhost:5432
```

### 4. Set up environment variables

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

Fill in the values (see [Environment Variables](#environment-variables)).

### 5. Run database migrations

```bash
cd server
pnpm prisma migrate dev
```

### 6. Start development servers

```bash
# From monorepo root — starts both apps concurrently
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Inngest Dev Server: http://localhost:8288

---

## Project Structure

```
skillsmatch/
├── client/                             # Next.js 15 frontend
│   ├── src/
│   │   ├── app/                        # App Router (routing only)
│   │   │   ├── (clerk)/                # Clerk auth pages
│   │   │   ├── (dashboard)/            # Protected app pages
│   │   │   └── (marketing)/            # Public landing pages
│   │   ├── features/                   # Feature modules
│   │   │   ├── analyses/               # components, types, RTK Query API
│   │   │   ├── auth/
│   │   │   └── users/
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui base components
│   │   │   └── shared/                 # Reusable cross-feature components
│   │   ├── store/                      # Redux store + RTK Query setup
│   │   │   ├── baseApi.ts
│   │   │   ├── hooks.ts
│   │   │   ├── rootReducer.ts
│   │   │   └── provider.tsx
│   │   ├── hooks/                      # Global custom hooks
│   │   ├── lib/                        # Utilities (cn, formatters)
│   │   └── types/                      # Global frontend types
│   └── package.json
│
├── server/                             # Express.js backend
│   ├── src/
│   │   ├── features/                   # Feature modules
│   │   │   ├── analyses/               # routes, controller, service, types
│   │   │   ├── users/
│   │   │   └── webhooks/               # Clerk + Stripe webhook handlers
│   │   ├── inngest/                    # Background job functions
│   │   │   └── functions/              # processAnalysis pipeline steps
│   │   ├── ai/                         # Gemini client + prompt templates
│   │   │   └── prompts/
│   │   ├── middleware/                 # Auth, error, rate limit
│   │   ├── lib/                        # Prisma, S3, Winston singletons
│   │   └── index.ts                    # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── packages/
│   └── shared/                         # Shared TypeScript types + constants
│       └── src/
│           ├── types/
│           └── constants/              # NOC codes, TEER definitions
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint, typecheck, test on PR
│       └── deploy.yml                  # Deploy to AWS on main merge
│
├── docker-compose.yml
├── package.json                        # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Environment Variables

### `server/.env`

```env
# Database
DATABASE_URL="postgresql://skillsmatch:skillsmatch@localhost:5432/skillsmatch_dev"

# Clerk
CLERK_SECRET_KEY=sk_test_...

# Gemini
GEMINI_API_KEY=...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# App
PORT=4000
NODE_ENV=development
```

### `client/.env.local`

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Resend
RESEND_API_KEY=re_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Database Schema

See [ARCHITECTURE.md — Database Design](./ARCHITECTURE.md#database-design) for the full ERD.

**Core models:**

- `User` — synced from Clerk, stores plan + analysis count
- `Analysis` — stores each resume/JD analysis job and its results
- `Subscription` — Stripe subscription state for Pro users

---

## AI Pipeline

SkillsMatch uses a **4-step sequential prompt pipeline** powered by Google Gemini. Each step has a single responsibility and structured JSON output, making it testable and debuggable independently.

| Step | Prompt          | Input                  | Output                      |
| ---- | --------------- | ---------------------- | --------------------------- |
| 1    | Resume Parser   | Raw resume text        | Skills, titles, experience  |
| 2    | JD Parser       | Job description text   | Requirements, TEER estimate |
| 3    | Matching Engine | Parsed resume + JD     | Match score, gaps, keywords |
| 4    | Rewrite Engine  | All above + match data | Rewritten bullets + summary |

Each step runs as an **Inngest function** for reliability, retries, and observability.

See [ARCHITECTURE.md — AI Pipeline Design](./ARCHITECTURE.md#ai-pipeline-design) for full prompt templates.

---

## API Reference

All API routes are prefixed with `/api/v1`.

| Method | Route              | Auth | Description             |
| ------ | ------------------ | ---- | ----------------------- |
| `POST` | `/analyses`        | ✅   | Create new analysis job |
| `GET`  | `/analyses`        | ✅   | List user's analyses    |
| `GET`  | `/analyses/:id`    | ✅   | Get analysis result     |
| `GET`  | `/users/me`        | ✅   | Get current user + plan |
| `POST` | `/webhooks/clerk`  | —    | Clerk user sync webhook |
| `POST` | `/webhooks/stripe` | —    | Stripe billing webhook  |

---

## Deployment

The production stack uses:

- **AWS ECS (Fargate)** for the Express API
- **AWS RDS (PostgreSQL 15)** for the database
- **Vercel** for the Next.js frontend (or AWS Amplify)
- **GitHub Actions** for automated CI/CD

See [ARCHITECTURE.md — Infrastructure](./ARCHITECTURE.md#infrastructure) for full deployment diagrams.

---

## Roadmap

### v1.0 — MVP (Weeks 1–4)

- [x] Project scaffolding + monorepo setup
- [ ] Clerk authentication
- [ ] File upload (PDF/DOCX) + text extraction pipeline
- [ ] Core AI pipeline (4-step)
- [ ] Analysis results UI (match score, NOC/TEER, rewrites)
- [ ] Express Entry + PNP pathway alignment (Pro)
- [ ] Stripe integration (Free/Pro)
- [ ] PDF export of rewritten sections

### v1.1 — Accuracy & Growth (Weeks 5–8)

- [ ] Official ESDC NOC database seeded locally (replaces AI-only estimates)
- [ ] Analysis history dashboard
- [ ] Email reports via Resend
- [ ] SEO landing pages (NOC-targeted blog content)

### v2.0 — Expansion

- [ ] PNP province-specific recommendations (BC PNP, Ontario Immigrant Nominee, etc.)
- [ ] LinkedIn import
- [ ] Cover letter generator
- [ ] Job board scraping integration

---

## Contributing

This is a portfolio project actively in development. If you're interested in contributing or have feedback, open an issue or reach out directly.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built by <a href="https://github.com/mark62005">Ka Ho Wong</a> · <a href="ARCHITECTURE.md">Architecture Docs</a>
</div>
