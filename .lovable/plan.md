# Goaly — Master Build Prompt (Free Version, No Pro Plan)

Use this as a single, self-contained prompt to (re)build the app from scratch on Lovable. It excludes any paid tier, subscriptions, paywalls, Stripe/Paddle, trial logic, and lock indicators. Everything described is free and unlimited.

---

## 1. Product Vision

Build **Goaly** — a beautifully minimal, Apple-inspired mobile-first savings & goal tracking app. The user sets financial goals ("New MacBook", "Trip to Japan", "Emergency fund"), deposits money toward them over time, tracks progress with delightful visuals, and optionally shares goals with friends or family who can contribute together.

The feeling: calm, premium, motivating. Not gamified-childish, not banking-corporate. Think **Things 3 meets Apple Wallet meets a Moleskine notebook**. Every interaction should feel physical, quiet, and rewarding.

Target user: 18–40, mobile-first, saves for meaningful things, wants a private, ad-free, no-nonsense tracker that looks better than their bank app.

---

## 2. Tech Stack (fixed)

- TanStack Start v1 (React 19, Vite 7, file-based routing in `src/routes/`)
- Tailwind CSS v4 via `src/styles.css` (semantic tokens only — no hardcoded colors in components)
- Lovable Cloud (Supabase) for auth, database, storage
- TanStack Query for data
- shadcn/ui components + `lucide-react` icons
- `sonner` for toasts
- Framer-Motion-free: use CSS transitions + Tailwind `animate-*` utilities

No Stripe, no Paddle, no subscription tables, no `is_pro`, no paywall components, no lock icons, no "upgrade" CTAs anywhere in the app.

---

## 3. Design System

**Aesthetic:** dark-first, glassmorphic, soft shadows, generous spacing, rounded-2xl everywhere, subtle gradients on goal cards, no harsh borders.

**Tokens (in `src/styles.css`, HSL):**
- `--background`: near-black with a hint of blue (`222 20% 6%`)
- `--card`: slightly lifted (`222 18% 9%`) with `backdrop-blur`
- `--primary`: warm amber-gold (`38 92% 60%`) — the "saved money" color
- `--accent`: teal (`174 65% 50%`)
- `--destructive`: rose (`350 80% 60%`)
- `--muted-foreground`: `220 10% 55%`
- Shadow: `--shadow-soft: 0 8px 30px -12px hsl(0 0% 0% / 0.4)`

**Typography:** SF Pro-alike system stack for headings, Inter for body. No serif. Numbers use `font-variant-numeric: tabular-nums`.

**Motion:** `press` utility (scale 0.97 on active), fade-up on mount, animated dot indicator under active bottom-nav item.

**Layout:** everything inside a `MobileFrame` centered container (max-width 480px) so it looks native on desktop preview and full-bleed on mobile.

---

## 4. Screens & Routes

All routes are free and accessible to any signed-in user.

```
/                         Home dashboard
/goals                    All goals grid
/goals/$goalId            Single goal detail (deposits, chart, share)
/analytics                Insights & charts
/weekly-report            Auto-generated weekly summary
/settings                 Preferences, theme, currency, language, logout
/onboarding               First-run 3-step intro (once per user)
/login                    Email + Google sign-in
/join/$token              Accept a shared-goal invite
```

### 4.1 Home (`/`)
- Greeting ("Good evening, Yotam ☾") based on time of day
- Total-saved hero card: big amount, thin progress ring around it summarizing average progress across all goals
- Horizontal snap-scroll of goal cards (gradient background per goal, emoji, name, `saved / target`, mini progress bar)
- "Add deposit" FAB (bottom-right, above nav) → opens `AddDepositSheet`
- Recent activity list (last 5 deposits/withdrawals with relative time)

### 4.2 Goals (`/goals`)
- 2-column grid of goal cards
- "New goal" button (top-right) opens `NewGoalSheet` — full-height bottom sheet with: emoji picker, name, target amount, optional deadline (date picker), color/gradient picker (7 presets)
- Empty state: friendly illustration + "Set your first goal" CTA
- **No goal limit.** No count restriction. No upsell.

### 4.3 Goal detail (`/goals/$goalId`)
- Hero: big emoji, name, `saved / target`, animated progress ring, days-to-deadline pill if set
- "Add deposit" + "Withdraw" buttons
- Line chart of cumulative saved over time (last 90 days default, toggle 30/90/all)
- Full transaction history (no time limit — show everything)
- Share widget: generates a share token, produces a link `/join/{token}`; anyone who signs in and opens the link joins as a co-saver. **No limit on shared goals, no limit on members.**
- Danger zone: delete goal (confirm dialog)

### 4.4 Analytics (`/analytics`)
- This-month total deposited (big number)
- Streak counter (consecutive weeks with ≥1 deposit)
- Per-goal contribution donut
- 12-week deposits bar chart
- Best-performing goal card
- Simple algorithmic forecast: "At your current pace, you'll hit {goal} by {date}" — pure math, no AI

### 4.5 Weekly report (`/weekly-report`)
- Auto-generated card summarising the past 7 days: total saved, top goal, streak status, small motivational line chosen from a static list based on trend (up/flat/down)
- "Share" button → generates a PNG via canvas and triggers native share sheet

### 4.6 Settings (`/settings`)
- Account card (avatar initial, display name, email)
- Notifications toggle (local pref for now)
- Security row (placeholder toast)
- Currency picker (USD/EUR/GBP/ILS/JPY) — persisted in `profiles.currency`
- Language picker (multiple langs via i18n) — persisted client-side + `profiles.lang`
- Theme picker: Light / Dark / System (segmented control)
- Data section: "Export my data" → downloads JSON of all goals + transactions (free, unlimited)
- Support: Help, Contact
- Logout button (destructive style)

