# Task Manager

A full-stack task management system built for the kLab Tech Upskill Program coding challenge — a Django REST API backend with JWT authentication, and a Next.js frontend for creating, organizing, and tracking tasks.

> The original challenge brief is preserved in [`CHALLENGE.md`](./CHALLENGE.md).

## Live demo

- **App**: https://klab-tech-upskill-coding-challenge-mu.vercel.app/
- **API**: https://klab-tech-upskill-coding-challenge-2026-1.onrender.com/api/
- **API docs (Swagger UI)**: https://klab-tech-upskill-coding-challenge-2026-1.onrender.com/api/docs/

> **Note:** the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idling can take 30–60 seconds to wake up — this is expected, not a bug.

## Technologies used

| Layer | Stack |
|---|---|
| **Backend** | Django 6, Django REST Framework, djangorestframework-simplejwt (JWT auth), django-filter, drf-spectacular (OpenAPI/Swagger), django-cors-headers, WhiteNoise, Gunicorn |
| **Database** | PostgreSQL |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Infrastructure** | Docker & docker-compose for local dev; deployed to Render (API + database) and Vercel (frontend) |

## Features

**Core requirements**
- Full CRUD for tasks (create, list, retrieve, update, delete)
- Toggle status between Pending / Completed
- Priority levels (Low / Medium / High)
- Filter tasks by status

**Optional features implemented**
- **Authentication** — JWT-based (access + refresh tokens), register/login/logout/change-password, refresh-token blacklisting, and automatic silent token refresh on the frontend. Every task is scoped to its owner — one account never sees another's tasks.
- **Search** — full-text search across task title and description.
- **Pagination** — server-side pagination with Previous/Next controls.
- **Sorting** — by newest, due date (undated tasks always sort last, regardless of direction), or priority (High → Medium → Low, not alphabetical).
- **Due dates** — with overdue highlighting on incomplete tasks.
- **Form validation** — client-side validation (required fields, length limits) backed by server-side validation as the source of truth.
- **API documentation** — auto-generated OpenAPI schema, Swagger UI, and Redoc, all kept in sync with the code automatically.
- **Deployment** — live on Render (backend + Postgres) and Vercel (frontend).
- **Polished UI/UX** — custom design system (not a default template), toast notifications, responsive layout, account menu, and a public landing page.

