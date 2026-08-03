# LifeOS — Master Plan

> A personal ecosystem of apps that share a philosophy, a design system, and eventually talk to each other through a common AI layer. Edit freely — this is the whole-project doc, so it stays more detailed than each individual app's plan.

---

## 1. Vision

LifeOS is not one app — it's a **suite of independent apps**, each its own repo, each shippable on its own, that eventually connect through:
- A shared identity/auth system (log in once, use everywhere)
- A shared design system (consistent look/feel across apps)
- A shared AI layer that can query **across** apps — e.g. "did I overspend because I skipped the gym and ordered food more?", "how did my study habits change the week I was tightest on budget?"

**Long-term goal:** connect everything through a `LifeOS Core` hub. This is deliberately the **last** thing built — it only makes sense once there's real data in at least two or three apps to connect.

**Why build this way (one app at a time, shared stack):**
- Each app is a complete, usable product on its own — no dependency on the others being finished
- The same FastAPI/JWT/React Native patterns get reinforced and improved with every app, instead of learning a new stack each time
- Mistakes and lessons from the first app (FinanceOS) directly harden the process for every app after it

---

## 2. Core Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Repo strategy | Separate GitHub repo per app | Each app ships independently; no monorepo coordination overhead |
| Backend | FastAPI (Python) | Reused across all apps — reinforces the same skills each project |
| Frontend | React Native (+ React Native Web) | One codebase per app instead of separate web/mobile stacks |
| Database (learning phase) | SQLite + SQLAlchemy | Simple, zero-config, good for learning ORM patterns |
| Database (production target) | PostgreSQL | Migrate once comfortable with the ORM layer and the app has real usage |
| Auth | JWT + refresh tokens, same pattern every app | Becomes a shared identity service later, once LifeOS Core exists |
| AI layer | RAG-based, per-app first, unified later | **AI always comes last** in each app — finish the complete non-AI product first, then layer AI onto a stable codebase. Established while building FinanceOS; carries forward to every app. |

---

## 3. Shared Design System

- [x] Color palette + typography — done for FinanceOS: background `#f2f2f3`, card surface `#e9e9ea`, accent `#5980a6`, Space Grotesk 500/600/700. Lives in `frontend/src/theme.ts`. Full design system doc + all 6 screen mockups exported from Claude Design into `FinanceOS/design/financeos-export/` — this is the seed of the shared system.
- **Key rule established:** single accent color for all icons, links, active nav states, and every progress bar fill — no status-based color swapping (e.g. "near limit" is a text pill, not a red bar). Carries into every other app for consistency.
- [ ] Extract FinanceOS's theme into a standalone, reusable kit once the 2nd app (FitnessOS) starts — candidate for its own repo: `LifeOS-UI-Kit`
- [ ] Shared component library: buttons, cards, inputs, nav — built from what FinanceOS already needed, generalized
- [ ] Mobile-first layouts by default — checking a gym log or budget from a phone should feel native, not like a shrunk desktop site

---

## 4. Apps

> Note: the original GymBrain build (through Phase 1.4) has been dropped. Starting fresh with the naming scheme and shared stack below.

