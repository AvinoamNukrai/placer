## Architecture and Implementation Plan

### Tech stack and architecture

- Backend: Node.js + Express (TypeScript), SQLite for data, Zod for validation, Drizzle ORM or Knex (assume Drizzle for clean TS types).
- Frontend: React + Vite (TypeScript), minimal UI library (e.g., Headless UI + Tailwind or plain CSS), React Query for data fetching/cache, URL-based filter state.
- Data: CSV ingested once into SQLite; computed fields like `is_open` derived at query-time or through a view.
- Repo layout: single repo, two apps (`backend/`, `frontend/`), shared API contracts mirrored across FE/BE.

### Dataset field mapping and derivations

- UI "visits" → CSV `foot_traffic` (integer)
- UI "category" → CSV `sub_category`
- UI "state" → display `state_code` (compact); `state_name` optional
- UI "DMA" → `dma` (numeric ID; names optional)
- `is_open` (minimal): `date_closed` is empty/null. (Later: make time-aware vs Oct 2023 if needed.)

### Project structure

```txt
placer/
  Hands-On Exercise/
    Bigbox Stores Metrics.csv
  data/
    bigbox.sqlite                 # built DB file (generated)
    schema.sql                    # DDL used to initialize DB
  scripts/
    build_db.ts                   # CSV -> SQLite ingest (node script)
    validate_csv.ts               # optional sanity checks
  backend/
    src/
      app.ts                      # Express app bootstrap
      server.ts                   # HTTP server start
      config/env.ts               # env var loading
      db/
        client.ts                 # SQLite/Drizzle client
        migrations/
          001_init.sql
        views/
          venues_view.sql         # computed is_open, normalized fields
      modules/
        pois/
          pois.controller.ts
          pois.router.ts
          pois.service.ts
          pois.types.ts           # Zod schemas + TS types
        summary/
          summary.controller.ts
          summary.router.ts
          summary.service.ts
          summary.types.ts
        options/
          options.controller.ts
          options.router.ts
          options.service.ts
      middleware/
        errorHandler.ts
        validateQuery.ts
        cors.ts
        requestLogger.ts
      utils/
        pagination.ts
        numbers.ts
    test/
      pois.e2e.test.ts
      summary.e2e.test.ts
      isOpen.unit.test.ts
    package.json
    tsconfig.json
    .env.example
  frontend/
    src/
      main.tsx
      App.tsx
      api/
        client.ts                 # fetch wrapper + base URL
        pois.ts                   # typed API calls
        types.ts                  # mirrors backend response types
      state/
        filters.ts                # URL <-> filter state sync helpers
      components/
        FiltersPanel/
          FiltersPanel.tsx
        Table/
          PoisTable.tsx
        Pagination/
          Pagination.tsx
        Summary/
          SummaryStrip.tsx
        Layout/
          Page.tsx
      pages/
        DashboardPage.tsx
      styles/
        index.css
    vite.config.ts
    index.html
    package.json
    tsconfig.json
  package.json                    # root scripts (convenience)
  README.md
```

### Database plan

- Engine: SQLite (simple, file-based, fast enough for this dataset).
- Table: `venues` (one row per POI), primary key `entity_id TEXT PRIMARY KEY`.
- Suggested columns and types:
  - `entity_id TEXT PRIMARY KEY`
  - `entity_type TEXT NOT NULL`
  - `name TEXT NOT NULL`
  - `foot_traffic INTEGER NOT NULL DEFAULT 0`
  - `sales REAL`
  - `avg_dwell_time_min REAL`
  - `area_sqft REAL`
  - `ft_per_sqft REAL`
  - `geolocation TEXT`
  - `country TEXT`
  - `state_code TEXT`
  - `state_name TEXT`
  - `city TEXT`
  - `postal_code TEXT`
  - `formatted_city TEXT`
  - `street_address TEXT`
  - `sub_category TEXT`
  - `dma INTEGER`
  - `cbsa INTEGER`
  - `chain_id TEXT`
  - `chain_name TEXT`
  - `store_id TEXT`
  - `date_opened TEXT`
  - `date_closed TEXT`
- Indexes (to match filters/sorts):
  - `idx_venues_chain_name (chain_name)`
  - `idx_venues_dma (dma)`
  - `idx_venues_sub_category (sub_category)`
  - `idx_venues_state_code (state_code)`
  - `idx_venues_city (city)`
  - `idx_venues_date_closed (date_closed)`
  - Optional: `idx_venues_foot_traffic (foot_traffic)` if sorting by visits frequently
- View `venues_view` (optional, for cleaner selects):
  - Adds `is_open` as `CASE WHEN date_closed IS NULL OR date_closed = '' THEN 1 ELSE 0 END`.
  - Normalizes aliases: `category` = `sub_category`, `state` = `state_code`, `visits` = `foot_traffic`.

### Data ingestion plan

