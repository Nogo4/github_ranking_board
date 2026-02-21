# 🏆 GitHub Ranking Board

A CTF-style leaderboard with GitHub OAuth authentication. Participants log in with their GitHub account, solve challenges and submit flags to earn points and climb the rankings.

---

## Overview

- **Authentication** via GitHub OAuth (username + avatar fetched automatically)
- **CTF Flags**: each challenge has a flag to submit in order to validate and earn points
- **Live leaderboard** with GitHub profile pictures
- **History** of validations with a top-10 snapshot at each moment
- **Galaxy UI**: dark mode with a starfield background and glassmorphism effects

---

## Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Backend    | [Elysia](https://elysiajs.com/) + Bun            |
| Database   | Prisma 7 + SQLite (via libSQL)                   |
| Auth       | [Arctic](https://arcticjs.dev/) (OAuth2) + JWT   |
| Frontend   | React 19 + Vite + TypeScript                     |
| UI         | Vanilla CSS, Lucide icons, React Query           |

---

## Installation

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0
- A [GitHub OAuth App](https://github.com/settings/developers)
  - **Homepage URL**: `http://localhost:5173`
  - **Authorization callback URL**: `http://localhost:3000/auth/callback`

---

### Backend

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET=a_long_random_secret_key
FRONTEND_URL=http://localhost:5173
```

```bash
bun install
bunx prisma migrate deploy   # creates the SQLite database
bun run dev                  # starts on http://localhost:3000
```

---

### Frontend

```bash
cd frontend
cp .env.example .env
```

Fill in `.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
bun install
bun run dev   # starts on http://localhost:5173
```

---

## Managing Flags

Flags are defined in a single file:

```
backend/src/flags/config.ts
```

Each flag has the following structure:

```ts
{
  id: "flag-01",           // unique identifier (do not change after creation)
  name: "Hello World",     // name displayed in the UI
  description: "Fork the repo and open your first Pull Request.",
  points: 10,              // points awarded on validation
  repoUrl: "https://github.com/...",  // link to the challenge repository
  answer: "CTF{hello_world_flag}",    // exact flag to submit (case-insensitive)
}
```

### Adding a flag

1. Open `backend/src/flags/config.ts`
2. Add an object to the `FLAGS` array following the structure above
3. Choose a unique `id` that does not already exist (e.g. `"flag-06"`)
4. Restart the backend

> ⚠️ Never change the `id` of an existing flag — it is used as a database key to track validations.

### Removing a flag

Remove the object from the `FLAGS` array. Existing validations in the database will remain but the flag will no longer appear in the UI.

---

## Frontend Configuration

### Navbar title

The name displayed in the top-left corner can be configured in:

```
frontend/src/config.ts
```

```ts
const config = {
  appName: "Ranking Board", // ← change this
};
```

---

## Project Structure

```
github_ranking_board/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Elysia server entry point
│   │   ├── db.ts              # Prisma client
│   │   ├── auth/
│   │   │   ├── index.ts       # OAuth routes (/auth/github, /auth/callback)
│   │   │   └── github.ts      # Arctic client + GitHub user fetch
│   │   ├── flags/
│   │   │   ├── config.ts      # ⭐ flag definitions (edit this)
│   │   │   └── index.ts       # GET /flags, POST /flags/submit
│   │   ├── ranking/
│   │   │   └── index.ts       # GET /ranking, GET /ranking/history
│   │   └── middlewares/
│   │       └── auth.ts        # JWT Bearer middleware
│   └── prisma/
│       └── schema.prisma      # database schema
│
└── frontend/
    ├── src/
    │   ├── config.ts          # ⭐ title configuration (edit this)
    │   ├── App.tsx            # main router
    │   ├── index.css          # full design system
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── CallbackPage.tsx
    │   │   ├── FlagsPage.tsx
    │   │   ├── RankingPage.tsx
    │   │   └── HistoryPage.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── ProtectedLayout.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx # auth state + localStorage
    │   ├── lib/
    │   │   └── api.ts         # fetch client with auto Bearer JWT
    │   └── types/
    │       └── api.ts         # TypeScript interfaces
    └── .env                   # VITE_API_URL
```

---

## Authentication Flow

```
User → clicks "Sign in with GitHub"
    → GET /auth/github          (backend generates state + redirects to GitHub)
    → GitHub OAuth consent
    → GET /auth/callback        (backend validates code, upserts user, signs JWT)
    → redirect frontend /callback?token=...&user=...
    → stored in localStorage
    → access to protected pages
```