**Explicitly NOT present anywhere in Settings or the app:** "Upgrade", "Pro", "Go Premium", subscription management, trial banners, lock icons on features, "Download source / IPA" (remove that row entirely).

### 4.7 Onboarding (`/onboarding`)
- 3 swipeable pages: "Set goals that matter" → "Save at your pace" → "Share the journey"
- Final CTA "Get started" → sets `profiles.onboarded = true` → navigates to `/`

### 4.8 Auth (`/login`)
- Email/password + Google OAuth (configure Google provider in same migration)
- After sign-in: if `!onboarded` → `/onboarding`, else `/`

---

## 5. Data Model (Lovable Cloud)

All tables in `public`, all with RLS + explicit GRANTs.

```
profiles                   (1 row per auth user)
  id uuid PK = auth.users.id
  display_name text
  currency text default 'USD'
  lang text default 'en'
  theme text default 'system'
  onboarded bool default false
  created_at timestamptz default now()

goals
  id uuid PK default gen_random_uuid()
  user_id uuid FK auth.users on delete cascade
  name text not null
  emoji text default '🎯'
  color text default 'from-sky-500/30 to-blue-700/30'
  target_amount numeric(12,2) not null check (>0)
  saved_amount numeric(12,2) default 0
  deadline date null
  is_shared bool default false
  share_token text unique null
  created_at timestamptz default now()

goal_members            (co-savers on shared goals)
  goal_id uuid FK goals on delete cascade
  user_id uuid FK auth.users on delete cascade
  joined_at timestamptz default now()
  primary key (goal_id, user_id)

transactions
  id uuid PK default gen_random_uuid()
  goal_id uuid FK goals on delete cascade
  user_id uuid FK auth.users
  amount numeric(12,2) not null check (>0)
  kind text check (kind in ('deposit','withdrawal'))
  note text null
  created_at timestamptz default now()
```

**Triggers:** after insert on `transactions`, update `goals.saved_amount` (+ for deposit, − for withdrawal, clamp ≥ 0).

**RLS policies** (all `TO authenticated`):
- `profiles`: select/update own row (`auth.uid() = id`)
- `goals`: select where owner OR member; insert where owner; update/delete where owner
- `goal_members`: select where `user_id = auth.uid()` OR user owns the goal; insert via share-token flow
- `transactions`: select where user can see the parent goal; insert where user is owner or member; delete where user is the transaction author

**GRANTs on every table:** `SELECT, INSERT, UPDATE, DELETE ON <table> TO authenticated;` + `GRANT ALL ... TO service_role;`. No `anon` grants — the app is auth-only.

**No `subscriptions` table. No `is_pro()` function. No `user_roles` unless the user later asks for admin features.**

---

## 6. Server Functions

Use `createServerFn` from `@tanstack/react-start` in `src/lib/*.functions.ts` with `requireSupabaseAuth` middleware. Client reads use the browser Supabase client through TanStack Query hooks (`useGoals`, `useTransactions`, `useCreateGoal`, `useAddTransaction`, `useDeleteGoal`, `useProfile`, `useUpdateProfile`, `useShare`).

Server functions needed:
- `createGoal` — inserts goal (no tier check, unlimited)
- `addTransaction` — inserts deposit/withdrawal
- `generateShareToken` — creates a random token and marks goal as shared
- `joinSharedGoal({ token })` — adds current user to `goal_members`
- `exportUserData` — returns full JSON dump of the user's goals + transactions

None of these gate on any subscription state.

---

## 7. Internationalization

`src/lib/i18n.tsx` with a `useT()` hook. Ship these languages at minimum: English, Hebrew (RTL), Spanish, French, German, Portuguese, Arabic (RTL), Japanese. Auto-flip `dir="rtl"` on `<html>` when Hebrew/Arabic. Persist choice on `profiles.lang`.

---

## 8. SEO & Head

In `src/routes/__root.tsx` head:
- `title`: "Goaly — Save for what matters"
- `description`: "A calm, beautiful savings tracker. Set goals, deposit at your pace, share the journey — free, private, ad-free."
- `og:title`, `og:description`, `og:type=website`, `twitter:card=summary_large_image`
- Do **not** set `og:image` at root; per-route only when a real hero image exists.

Per-route `head()`: unique title + description for `/goals`, `/analytics`, `/settings`, `/login`.

---

## 9. Non-Goals (explicit exclusions)

- ❌ No Pro / Premium / paid tier
- ❌ No Stripe, Paddle, Lemon Squeezy, or any payments integration
- ❌ No AI Coach, no LLM calls, no AI features of any kind
- ❌ No ads
- ❌ No goal / share / history / member limits
- ❌ No "Download source" or "Export IPA" rows in Settings
- ❌ No admin panel, no user_roles table
- ❌ No web-push notifications backend (local toggle only)

---

## 10. Build Order

1. Cloud schema migration (tables + triggers + RLS + GRANTs) + Google OAuth
2. Auth (`/login`), root layout, `_authenticated` gate, `MobileFrame`, design tokens
3. Home, Goals list, New Goal sheet, Add Deposit sheet
4. Goal detail + transactions + line chart
5. Share flow (`generateShareToken` + `/join/$token`)
6. Analytics + Weekly report
7. Settings (theme, currency, i18n, export JSON, logout)
8. Onboarding
9. SEO metadata pass on every route

Deliver a polished, coherent, ad-free, fully-free savings app. Every screen must feel finished — no placeholder text, no "coming soon" chips, no locked features.
