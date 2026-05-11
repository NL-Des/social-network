# CLAUDE.md — Social Network

## Stack

- **Frontend:** Next.js (Pages Router) — JavaScript
- **Backend:** Go (Golang)
- **DB:** PostgreSQL

## Project Structure

/src
/pages → Next.js routes (file-based routing)
/components → React components
/lib → Utilities, API clients
/styles → CSS / Tailwind
/backend
/cmd → Go entrypoints
/internal → Business logic, handlers, models
/pkg → Shared packages
/public → Static assets

## Dev Commands

```bash
# Frontend
npm run dev         # Start Next.js dev server (port 3000)
npm run build       # Production build
npm run lint        # ESLint

# Backend
go run ./cmd/api    # Start Go server (port 8080)
go test ./...       # Run all tests
go build ./...      # Build check
```

## Architecture Patterns

- Pages Router: `src/pages/api/*` for Next.js API routes (BFF layer if needed)
- Go backend: REST API, consumed by the frontend via fetch/axios
- Auth: [JWT / session / cookie — précise ici]

## Code Conventions

- **JS:** ESLint + Prettier, async/await, no class components
- **Go:** Standard formatting (`gofmt`), errors always handled explicitly
- **Naming:** camelCase JS, snake_case Go, PascalCase components

## Current Focus

- [ ] My current task: ...
- [ ] Known blockers: ...

## Env Variables

- `.env.local` → Frontend (Next.js)
- `.env` → Backend (Go via godotenv)
- Never commit secrets — see `.env.example`
