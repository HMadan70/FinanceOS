# FinanceOS — App Plan

> Part of the LifeOS suite. Edit freely — check off items as you complete them.

---

## 1. Overview

An AI-powered personal finance tracker — log transactions, track balance through monthly cycles, save toward goals, and (eventually) get AI-assisted entry and insights. **AI is last:** ship the full non-AI product first.

**Repo:** [HMadan70/FinanceOS](https://github.com/HMadan70/FinanceOS) (public — free secret scanning + push protection)
**Stack:** FastAPI (flat files: `database.py`, `models.py`, `schemas.py`, `auth.py`, `routers/` — no Alembic yet) + React Native/Expo (web-first, port 8081) + SQLite → PostgreSQL later. DB file `financeos.db` is gitignored.

---

## 2. Design System

- Background `#f2f2f3`, card surface `#e9e9ea`, accent `#5980a6`
- Space Grotesk 500/600/700, tabular-nums for dollar amounts, Lucide icons stroke-width 2.75
- **Single accent color rule** — no status-based color swapping; "near limit" etc. shown as text/icon pills instead
- Tokens in `frontend/src/theme.ts`. Full mockups for all 6 screens exported into `design/financeos-export/` — only Home is built against it so far.

---

## 3. Status

**Done:** Auth (JWT + refresh, bcrypt, per-user scoping, IDOR-verified) · Transaction CRUD (manual entry only — CSV import dropped) · Per-user categories (6 seeded + custom) · Onboarding (goal/income/challenge) · Full visual redesign (Home implemented, 5 screens designed not built) · Tab restructure (Home/Savings/Budget/Reports/Profile) · **Monthly Cycles** — computed balance, lazy month creation, 3-way leftover choice, tested live incl. reversibility

**Now building:** Phase 3 — **Savings + Goals**. Design reference: `design/financeos-export/FinanceOS-Savings.html`

> ⚠️ **Start here:** the `"savings"` leftover choice currently sets `leftover_choice_made = True` and does nothing else — no `SavingsBalance` model exists, so choosing "Move to Savings" silently discards the money. Wire this up first.

---

## 4. Roadmap

| Phase | What | Status |
|---|---|---|
| 1 | Foundation — auth, transaction CRUD, categories | ✅ Done |
| 1.5 | Onboarding | ✅ Done |
| 2 | Monthly Cycles | ✅ Done |
| **3** | **Savings + Goals** — `SavingsBalance`, `Goal`, `SavingsTransaction` models; deposit/withdraw; goal creation + allocation w/ progress bars | 🔵 Next |
| 4 | Categorization — rule-based keyword matching (~15-20 rules) | ⬜ |
| 5 | Insights/Reports — daily/weekly/monthly aggregation + charts | ⬜ |
| 6 | Budgeting — monthly limits per category, near/over alerts, recurring-transaction detection *(scope may overlap Phase 2 — revisit)* | ⬜ |
| 7 | AI layer — assisted entry, insight summaries, auto-categorization | ⬜ Last |

**Polish/infra (whenever):** `/health` route, Alembic migrations, rate-limiting, split backend into folders, mobile/iPad (blocked on Expo SDK version lag), center "+" tab.

---

## 5. Data Model

- **User** — id, email, hashed_password, created_at, `has_completed_onboarding`, `goal`, `income_range`, `money_challenge`
- **Month** — id, user_id, start_date, starting_balance, leftover_choice_made, carry_over_amount
- **Transaction** — id, user_id, month_id, amount, category_id, description, date, source, created_at
- **Category** — id, name, user_id (nullable if default)
- **SavingsBalance** *(Phase 3)* — id, user_id, total
- **Goal** *(Phase 3)* — id, user_id, name, target_amount, allocated_amount
- **SavingsTransaction** *(Phase 3)* — id, user_id, type, amount, linked_goal_id
- **Budget** *(future)* — id, user_id, category_id, monthly_limit, month_id

---

## 6. API Endpoints

| Route | Status |
|---|---|
| `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/me` | ✅ |
| `/onboarding` | ✅ |
| `/transactions` (CRUD) | ✅ |
| `/months/current`, `/months`, `/months/{id}/leftover-choice` | ✅ |
| `/savings`, `/savings/deposit`, `/savings/withdraw` | ⬜ Phase 3 |
| `/goals`, `/goals/{id}/allocate` | ⬜ Phase 3 |
| `/budgets` | ⬜ future |
| `/insights/daily`, `/weekly`, `/by-month`, `/by-category` | ⬜ future |
| `/insights/summary` (AI) | ⬜ last |

---

## 7. Security Notes

- Scope every query to `user_id` (IDOR-checked) — applies to `Month`, `SavingsBalance`, `Goal` too once they exist
- Never log full transaction data in production
- Rate-limit AI endpoints once built

---

## 8. Open Questions

- [ ] Rule-based categorization first, or straight to LLM-based?
- [ ] AI-assisted entry shape (how much AI vs. simple parsing, where it lives)
- [ ] New `Month` via login-time check, or a proper scheduled job?
- [ ] Budget scope — likely overlaps Monthly Cycles, revisit at Phase 6
