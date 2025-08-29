# PRD – Pokédex Web App (Vite/React + Laravel Proxy to PokeAPI)

## 1) Overview

Build a small, production‑lean Pokédex with two screens: **Login** and **Main**. The app is a Vite + React Router SPA using **TanStack React‑Query** to call a **Laravel** backend. Laravel acts as a **proxy + cache** to [https://pokeapi.co](https://pokeapi.co) (PokeAPI), shielding the frontend from third‑party rate limits and enabling server‑side search/aggregation. Heavy emphasis on caching and request minimization.

### Goals

* Fast and reliable Pokédex browsing with search and detail modal.
* Minimize direct calls to PokeAPI via Laravel proxy + cache.
* Show **comprehensive Pokémon details** (abilities, moves, forms, stats, sprites, types, etc.) in a modal.
* Simple local auth gate to access the main app.

### Non‑Goals

* No user registration or backend persistence beyond cache.
* No SSR/SEO indexability for v1.
* No team/multiplayer features.

---

## 2) Users & Personas

* **Candidate/Reviewer/Engineer** using the app to verify functionality and code quality.
* **Casual user** who wants to browse/search Pokémon quickly.

---

## 3) High‑Level Architecture

```
[React (Vite) SPA]
  └─ React Router pages
  └─ React Query (data fetch/cache)
        ⇅ REST calls
[Laravel API (Proxy Layer)]
  └─ Auth (local only)
  └─ Caching (Redis/file)
  └─ Aggregation & throttling
        ⇅
[PokeAPI]
```

**Key idea:** The frontend **never** calls PokeAPI directly — only Laravel. Laravel responses are cacheable client‑side via React Query.

---

## 4) Core User Stories (MVP)

1. **Login**

   * As a user, I can log in with username/password **admin/admin** (configurable), so I can access the app.
   * If I’m already logged in, visiting `/login` redirects me to `/`.
2. **Search & List**

   * As a user, I can search Pokémon by name (substring), and see a paginated/infinite list with image, ID, name, and types.
3. **Details Modal**

   * As a user, when I click a list item, I see a **modal** with detailed info: overview, stats, types, abilities (w/ effects), moves (grouped by learn method), forms, and key sprites.
4. **Performance**

   * As a user, I experience snappy navigation. Repeated requests are instant due to caching.

---

## 5) Functional Requirements

### 5.1 Screens & Navigation

* **/login**

  * Simple form (username, password). Local validation. On success, server sets an **HttpOnly** auth cookie; client stores nothing (SPA uses `/api/me` to confirm session).
  * Incorrect creds show inline errors; disable submit while validating.
* **/** (Main)

  * Header with app title + logout.
  * **Search bar** (debounced input, 250–400ms). Pressing Enter or typing triggers a search.
  * **Listing** under search: shows sprite (front\_default), ID, name, and types. Support **infinite scroll** (preferred) or numbered pagination.
  * **Click row → modal** with tabs: Overview, Stats, Abilities, Moves, Forms, Sprites.

### 5.2 Data shown in Details Modal (v1)

* **Overview**: id, name, height, weight, base\_experience, types.
* **Stats**: base stats (hp, attack, defense, special-attack, special-defense, speed).
* **Abilities**: list; for each ability show name, `is_hidden`, and **effect text** (requires ability expansion).
* **Moves**: grouped by `move_learn_method` (e.g., level-up, machine). Show move name and (if available) level learned at. Consider collapsing long lists.
* **Forms**: list form names; indicate if alternate forms exist.
* **Sprites**: primary sprites (`front_default`, optionally other available variants like `official-artwork` if included in the base payload); lazy-load additional sprite sets.

> **Note**: The `/pokemon/{name}` PokeAPI payload includes references (URLs) to related entities (e.g., ability URLs). The proxy can optionally **expand** some references to provide human‑readable effect text and reduce additional client round‑trips.

---

## 6) API Design (Laravel)

Base path: `/api`

### 6.1 Auth (Cookie-based; Sanctum/session)

* **Flow**

  1. `GET /sanctum/csrf-cookie` → sets `XSRF-TOKEN` cookie (needed for CSRF-protected POSTs).
  2. `POST /api/login` → `{ username, password }` → **sets** `Set-Cookie: laravel_session=...; HttpOnly; Secure; SameSite=Lax` (for same-site) or `SameSite=None; Secure` (for cross-site dev). Returns `200 { user: { username } }` or `401`.
  3. `GET /api/me` → returns current user when authenticated (`200 { user }`) or `401` when not.
  4. `POST /api/logout` → clears session cookie; `204`.
* **Frontend**: calls must include credentials (`fetch(..., { credentials: 'include' })` or `axios` with `withCredentials: true`).
* **Implementation**: Prefer **Laravel Sanctum** for SPA cookie auth. Configure `SANCTUM_STATEFUL_DOMAINS` (e.g., `localhost:5173`) and `SESSION_DOMAIN` appropriately.
* **Rate limiting**: throttle login attempts (e.g., `RateLimiter::attempt`).

### 6.2 Pokédex (Simplified) (Simplified)

> **Change**: Removed `/api/pokemon/index`. Consolidate search + listing into a single endpoint.

* `GET /api/pokemon`
  **Purpose**: Search + list with minimal fields for the visible page.
  **Query**: `name` (substring; optional), `page`, `pageSize` (default 20).
  **Response**: `{ items:[{id,name,types:[...], sprite}], page, pageSize, total }`.
  **Behavior**: Backend checks a cached **name index** stored in the DB. If present, results are served from DB. If not found, Laravel fetches from `GET https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0`, persists to DB + cache, then filters by substring. For items on the requested page, fetch `/pokemon/{name}` from cache (or upstream on miss) and synthesize minimal card data (id, types, sprite).

* `GET /api/pokemon/:id`
  **Purpose**: Detailed record for the modal.
  **Response**: Return the entire upstream payload as is for consistency.
  **Behavior**: Always return full detail object from cache if available, otherwise fetch from upstream and persist to DB + cache.

---

## 7) Caching Strategy

### 7.1 Server‑Side (Laravel)

* **Cache store**: Redis (preferred) or Filesystem cache fallback.

* **Keys**: SHA‑1/MD5 of full upstream URL incl. query OR structured keys like `pokemon:id`.

* **TTLs**:

  * Index list: **24h**.
  * `/pokemon/{name}`: **24h**.

### 7.2 Client‑Side (React Query)

* `staleTime`: 5 minutes for list pages; 30 minutes for details.
* `cacheTime`: 1 hour.
* Use **query keys**: `['pokemon','list',q,page]`, `['pokemon','detail',name]`.
* Prefetch detail on hover/focus of a list item (optional, guarded by network).

---

## 8) UI/UX Requirements

* **Login**: clean, centered card; keyboard accessible; remember me (stores token).
* **Main page**: sticky search bar on top; responsive grid/list; skeleton loaders for cards and modal.
* **Search**: debounced; clear button; empty state with guidance.
* **Modal**: tabs, each tab lazy‑renders; long lists (moves) are virtualized or collapsible.

---

## 9) Error Handling & Edge Cases

* Network errors → toast + retry (React Query).
* 404 Pokémon → user‑friendly message.
* Names with hyphens/regions (e.g., `mr-mime`, `deoxys-attack`) → preserve exact slugs.

---

## 10) Security

* Seed the database with user and credentials admin/admin.

* **HTTP‑only cookies** for auth. No tokens in localStorage.

##

---

## 12) Implementation Notes

* **Tech**: Vite + React + TypeScript, React Router, TanStack React Query.
* **Laravel**, file cache, Guzzle/Laravel HTTP Client.
* **Frontend auth calls**: include credentials by default.

  * Fetch: `fetch(url, { credentials: 'include' })`
* **Auth bootstrap**: on app start, call `/api/me`; route‑guard redirects unauthenticated users to `/login`.

---

## 13) API Examples

* **Auth (cookies)**

  * CSRF: `GET /sanctum/csrf-cookie` → sets `XSRF-TOKEN`.
  * Login: `POST /api/login { username: 'admin', password: 'admin' }` → `Set-Cookie: laravel_session=...` (HttpOnly).
  * Me: `GET /api/me` → `{ user: { username: 'admin' } }`.
  * Logout: `POST /api/logout` → clears cookie.
* **Search list** (with credentials): `GET /api/pokemon?q=pika&page=1&pageSize=20`

  * 200 → `{ items:[{id:25,name:'pikachu',types:['electric'],sprite:'...'}], total: 1, page:1, pageSize:20 }`
* **Detail**: `GET /api/pokemon/pikachu?expand=abilities,moves,forms`

  * 200 → full normalized object (see 6.2).

---

## 14) Acceptance Criteria (MVP)

* ✅ Logging in sets an **HttpOnly** session cookie; wrong creds show errors.
* ✅ After reload, the SPA calls `/api/me`; if authenticated, user lands on **Main**; hitting `/login` while authenticated redirects to `/`.
* ✅ Typing `char` shows **charizard**, **charmander**, etc.
* ✅ Clicking a card opens a modal with tabs showing: overview, stats, abilities (with readable effects), moves grouped by method, forms list, and sprites.
* ✅ Re‑opening the same Pokémon is visibly faster (cache hit).
* ✅ Requests include credentials; accessing protected endpoints without the cookie yields `401` and redirects to `/login`.
