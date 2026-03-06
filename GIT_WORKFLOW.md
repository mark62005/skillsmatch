# SkillsMatch — Git Workflow Guide

> The branching strategy, commit conventions, and PR process used on this project.
> Modeled after the workflow used at professional software teams.

---

## Table of Contents

1. [Branch Strategy](#1-branch-strategy)
2. [Branch Naming](#2-branch-naming)
3. [Commit Message Convention](#3-commit-message-convention)
4. [Pull Request Process](#4-pull-request-process)
5. [The Daily Workflow](#5-the-daily-workflow)
6. [What Goes in Each Branch Type](#6-what-goes-in-each-branch-type)
7. [Rules That Are Never Broken](#7-rules-that-are-never-broken)
8. [Example: Full Feature Lifecycle](#8-example-full-feature-lifecycle)
9. [Quick Reference Card](#9-quick-reference-card)

---

## 1. Branch Strategy

This project uses **GitHub Flow with environment branches** — the standard pattern at modern SaaS companies that want both continuous integration and controlled production deployments.

### The three permanent branches

```
production        ← live app (skillsmatch.ca)
main              ← staging app (staging.skillsmatch.ca), integration branch
feature branches  ← all active development
```

```
feat/server-auth-middleware ──┐
feat/client-analysis-form ────┤  PRs → main → auto-deploy → staging
feat/server-ai-pipeline ──────┘               │
fix/server-quota-off-by-one ──┘               │ manual promote
                                              ▼
                                         production
                                     (auto-deploy on merge)
```

### What each branch represents

| Branch                 | Environment | URL                      | How it's updated                               |
| ---------------------- | ----------- | ------------------------ | ---------------------------------------------- |
| `main`                 | Staging     | `staging.skillsmatch.ca` | Auto-deploys on every merge via GitHub Actions |
| `production`           | Production  | `skillsmatch.ca`         | Auto-deploys when `main` is merged into it     |
| `feat/*`, `fix/*` etc. | Local only  | `localhost`              | Your active development                        |

### The flow in plain English

```
1. Branch off main → do your work → open PR
2. CI runs (lint + typecheck + tests) — must be green to merge
3. Squash merge PR into main
4. GitHub Actions auto-deploys main to staging
5. You test on staging.skillsmatch.ca
6. When satisfied: merge main → production
7. GitHub Actions auto-deploys to production
```

### The rules for each permanent branch

**`main`**

- Never commit directly — only PRs from feature branches
- CI must pass before any PR merges
- Represents "ready and tested" code
- Auto-deploys to staging on every merge

**`production`**

- Never commit directly — only ever receives merges from `main`
- Not a development branch — it's a deployment trigger
- Only promote from staging when you've verified the build works there
- Auto-deploys to production on merge

**Feature/fix branches**

- Always branch from `main` (not from `production`)
- Short-lived — open, merge, delete
- One logical unit of work per branch

### Why a `production` branch and not a tag or manual trigger?

Both approaches are valid. A `production` branch is chosen here because:

- It gives you a clear, visual history of every production deployment in GitHub
- It maps cleanly to a GitHub Actions trigger (`on: push: branches: [production]`)
- It's the pattern most commonly used at companies you'll interview at
- It makes environment promotion a deliberate, visible Git action — not a button click in a dashboard somewhere

### Why not a `dev` branch as well?

A `dev` branch solves a specific problem: multiple developers merging simultaneously need a shared integration point before staging. Solo, you don't have that problem — your feature branches are your isolation. Adding `dev` would mean your workflow becomes:

```
feature → dev → main (staging) → production
```

That's an extra merge with no additional safety for a solo developer. Add `dev` the day you bring on a second developer and you have real parallel integration risk to manage.

### Why not Git Flow (with `develop`, `release`, `hotfix` branches)?

Git Flow was designed for teams shipping versioned releases on a schedule — think mobile apps or packaged software. For a web SaaS that deploys continuously, it adds branches and ceremony with no benefit. GitHub Flow (with environment branches) is what Vercel, Linear, Stripe, and most modern SaaS teams actually use.

---

## 2. Branch Naming

### Format

```
<type>/<scope>-<short-description>
```

- **type** — what kind of work this is
- **scope** — which part of the codebase (`server`, `client`, `shared`, `infra`)
- **short-description** — 2–4 words, hyphenated, lowercase

### Types

| Type       | When to use                                |
| ---------- | ------------------------------------------ |
| `feat`     | New feature or capability                  |
| `fix`      | Bug fix                                    |
| `chore`    | Maintenance — deps, config, tooling        |
| `test`     | Adding or fixing tests only                |
| `refactor` | Code restructuring with no behavior change |
| `docs`     | Documentation only                         |
| `ci`       | GitHub Actions / CI config changes         |

### Examples

```bash
# Server (backend) features
feat/server-auth-middleware
feat/server-prisma-schema
feat/server-analyses-routes
feat/server-ai-pipeline
feat/server-stripe-webhooks
feat/server-s3-presign-endpoint
feat/server-inngest-setup

# Client (frontend) features
feat/client-clerk-auth
feat/client-redux-store-setup
feat/client-analysis-form
feat/client-results-page
feat/client-pro-gate-component
feat/client-dashboard-layout
feat/client-stripe-upgrade-flow

# Shared package
feat/shared-analysis-types
feat/shared-noc-constants

# Cross-cutting
feat/server-client-quota-enforcement

# Fixes
fix/server-quota-off-by-one
fix/client-polling-not-stopping
fix/server-clerk-webhook-signature

# Maintenance
chore/update-dependencies
chore/docker-compose-test-db
ci/add-vitest-to-pipeline
docs/update-architecture-md

# Tests (when adding tests to existing code)
test/server-stripe-webhook-handler
test/client-analysis-form-component
```

### Rules for branch names

- **Always lowercase** — `feat/server-Auth` is wrong, `feat/server-auth` is correct
- **Hyphens only** — no underscores, no slashes except the type separator
- **Be specific** — `feat/server-stuff` tells nobody anything
- **Scope always present** — makes it immediately clear which part of the monorepo is affected

---

## 3. Commit Message Convention

This project follows the **Conventional Commits** specification. This is the industry standard used by Angular, Vue, Prisma, and most major open source projects. It's also what enables automatic changelog generation and semantic versioning.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### The short description rules

- **Lowercase** — `feat(server): add quota enforcement` not `Add Quota Enforcement`
- **Imperative mood** — "add", "fix", "update" not "added", "fixed", "updated"
- **No period at the end**
- **Under 72 characters**

### Types (same as branch types)

| Type       | Meaning                                     |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `chore`    | Tooling, deps, config                       |
| `test`     | Tests only                                  |
| `refactor` | No behavior change                          |
| `docs`     | Docs only                                   |
| `ci`       | CI/CD config                                |
| `style`    | Formatting only (not CSS — code formatting) |
| `perf`     | Performance improvement                     |

### Scopes for this project

| Scope    | Meaning            |
| -------- | ------------------ |
| `server` | Express backend    |
| `client` | Next.js frontend   |
| `shared` | packages/shared    |
| `infra`  | Docker, AWS config |
| `ci`     | GitHub Actions     |
| `deps`   | Dependency updates |

### Examples

```bash
# Simple one-liners
feat(server): add clerk jwt verification middleware
feat(server): create analyses routes and controller
feat(client): add analysis form with file upload tab
fix(server): correct quota check off-by-one error
chore(deps): update prisma to 5.10.0
test(server): add unit tests for quota enforcement logic
refactor(server): extract gemini call into reusable wrapper
docs: update architecture md with feature folder structure
ci: add vitest to github actions workflow

# With a body (use when the "why" isn't obvious)
fix(server): handle duplicate stripe webhook events

Stripe can deliver the same webhook event more than once.
Added idempotency check using stripeSubscriptionId before
updating user plan to prevent double upgrades.

# Breaking change (rare — use footer)
feat(shared): restructure AnalysisResult type

BREAKING CHANGE: matchResult.improvementAreas is now an
array of objects instead of strings. Update all consumers.
```

### What makes a good commit

**One logical change per commit.** A commit should do exactly one thing. If you find yourself writing "and" in a commit message, split it into two commits.

```bash
# ❌ Too much in one commit
feat(server): add routes, controller, service and tests for analyses

# ✅ Split into logical units
feat(server): add analyses routes and controller
feat(server): add analyses service with quota enforcement
test(server): add unit tests for analyses quota logic
```

**Commit often.** On a feature branch, commit every time you reach a stable checkpoint — a passing test, a working function, a complete component. You can always squash before merging.

---

## 4. Pull Request Process

### When to open a PR

Open a PR when a feature or fix is **complete and tested locally**. Not before. A PR is a request for code to enter `main` — it should be ready to merge.

### PR title format

Same as a commit message:

```
feat(server): add clerk authentication middleware
fix(client): stop polling when analysis status is FAILED
```

### PR description template

Every PR should answer three questions:

```markdown
## What does this PR do?

Brief description of the change.

## How to test

1. Step-by-step instructions to verify the change works
2. Include any env vars needed, seed data, etc.

## Checklist

- [ ] Tests written (TDD — tests written before implementation)
- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compiling (`pnpm typecheck`)
- [ ] No lint errors (`pnpm lint`)
- [ ] `.env.example` updated if new env vars added
```

### PR size guideline

**Keep PRs small.** A PR that touches 10 files is reviewable. A PR that touches 50 files is not. If a feature is large, break it into multiple PRs:

```
PR 1: feat(server): add prisma schema and initial migration
PR 2: feat(server): add analyses routes and controller
PR 3: feat(server): add analyses service with quota enforcement
PR 4: test(server): add integration tests for analyses endpoints
```

Small PRs get merged faster, are easier to review, and are easier to revert if something goes wrong.

### Solo developer PR process

Even working alone, **never merge directly to `main` without a PR.** The reasons:

1. GitHub Actions CI runs on PR — catches TypeScript errors and failing tests before they hit `main`
2. The PR description forces you to think about what you built and how to test it
3. Your commit history stays clean and readable for employers reviewing your repo
4. It's the habit you need to build before you're on a team

The process:

```
1. Push branch to GitHub
2. Open PR
3. Wait for CI to pass (green checkmarks)
4. Merge (squash merge — see below)
5. Delete branch
```

### Merge strategy: Squash Merge

Use **squash merge** for all PRs. This takes all the commits on your branch and combines them into a single commit on `main`.

**Why squash?** During development you make messy commits like "wip", "fix test", "try this", "revert that". Squashing means `main` only sees clean, meaningful commits — one per feature/fix. Your branch history is preserved in the PR for reference.

In GitHub: when merging a PR, select **"Squash and merge"** from the dropdown.

The squash commit message should be the PR title:

```
feat(server): add clerk authentication middleware (#12)
```

---

## 5. The Daily Workflow

This is the exact sequence of steps for every piece of work.

### Starting a new feature

```bash
# 1. Always branch from main — not from production
git checkout main
git pull origin main

# 2. Create your feature branch
git checkout -b feat/server-analyses-routes

# 3. Write your failing test first (TDD — Red)
# ... write test ...
git add .
git commit -m "test(server): add failing test for POST /analyses quota enforcement"

# 4. Write the implementation (Green)
# ... write code ...
git add .
git commit -m "feat(server): add analyses service with quota enforcement"

# 5. Refactor if needed
git add .
git commit -m "refactor(server): extract quota check into pure function"

# 6. Push and open PR → main
git push origin feat/server-analyses-routes
# Open PR on GitHub → wait for CI ✅ → squash merge into main

# 7. CI auto-deploys main to staging — verify it works at staging.skillsmatch.ca

# 8. Clean up locally
git checkout main
git pull origin main
git branch -d feat/server-analyses-routes
```

### Promoting staging to production

Only do this when you've verified the feature works correctly on staging:

```bash
# Promote main → production
git checkout production
git pull origin production
git merge main
git push origin production
# GitHub Actions auto-deploys to production
git checkout main
```

> **Never work on the `production` branch directly.** This should always be a fast-forward merge — if it's not, something went wrong upstream.

### Staying up to date mid-feature

If `main` has moved on while you're working on a branch:

```bash
# Rebase your branch on top of latest main
git checkout feat/server-analyses-routes
git fetch origin
git rebase origin/main

# If there are conflicts, resolve them, then:
git rebase --continue
```

**Use rebase, not merge, to update feature branches.** Merging `main` into your feature branch creates noisy merge commits. Rebasing replays your commits on top of the latest `main` — keeping history linear and clean.

---

## 6. What Goes in Each Branch Type

A common source of confusion is what counts as a `feat` vs `chore` vs `refactor`. Here's a definitive guide for this project:

### `feat` — new capability the product didn't have before

- New API endpoint
- New UI component
- New Inngest function
- New Prisma model or migration
- New AI prompt step
- Stripe checkout integration

### `fix` — something was broken, now it's not

- A test was failing due to a real bug
- A UI component rendering incorrectly
- A webhook handler not processing correctly
- An edge case that causes a 500 error

### `chore` — work that keeps the project healthy but adds no features

- Updating package versions
- Adding a new npm script
- Updating Docker config
- Setting up Vitest
- Adding ESLint rules
- Updating `.env.example`

### `refactor` — restructuring code without changing behavior

- Extracting a function that was inline
- Renaming a variable for clarity
- Moving a file to a better location
- Splitting a large component into smaller ones
- **Tests must still pass before and after a refactor**

### `test` — tests added to code that already exists

- You skipped a test during a feature (don't make a habit of it)
- You're adding tests to legacy code before refactoring it
- You're adding edge case tests after a bug was fixed

### `docs` — documentation only

- Updating README
- Updating ARCHITECTURE.md
- Adding JSDoc comments to a function
- Updating this GIT_WORKFLOW.md

---

## 7. Rules That Are Never Broken

These are non-negotiable. Print them out if you have to.

```
1. Never commit directly to main or production
2. Never force push to main or production
3. Never merge a PR with failing CI
4. Never commit secrets (.env files, API keys)
5. Never commit node_modules
6. Always write the test before the implementation (TDD)
7. Always delete feature branches after merging
8. One logical change per commit
9. Always branch from main — never from production
10. Only promote to production after verifying on staging
```

### On never committing secrets

Your `.gitignore` already excludes `.env` and `.env.local`. But be paranoid — before any commit, run:

```bash
git diff --staged
```

Scan it visually. If you ever accidentally commit a secret, rotate the key immediately — don't just delete it in a follow-up commit. Once a secret is in Git history, it's compromised even if you delete it, because the history is permanent.

---

## 8. Example: Full Feature Lifecycle

Here's a complete example tracing the `feat/server-analyses-routes` branch from start to production.

```bash
# 1. Start from main
git checkout main && git pull origin main
git checkout -b feat/server-analyses-routes

# 2. TDD cycle
git add server/src/features/analyses/__tests__/analyses.routes.test.ts
git commit -m "test(server): add failing integration test for POST /analyses"

git add server/src/features/analyses/analyses.routes.ts
git add server/src/features/analyses/analyses.controller.ts
git commit -m "feat(server): add POST /analyses route and controller"

git add server/src/features/analyses/analyses.service.ts
git commit -m "feat(server): add analyses service with quota enforcement"

# 3. Push and open PR → main
git push origin feat/server-analyses-routes
# Title: feat(server): add analyses routes with quota enforcement
# CI runs ✅ → squash merge → main
# GitHub Actions auto-deploys main to staging

# 4. Clean up locally
git checkout main && git pull origin main
git branch -d feat/server-analyses-routes

# 5. Verify on staging.skillsmatch.ca ✅

# 6. Promote to production
git checkout production
git pull origin production
git merge main          # always a fast-forward
git push origin production
# GitHub Actions auto-deploys to production ✅
git checkout main
```

Your branch histories now read:

```
# main (staging)
feat(server): add analyses routes with quota enforcement (#8)
feat(server): add prisma schema and initial migration (#7)
chore: initialize monorepo with pnpm workspaces (#1)

# production — mirrors main after each promotion
feat(server): add analyses routes with quota enforcement (#8)
feat(server): add prisma schema and initial migration (#7)
chore: initialize monorepo with pnpm workspaces (#1)
```

---

## 9. Quick Reference Card

```
PERMANENT BRANCHES
──────────────────
main          → staging.skillsmatch.ca   (auto-deploy on merge)
production    → skillsmatch.ca           (auto-deploy on merge from main)

FEATURE BRANCH NAMING
─────────────────────
feat/server-<description>     New backend feature
feat/client-<description>     New frontend feature
feat/shared-<description>     Shared types/constants
fix/server-<description>      Backend bug fix
fix/client-<description>      Frontend bug fix
chore/<description>           Maintenance
test/<scope>-<description>    Tests only
ci/<description>              CI config
docs/<description>            Docs only

COMMIT FORMAT
─────────────
feat(server): <what you added>
feat(client): <what you added>
fix(server): <what you fixed>
test(server): <what you tested>
chore(deps): <what you maintained>
refactor(server): <what you restructured>

DAILY SEQUENCE (feature work)
──────────────────────────────
1.  git checkout main && git pull
2.  git checkout -b feat/<scope>-<description>
3.  Write failing test → commit
4.  Write implementation → commit
5.  Refactor → commit
6.  git push origin <branch>
7.  Open PR → wait for CI ✅ → squash merge → main
8.  Verify on staging
9.  git checkout main && git pull
10. git branch -d <branch>

PRODUCTION PROMOTION
────────────────────
1. Verify staging looks correct
2. git checkout production && git pull origin production
3. git merge main
4. git push origin production
5. git checkout main

THE 10 RULES
────────────
1.  Never commit directly to main or production
2.  Never force push to main or production
3.  Never merge a PR with failing CI
4.  Never commit secrets
5.  Never commit node_modules
6.  Test before implementation (TDD)
7.  Delete feature branches after merging
8.  One logical change per commit
9.  Always branch from main — never from production
10. Only promote to production after verifying on staging
```
