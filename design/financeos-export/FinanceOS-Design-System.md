# FinanceOS Design System Reference

## Colors (hex)
Ground / surfaces
- Background: `#f2f2f3`
- Card/surface: `#e9e9ea`
- Divider: `#1d1f20` at 16% opacity

Text
- Primary text: `#1d1f20`

Accent (blue-gray) — the ONLY color used for icons, links, active nav states, and every progress/spending bar fill
- Base accent: `#5980a6`
- Ramp: 100 `#eef6ff` · 200 `#d6ebff` · 300 `#b5d9fd` · 400 `#94bce3` · 500 `#749dc4` · 600 `#597ea3` · 700 `#416180` · 800 `#2c455d` · 900 `#1d2d3d`

Neutral ramp (backgrounds, tags, dividers, bar tracks)
- 100 `#f5f5f8` · 200 `#e7e7ea` · 300 `#d4d4d7` · 400 `#b7b7ba` · 500 `#98989b` · 600 `#7a7a7d` · 700 `#5d5d60` · 800 `#424244` · 900 `#2b2b2d`

Bar rule: every progress bar (Home Budgets, Savings goals, Budget Categories, Reports By-category) fills with the single accent color `#5980a6` — no status-based color swap.

## "Near limit" / status indicators
Status is shown as text/icon, never as bar color:
- Home: small accent-colored alert-circle icon next to a category name
- Budget screen: an outlined `tag-outline` pill reading "Near limit" next to the percentage

## Typography
- Font family (headings + body): **Space Grotesk**, weights 500/600/700
- Screen titles / balance figure: 700
- Section headings (h4): 600, 14px
- Category/item names: 500
- Dollar amounts: 600, tabular-nums (`font-variant-numeric: tabular-nums`)
- Secondary/supporting text (dates, subtitles): 400

## Shapes & spacing
- Card corner radius, pill buttons/nav, spacing scale inherited from the Organic design system's tokens (16px base radius, 1.10× density) — rounded cards, pill nav/button shapes.
- Card style: filled surface `#e9e9ea`, no border, soft shadow (system default elevation).

## Icons
- Lucide icon set, stroke-width 2.75 (rounder, heavier weight)
- One consistent color everywhere: accent blue-gray `#5980a6`

## Navigation
- Bottom tab bar (5 tabs, no center FAB): **Home / Savings / Budget / Reports / Profile**
- Active tab: full-opacity accent, 600 weight label; inactive: accent at 45% opacity, 500 weight label
- Adding a transaction moved from the old center FAB to a full-width primary button on Home

## Screen notes

**Home** — grown the most. Collapsible "This month" cycle card (balance + money in/out, tap to expand cycle detail), a prominent primary "Add Transaction" button, one of two conditional prompts (leftover-resolution 3-choice, or starting-balance entry — only one shows at a time), a recent-transactions preview, then the full transaction list with per-row edit/delete and a category-chip picker in the add/edit dialog.

**Savings** — new. General savings balance with Deposit/Withdraw actions, a list of goal cards (name, target, progress bar of allocated vs. target), and an Allocate dialog to move money from the general pool into a goal.

**Budget** — per-category monthly limits with progress bars; "Near limit" shown as a text pill, not a color change.

**Reports** — day/week/month segmented toggle, spending-trend line chart, by-category breakdown bars, monthly comparison bar chart.

**Profile** — account info, connected accounts, preferences, logout.

**Auth** — Login, Signup, and a 3-step onboarding flow (main goal / monthly income with preset ranges + custom "Other" entry / biggest challenge, all tappable single-select), ending in a confirmation screen.

## Files included
- FinanceOS-Home.html
- FinanceOS-Savings.html
- FinanceOS-Budget.html
- FinanceOS-Reports.html
- FinanceOS-Profile.html
- FinanceOS-Auth.html

Each is a single self-contained HTML file (fonts/icons/styles inlined) — open directly in a browser or hand to a developer as a visual/structural reference.
