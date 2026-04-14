# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Constraints (BREAKS BUILDS IF IGNORED)

- **ALWAYS use `pnpm`** — npm/yarn will corrupt `node_modules` due to pnpm's symlink structure
- **Astro output is `server`** — requires `@astrojs/node` adapter; never change to `static`
- **Tailwind v4** — configured via `@tailwindcss/postcss`, not a webpack plugin; avoid v3 syntax
- **Env vars**: `PUBLIC_*` vars exposed to client; vars without prefix are server-only
- **API routes**: All database mutations MUST live in `src/pages/api/*.js`, never in `.astro` frontmatter

## Architecture

### SSR Mode
Astro runs in server mode (`output: "server"`). Pages render on-demand via Node adapter. React islands (`client:load`, `client:visible`) provide interactivity. Static assets go in `public/`, processed assets in `src/`.

### Admin Panel
Admin routes live at `/admin/*` (e.g., `src/pages/admin/panel-admin.astro`). Uses `LayoutAdmin.astro` with `NavAdmin.astro` sidebar component. Admin pages are NOT static—they require server rendering.

### React Islands
`src/components/PagosForm.jsx` is the primary React island for payment flow. Communicates with Astro via `sessionStorage` and `CustomEvents`. Never use `client:only` unless browser-only globals are required.

### Supabase Integration
Single client exported from `src/lib/supabase.js`. Use the public client in both client (React) and server (API endpoints) code. Service role key only in server-side API routes for admin operations.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Singleton Supabase client |
| `src/pages/api/reservaciones.js` | POST endpoint for reservations |
| `src/pages/api/logout.js` | Session logout endpoint |
| `src/components/NavAdmin.astro` | Admin sidebar navigation |
| `src/components/PagosForm.jsx` | React payment form island |
| `.agents/skills/shared/astro-ssr.md` | Master SSR patterns |
| `.agents/common/stack.md` | Stack constraints (pnpm, Bash, Node) |

## Commands

```bash
pnpm install     # Install dependencies (pnpm ONLY)
pnpm run dev     # Start dev server at localhost:4321
pnpm run build   # Build for production
pnpm run preview # Preview production build
```

## Multi-Agent AI Setup

The project uses strict AI orchestration via `.agents/`. Copilot queries must read `.github/copilot-instructions.md` first, which mandates reading skill files in `.agents/skills/github/`. When working here, do NOT suggest deviating from the pnpm/SSR/Tailwind constraints defined in `.agents/common/stack.md`.

## Secret Management

API keys and secrets are in `.env` (gitignored). Supabase keys:
- `PUBLIC_SUPABASE_URL` — safe for client
- `PUBLIC_SUPABASE_ANON_KEY` — safe for client (RLS-gated)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose to browser bundle