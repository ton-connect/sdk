## Allure Test Runner Backend

Backend service for Allure Test Runner (NestJS + TypeORM + PostgreSQL).

### Environment variables

Create `.env` in this directory or use the provided example:

```
PORT=4444
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=allure-test-runner
```

Notes:
- `PORT` — API port.
- DB values must match your local/dev database; compose sets them for the bundled Postgres.

### Scripts

From this folder:
- `npm run start:dev` — run in watch mode (requires local Postgres).
- `npm run build` — compile to `dist`.
- `npm run start:prod` — run compiled app (`node dist/main`).
- `npm run test` / `npm run test:e2e` — unit/e2e tests.

### Local development

1) Install dependencies:
```
pnpm install
```

2) Start Postgres (option A: Docker Compose):
```
docker compose -f docker-compose.dev.yml up -d postgres
```

3) Run the backend in dev mode:
```
pnpm run start:dev
```

API will be available at `http://localhost:4444/api/v1`.

### Docker Compose (dev)

Use the bundled Postgres and app:
```
cp .env.example .env # or create .env manually
docker compose -f docker-compose.dev.yml up --build
```

This will start:
- `postgres` on `5432` with credentials from `.env` (defaults provided),
- `app` on `4444`, waiting until DB is ready.

### .env example

Create `.env` with safe defaults for onboarding:

```
PORT=4444
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=allure-test-runner
```

