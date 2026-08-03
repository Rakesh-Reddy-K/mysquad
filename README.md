# 🏏 MySquad — Cricket Team Management App

A full-stack cricket team management platform for squads, captains and players.
Manage matches, availability, announcements, team roster, and more.

## ✨ Features

- **Dashboard** — Next match countdown, quick stats, recent announcements
- **Matches** — Schedule, view and track match details (captain can schedule/update/delete)
- **Match Results** — Record win/loss outcomes per match
- **Availability** — Players mark available / not available for each match
- **Announcements** — Team updates; captain can create, update and delete
- **Players** — Full roster with roles (captain, wicket-keeper, bowler, batsman, all-rounder)
- **Player Registration** — Players register their own account
- **Venues** — Manage match grounds with map links
- **Statistics** — Win/loss records, performance insights
- **Roles** — Captain has full management control; players participate

## 🛠 Tech Stack

**Frontend**

- React 19 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- TanStack React Query + React Hook Form
- React Router

**Backend**

- Spring Boot 3.5 (Java 21)
- Spring Security + JWT auth
- Spring Data JPA + Flyway migrations
- Spring Boot Actuator (health checks)

**Database & Hosting**

- PostgreSQL (Supabase)
- Docker (backend + frontend nginx)
- Render.com (blueprint deployment)

## 📋 Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- A PostgreSQL database (local or Supabase)

## 🧑💻 Local Development

**Backend**

```bash
cd backend
mvn spring-boot:run     # http://localhost:8080
```

Requires a PostgreSQL database. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD` environment variables (see `.env.example` — works with Supabase).
Flyway runs migrations + seed data automatically.

**Frontend**

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

The frontend Vite dev server proxies `/api` requests to the backend.

## 🔑 Demo Login

| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Captain | `ravi@mysquad.app`           | `demo1234` |
| Player  | `rahul@mysquad.app`          | `demo1234` |

## 📁 Project Structure

```
mysquad/
├── frontend/               # React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Reusable UI + layout + widgets
│   │   ├── pages/          # Feature pages
│   │   ├── context/        # Theme, Auth
│   │   ├── hooks/          # React Query mutations
│   │   ├── lib/            # API client + utils
│   │   └── data/           # Mock data
│   └── Dockerfile          # nginx serve + SPA fallback
│
├── backend/                # Spring Boot 3.5
│   └── src/main/
│       ├── java/com/mysquad/
│       │   ├── controller/ # REST API
│       │   ├── domain/     # JPA entities
│       │   ├── repository/ # Spring Data
│       │   ├── security/   # JWT filter + service
│       │   ├── config/     # Security, CORS
│       │   └── dto/        # Request/Response records
│       └── resources/
│           └── db/migration/  # Flyway V1 schema + seed
│
├── docker-compose.yml      # frontend + backend (local dev)
├── render.yaml             # Render.com blueprint (free deploy)
└── README.md
```

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/register` | Register player |
| GET | `/api/me` | Current user profile |
| GET | `/api/dashboard` | Next match, announcements, availability summary |
| GET | `/api/matches` | All matches |
| GET | `/api/matches/{id}` | Match details |
| POST | `/api/matches` | Create match (captain) |
| PUT | `/api/matches/{id}` | Update match (captain) |
| DELETE | `/api/matches/{id}` | Delete match (captain) |
| PATCH | `/api/matches/{id}/result` | Set match result (captain) |
| GET | `/api/announcements` | All announcements (captain + players) |
| POST | `/api/announcements` | Create announcement (captain) |
| PUT | `/api/announcements/{id}` | Update announcement (captain) |
| DELETE | `/api/announcements/{id}` | Delete announcement (captain) |
| GET | `/api/availability/match/{matchId}` | Availability for match |
| POST | `/api/availability` | Set/update availability (upsert) |
| GET | `/api/availability/summary` | Availability counts |
| GET | `/api/players` | Team roster |
| GET | `/api/venues` | Match venues |

## 🚀 Deploy to Render.com (Free)

MySquad includes a `render.yaml` blueprint that deploys both backend (Spring Boot)
and frontend (React + nginx) as free **Docker web services** on Render.com.

### Steps

1. **Push this repo to GitHub.**

2. **Create your Supabase project** (or any hosted PostgreSQL). Connection details
   go in the backend environment — update `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`
   in `render.yaml` if your Supabase region differs.

3. **In `render.yaml`, replace `YOUR_USERNAME/YOUR_REPO`** (both services) with your
   GitHub repository name.

4. **In the Render dashboard:** New → **Blueprint** → select your repo. Render reads
   `render.yaml` and creates `mysquad-backend` + `mysquad-frontend`.

5. **Set secrets** (Backend → Environment in Render):
   - `DB_PASSWORD` = your Supabase database password
   - `JWT_SECRET` = a long random string (Render auto-generates one; you can override)

6. **After the first deploy**, verify the backend is healthy:
   `https://mysquad-backend.onrender.com/actuator/health`

7. **Flyway** runs the schema migration + seed data automatically on first boot.

> **Note:** Both services are Docker web services (`runtime: docker`). The frontend
> nginx image uses `envsubst` template processing to proxy `/api` → `BACKEND_URL` at
> container start, so no rebuild is needed when the backend URL changes. If your
> service names differ, update `BACKEND_URL` (frontend) and `CORS_ALLOWED_ORIGINS`
> (backend) to match the real URLs.

## 🏆 Roadmap

- **V2:** Toss reminders, WhatsApp auto-reminders, MOTM voting, jersey numbers,
  expense split, polls, injury status, team gallery
- **V3 (AI):** AI Playing XI, AI Team Balancer, AI Match Planner, AI Captain Assistant
- **Platform:** Opponent finder, ground booking, umpire/scorer hiring,
  digital fee collection, leagues & tournaments