### 4.1 FinanceOS *(currently building)*
**Status:** Phase 2 (Monthly Cycles) + Onboarding complete. Full visual redesign done across all 6 screens (Home built against it, other five designed but not implemented). Next: Savings + Goals. Live on web.
**Stack:** FastAPI, React Native (Expo), SQLite
**Repo:** [HMadan70/FinanceOS](https://github.com/HMadan70/FinanceOS) (public — free secret scanning + push protection)
**Detailed plan:** `FinanceOS-Plan.md`

- [x] Auth (JWT + refresh, bcrypt, per-user scoping)
- [x] Manual transaction entry — CSV import considered and removed from scope
- [x] Per-user categories (6 seeded + custom)
- [x] Onboarding (goal / income / biggest challenge)
- [x] Design system applied — Home implemented, 5 screens designed not built
- [x] Monthly Cycles — computed balance, lazy month creation, 3-way leftover choice
- [ ] **Savings + Goals** ← next
- [ ] Reports (daily/weekly/monthly)
- [ ] Rule-based categorization
- [ ] Budget goals *(future — likely overlaps with Monthly Cycles, revisit scope then)*
- [ ] Recurring transaction detection *(future)*
- [ ] AI features — assisted entry, insight summaries, auto-categorization *(last)*

### 4.2 FitnessOS
**Status:** Fresh start — new design, replaces old GymBrain build
**Stack:** FastAPI, React Native (Expo) — same pattern as FinanceOS

- [ ] Auth + user scoping (reuse FinanceOS's JWT pattern directly)
- [ ] Workout logging (exercises, sets, reps, weight, date)
- [ ] Progress charts (strength over time, volume per muscle group)
- [ ] Apply the shared design system once extracted from FinanceOS
- [ ] RAG-based AI coach *(last, once core logging is solid)*
- [ ] *(scope more once FinanceOS ships — feature list will grow here)*

### 4.3 StudyOS
**Status:** TBD — not yet scoped
**Rough shape (to refine before building):** study session logging, subject/topic tracking, spaced-repetition or review reminders, progress toward course/exam goals — refine once FitnessOS is done and there's a second working example of the shared stack

### 4.4 MindOS
**Status:** TBD — not yet scoped
**Rough shape (to refine before building):** mood/reflection journaling, habit tracking, eventual AI reflection/coaching layer — lowest priority of the four apps, likely benefits most from LifeOS Core's cross-app context once that exists

### 4.5 LifeOS Core (the hub — build last)
**Status:** Not started — deliberately last, once at least FinanceOS + FitnessOS have real data to connect

**Purpose:** single dashboard pulling summaries from every app + one AI assistant that can query across all of them.

- [ ] Cross-app summary dashboard (one screen, key numbers from each app)
- [ ] Unified AI assistant — RAG across all app data, not just one app's database
- [ ] Shared login across apps (single JWT identity service instead of one per app)
- [ ] Cross-app insight examples to eventually support: spending vs. workout consistency, study time vs. mood trends

---

## 5. Security — Keeping Every Repo Safe on GitHub

This applies to **every app repo**, from day one. Set it up before the first commit, not after.

### 5.1 Never commit secrets
- [ ] Put every secret (API keys, DB passwords, JWT signing keys) in a `.env` file
- [ ] Add `.env` to `.gitignore` **before** the first commit — check it's actually ignored with `git status`
- [ ] Commit a `.env.example` instead, with placeholder values, so the required variables are documented
- [ ] Never hardcode secrets directly in source files, even "temporarily" — it's easy to forget and commit it

### 5.2 Catch mistakes before they happen
- [ ] Enable **GitHub push protection** (Settings → Code security) — blocks pushes containing recognizable secret patterns
- [ ] Install a pre-commit secret scanner locally, e.g. `gitleaks` or `git-secrets`
- [ ] If a secret is ever accidentally committed: rotate/revoke it immediately (assume it's compromised, don't just delete the commit), then scrub history with `git filter-repo` or BFG Repo-Cleaner

### 5.3 Backend security basics (FastAPI)
- [ ] Hash passwords with `bcrypt`/`argon2` — never store plaintext
- [ ] Short-lived JWT access tokens + longer-lived refresh tokens, not permanent tokens
- [ ] Validate and sanitize all input with Pydantic models — don't trust client data
- [ ] Rate-limit auth endpoints (login/signup) to slow brute-force attempts
- [ ] Proper CORS rules — don't leave it wide open (`*`) in production
- [ ] HTTPS everywhere once deployed

### 5.4 Dependency & repo hygiene
- [ ] Enable Dependabot to flag vulnerable dependencies automatically
- [ ] Keep `requirements.txt`/`package.json` versions pinned and updated deliberately
- [ ] Make repos private until each app is genuinely ready to be public
- [ ] Add a `SECURITY.md` once apps are public

---

## 6. New Repo Checklist

Run through this at the start of every new app, before the first commit:

- [ ] `.gitignore` includes `.env`, `__pycache__/`, `node_modules/`, DB files
- [ ] `.env.example` committed with placeholder values
- [ ] Push protection + secret scanning enabled in repo settings
- [ ] `README.md` with a one-paragraph description + stack
- [ ] Basic FastAPI skeleton with JWT auth copied/adapted from FinanceOS, not rebuilt from scratch
- [ ] Design tokens imported from the shared kit (once it exists) instead of redefined

---

## 7. Build Order

1. **FinanceOS** ← in progress (Monthly Cycles + Onboarding done, entering Savings)
2. **FitnessOS** — reuse FinanceOS's FastAPI/JWT/theme patterns directly
3. Scope and build **StudyOS**
4. Scope and build **MindOS**
5. Build **LifeOS Core** to connect everything

---

## 8. Learning Notes (tie skills to each phase)

- **FinanceOS** → FastAPI routes, Pydantic, JWT auth, SQLAlchemy, React Native/Expo, design tokens & fonts, per-user data scoping; later: rule-based then AI categorization
- **FitnessOS** → reuse the above patterns with minimal relearning; add progress charts (data viz), RAG-based AI coach
- **StudyOS** → depends on scope once defined
- **MindOS** → depends on scope once defined
- **LifeOS Core** → RAG across multiple data sources, service-to-service auth, aggregating data across independently-built apps

---

## 9. Open Questions / Decisions Still Needed

- [ ] What does StudyOS actually do (feature scope)?
- [ ] What does MindOS actually do (feature scope)?
- [ ] When to migrate SQLite → PostgreSQL — per-app, or all at once before LifeOS Core?
- [ ] Naming convention for repos — plain `FinanceOS` vs `LifeOS-FinanceOS`?
- [ ] Does the shared identity/auth system get built as part of LifeOS Core, or earlier as its own small service that FitnessOS/StudyOS/MindOS can adopt from day one?
