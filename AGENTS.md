# Écho Jociste — JOC Congo-Brazzaville

## Overview
Full-stack media platform for JOC Congo-Brazzaville (Jeunesse Ouvrière Chrétienne).
- **Frontend**: React 18 + Vite + Tailwind CSS (responsive, mobile-first)
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL 16
- **Blog integration**: Blogger RSS/Atom feed import (magazinechretienne1echojociste.blogspot.com)

## Project Structure
```
client/          # React frontend (Vite dev server on port 5173)
  src/
    pages/        # Public pages (Home, Magazine, Articles, Podcasts, etc.)
    admin/        # Admin dashboard sub-components
    components/   # Shared components (Navbar, Footer, AudioPlayer, etc.)
    api/          # Axios client
server/           # Express API server (port 8000)
  src/index.js    # All API routes (public + admin)
  prisma/
    schema.prisma # Database schema
    seed.js       # Initial data seeding
```

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web: http://localhost:3000 (proxied to Vite on 5173)
- API: internal only (proxied via Vite at /api/*)
- DB: internal (PostgreSQL)

## Admin access
- URL: /admin/login
- Demo credentials: admin@echojociste.cg / echojociste2024
- Roles: ADMIN, EDITOR, WRITER, MANAGER, READER

## Key features
- Magazine with blog import (RSS sync + single URL import)
- Podcasts with audio player
- Videos (YouTube embeds)
- Events with status management
- Activities (La vie dans la JOC)
- Team members & JOC family
- Global search across all content types
- Moderation system (comments, contributions, testimonials)
- Social links management
- Notifications

## Architecture notes
- Single-origin wiring: Vite proxies /api to the Express backend (avoids CORS issues)
- Prisma uses `db push` (not migrations) for schema sync in development
- Seed runs automatically on container startup (idempotent via upsert/findFirst)
- Blog sync uses rss-parser to fetch Atom feed from Blogger
- JWT auth with bcrypt password hashing

## Environment variables
- `DATABASE_URL` — set in compose (local PostgreSQL)
- `JWT_SECRET` — required at boot, stored as encrypted secret in /run/base44/app.env
- `BLOG_FEED_URL` — Blogger Atom feed URL