**Not implemented**
- Automated test suite (manual/scripted verification was used throughout development instead — see [Technical decisions](#technical-decisions)).

## Project structure

```
.
├── backend/          Django REST API
│   ├── config/       Project settings, root URLs
│   ├── tasks/        Task model, serializer, viewset, filters
│   ├── accounts/     Auth endpoints (register, login, change password, etc.)
│   └── Dockerfile
├── frontend/         Next.js app
│   ├── src/app/      Routes: landing page, login, register, dashboard
│   ├── src/components/
│   ├── src/lib/api.ts   Typed API client
│   └── Dockerfile
└── docker-compose.yml
```

## Getting started

### Option A — Docker Compose (recommended)

This runs the database, backend, and frontend together with one command.

**Prerequisites:** Docker Desktop.

```bash
git clone https://github.com/mizero-adrien/klab-tech-upskill-coding-challenge-2026.git
cd klab-tech-upskill-coding-challenge-2026
cp .env.example .env
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- API docs: http://localhost:8000/api/docs/
- Django admin: http://localhost:8000/admin/ (create a superuser first: `docker compose exec backend python manage.py createsuperuser`)

`docker compose up` builds the images, starts Postgres, runs migrations automatically, and starts both dev servers with live reload.

### Option B — Run manually (without Docker)

**Prerequisites:** Python 3.12+, Node.js 20+, a running PostgreSQL instance (see [Database setup](#database-setup)).

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash; use .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # then fill in your DB credentials
python manage.py migrate
python manage.py runserver
```

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

## Database setup

The backend needs a PostgreSQL database. Any of these work — just point the `DB_*` environment variables at whichever you choose.

### 1. Docker Compose (default, no setup needed)
Already handled automatically by `docker-compose.yml` — a `db` service runs Postgres 16 with a persistent volume and healthcheck.

### 2. Local PostgreSQL install
Create a database and user, then set in `backend/.env`:
```
DB_NAME=taskmanager
DB_USER=taskmanager
DB_PASSWORD=<your password>
DB_HOST=localhost
DB_PORT=5432
```

### 3. Supabase (hosted, free tier doesn't expire)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string**, and use the **Session pooler** connection (not "Direct connection" — that one is IPv6-only and won't reach from most hosts).
3. Fill in `DB_NAME` (usually `postgres`), `DB_USER`, `DB_PASSWORD`, `DB_HOST` (the pooler hostname), `DB_PORT` (`5432`).

### 4. Render Postgres (what production actually uses)
Created via Render's dashboard (**New → PostgreSQL**). Render exposes `Hostname`, `Port`, `Database`, `Username`, and `Password` as separate fields on the database's info page — copy them directly into the corresponding `DB_*` variables. Use the **internal** hostname if your web service is in the same Render region (faster, no bandwidth cost). Note: Render's free Postgres tier expires 30 days after creation.

## Environment variables

See `.env.example` (root, for Docker Compose) and `backend/.env.example` (for running the backend standalone) for the full list. Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `SECRET_KEY` | backend | Django's cryptographic signing key |
| `DEBUG` | backend | `True` for local dev, **must be `False`** in production |
| `ALLOWED_HOSTS` | backend | Comma-separated hostnames allowed to serve the app |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | backend | Database connection |
| `CORS_ALLOWED_ORIGINS` | backend | Comma-separated frontend origin(s) allowed to call the API |
| `NEXT_PUBLIC_API_URL` | frontend | Base API URL the **browser** calls — must be reachable from the client, not a Docker service name |

## API overview

All endpoints are prefixed with `/api/`. Full interactive documentation: `/api/docs/` (Swagger) and `/api/redoc/` (Redoc).

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register/` | Create an account |
| `POST` | `/api/auth/login/` | Obtain access + refresh tokens |
| `POST` | `/api/auth/refresh/` | Refresh an access token |
| `POST` | `/api/auth/logout/` | Blacklist a refresh token |
| `POST` | `/api/auth/change-password/` | Change the current user's password |
| `GET` | `/api/auth/me/` | Current user's profile |
| `GET` | `/api/tasks/` | List tasks (supports `?status=`, `?priority=`, `?search=`, `?ordering=`, `?page=`) |
| `POST` | `/api/tasks/` | Create a task |
| `GET` | `/api/tasks/{id}/` | Retrieve a task |
| `PUT` / `PATCH` | `/api/tasks/{id}/` | Update a task |
| `DELETE` | `/api/tasks/{id}/` | Delete a task |

All `/api/tasks/*` and `/api/auth/me/`, `/api/auth/change-password/` endpoints require a JWT `Authorization: Bearer <token>` header.

## Technical decisions

- **JWT over sessions**: chosen since the frontend is a decoupled SPA-style client talking to the API over `fetch`, not server-rendered pages sharing cookies with Django. The API client (`frontend/src/lib/api.ts`) automatically retries a request once with a refreshed token on a `401`, so token expiry is invisible to the rest of the app.
- **Per-user data isolation**: `Task.owner` is a required foreign key; the viewset's queryset is always filtered to `request.user`, so there is no way to see or modify another account's tasks even by guessing IDs.
- **Correct sorting, not alphabetical**: priority and due-date sorting use annotated queryset fields (`priority_rank`, `due_date_sort`) rather than sorting the raw string/date columns, so "High" actually sorts before "Low," and tasks without a due date always sort last regardless of direction.
- **12-factor config**: every secret and environment-specific value (`SECRET_KEY`, database credentials, allowed hosts, CORS origins) is read from environment variables via `python-decouple` — nothing is hardcoded, and `.env.example` documents every value needed.
- **WhiteNoise for static files**: since `DEBUG=False` in production means Django stops serving static files itself, WhiteNoise serves the Django admin's CSS/JS directly from the app container with no separate CDN or nginx needed.
- **Docker multi-stage frontend build**: the frontend `Dockerfile` has a `dev` stage (used by `docker-compose`, live-reloading) and a separate lean `standalone` production stage. `next.config.ts` disables standalone output specifically when building on Vercel (`process.env.VERCEL`), since Vercel has its own build pipeline and doesn't need it.
- **Design system, not a template look**: the frontend uses a custom Tailwind v4 token palette (indigo/moss/amber/clay) and IBM Plex Sans/Serif rather than default framework styling, applied consistently across the dashboard, auth pages, and landing page.
- **Verification approach without a test suite**: rather than an automated test suite, functionality was verified through direct API testing (`curl`) against a real Postgres instance for every backend change, and through scripted Playwright screenshot checks across multiple viewport widths (320px–1280px) for every frontend change — including a programmatic horizontal-overflow check, not just visual spot-checks.

## Known limitations

- No automated test suite (`tasks/tests.py` and `accounts/tests.py` are stubs).
- Render's free-tier database expires 30 days after creation; the live demo's database will need migrating or upgrading past that point.
