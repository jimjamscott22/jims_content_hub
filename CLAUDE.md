# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start both Vite client (port 5173) and Express API server simultaneously
- `npm run dev:client` — Vite dev server only
- `npm run dev:server` — Express API server only (binds to API_HOST:API_PORT from .env)
- `npm run build` — Production build (outputs to dist/)
- `npm run preview` — Preview production build

No test or lint tooling is configured.

## Architecture

Full-stack bookmark manager: Vue 3 SPA frontend + Express.js REST API backend, both in this repo.

### Frontend (`src/`)

- **Vue 3** with Composition API (`<script setup>`) and **Pinia** stores (Composition API style)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin; custom CSS variables and utility classes in `src/assets/main.css`
- **Vite** dev server proxies `/api` requests to the Express backend (configured in `vite.config.js`)
- Path alias: `@` → `./src`
- ES modules throughout (`"type": "module"` in package.json)

**Stores** (`src/stores/`): `useBookmarkStore`, `useCategoryStore`, `useTagStore` (files `bookmarks.js`, `categories.js`, `tags.js`) handle CRUD and fetch via native `fetch('/api/...')`; `useThemeStore` manages light/dark/system mode (persisted in localStorage under `jch-theme-mode`)

**Routes** (`src/router/index.js`): `/` (home), `/add`, `/edit/:id`, `/category/:id`, `/board` (wide layout via `meta.layoutWide`) — all but home are lazy-loaded

**Utils** (`src/utils/`): `safeUrl()` must wrap any user-supplied bookmark URL bound to an `href` (blocks `javascript:`/`data:`); `categoryColor.js` derives category colors for the shelf UI

### Backend (`server/`)

- **Express 5** with modular route files in `server/routes/` (bookmarks, categories, tags, metadata)
- **MySQL** via `mysql2/promise` connection pool — configured through `.env` variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- Database schema auto-creates on startup via `initializeDatabase()` in `server/db.js`
- `server/db.js` exports `query`, `queryOne`, `execute`, and `withTransaction` helpers (default export `db`; routes call `db.query(...)`, `db.withTransaction(async (tx) => tx.execute(...))`)
- `server/utils/`: `siteMetadata.js` (cheerio-based title/description/icon fetch, used by `/api/metadata` and imports) and `bookmarkImport.js` (`parseBookmarkHtml`, `enrichBookmarks` for Netscape-format browser exports)
- Bookmark URLs are validated as http(s) server-side in create/update (400 otherwise); import parsing also keeps only http(s) links
- `POST /api/bookmarks/import-enriched` streams progress as Server-Sent Events (`start`/`progress`/`done`/`error` messages) while fetching metadata and auto-matching categories by name

**Key tables**: `bookmarks`, `categories`, `tags`, `bookmark_tags` (many-to-many junction)

### Data Flow

Frontend components → Pinia stores (fetch calls) → Vite proxy → Express routes → MySQL pool

## API Endpoints

All under `/api`: bookmarks (CRUD + `/import` + `/stats` + toggle read/favorite), categories (CRUD), tags (CRUD with counts), metadata (URL title/description fetching), health check.

## Prerequisites

- Node.js ^20.19.0 || >=22.12.0
- MySQL 8+ running and accessible with credentials in `.env`
- `npm install` before first run; database tables are created automatically on server start