- Script `scripts/build_db.ts` (Node + ts-node):
  - Read `Hands-On Exercise/Bigbox Stores Metrics.csv` using a streaming CSV parser.
  - Coerce types and trim/normalize strings (case, whitespace).
  - Initialize DB from `data/schema.sql` (drop/create when `--fresh`).
  - Bulk insert rows in a single transaction.
  - Print summary (row count, distinct chains/dmas).
- Optional `scripts/validate_csv.ts` for sanity checks (e.g., nulls, type ranges, malformed WKT).

### Backend API design (REST)

- Base URL: `/api`
- Endpoints:
  - GET `/api/pois`
    - Query params:
      - `chain_name` string (optional)
      - `dma` number (optional)
      - `category` string (optional; can be deferred in minimal)
      - `is_open` in `all|open|closed` (default `all`)
      - `page` number (default 1)
      - `page_size` number (default 25, max 100)
      - `sort_by` in `name|foot_traffic` (default `foot_traffic`)
      - `sort_dir` in `asc|desc` (default `desc`)
    - Response shape:
      - `items[]`: `entity_id,name,chain_name,category,dma,city,state,visits,is_open`
      - `page,page_size,total_count`
  - GET `/api/summary`
    - Same filters as `/api/pois` (no paging).
    - Response: `total_venues`, `total_foot_traffic`.
  - GET `/api/options`
    - Response: `chain_names[]`, `dmas[]` (and later `categories[]`).

### Backend implementation outline

- `db/client.ts`: open SQLite (better-sqlite3), initialize Drizzle, export query helpers.
- `modules/pois/pois.service.ts`:
  - Build WHERE from filters, add ORDER BY + LIMIT/OFFSET.
  - Select from `venues_view` (or from `venues` and compute `is_open` in SQL).
  - Execute count query for `total_count`.
- `modules/summary/summary.service.ts`:
  - Apply identical WHERE; compute `COUNT(*)`, `SUM(foot_traffic)`.
- `modules/options/options.service.ts`:
  - `SELECT DISTINCT chain_name`, `SELECT DISTINCT dma WHERE dma IS NOT NULL`, ordered.
- Validation: Zod schemas in `*.types.ts`; middleware `validateQuery.ts` for uniform 400s.
- Middleware: `requestLogger.ts`, `cors.ts` (allow `http://localhost:5173`), `errorHandler.ts`.
- Tests: unit for `is_open` logic; E2E for `/api/pois` and `/api/summary` with a small fixture DB.

### Frontend plan

- Single page app (`/`) built with React + Vite + TypeScript.
- State: filters and pagination kept in URL query string; `react-query` keys include filters/page.
- Data fetching (`frontend/src/api/*`):
  - `fetchPois(filters)` → `{ items, page, page_size, total_count }`
  - `fetchSummary(filters)` → summary numbers
  - `fetchOptions()` → dropdown values
- UI components:
  - `FiltersPanel` with selects for Chain and DMA, toggle for Is Open (All/Open; Closed optional later), and a Search button.
  - `SummaryStrip` with `total_venues` and `total_foot_traffic` (formatted).
  - `PoisTable` with columns: `Name, Chain Name, Category, DMA, City, State, Visits, Is Open`.
  - `Pagination` with Previous/Next and numbered buttons.
- Sorting: optional in V1 (default sort by `visits` desc); add clickable headers later.
- Accessibility and UX: labeled inputs, keyboard nav, loading and empty states, error banners.
- Formatting: thousands separators for numbers; badges for `is_open`.

### Dev and run scripts

- Root `package.json` scripts (examples):
  - `dev:db` → build DB from CSV
  - `dev:be` → start backend (ts-node-dev)
  - `dev:fe` → start frontend (vite)
  - `dev` → run FE + BE concurrently
  - `test:be` → run backend tests
- Backend `.env`:
  - `PORT=4000`
  - `SQLITE_PATH=./data/bigbox.sqlite`
  - `CORS_ORIGIN=http://localhost:5173`

### Performance and correctness

- Server-side pagination avoids loading entire dataset in the browser.
- Filterable fields are indexed; `COUNT(*)` + `SUM(foot_traffic)` are fast in SQLite.
- Options endpoint can be cached in memory for a few minutes.
- Consistent validation and error shapes keep FE logic simple.

### Incremental delivery roadmap

1. Create schema and ingestion script; generate `data/bigbox.sqlite` from CSV.
2. Implement `/api/pois` with pagination; return static page; then add filters, sorting, and `total_count`.
3. Implement `/api/summary` reflecting the same filter WHERE.
4. Implement `/api/options` for chains and DMAs.
5. Scaffold frontend; wire filters, table, pagination to the API; add summary strip.
6. Sync filters to URL; add loading/empty/error states; polish formatting.
7. Add sorting controls; write tests; document setup and design decisions in `README.md`.
