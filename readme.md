# Claim Management

Monorepo with:

- `claim-management-backend`: Express + TypeScript + MongoDB
- `claim-management-frontend`: Angular + TypeScript

The app manages claims and nested damages, with workflow rules enforced in the backend and a small Angular UI for list and detail flows.

## Repository Layout

```text
claim-management/
├── AI_LOG.md
├── README.md
├── .githooks/
├── scripts/
├── claim-management-backend/
└── claim-management-frontend/
```

## Requirements

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
- npm

Recommended local version:

```bash
nvm use
```

The repository includes [.nvmrc](/Users/antoniogonzalez/Documents/repo/claim-management/.nvmrc:1) with `22.22.0`.

For normal backend startup, you also need a MongoDB connection through `MONGODB_URI` or `MONGO_URI`.

## Quick Start

Fastest path with seeded data:

```bash
bash scripts/start-dev-seeded.sh
```

Real MongoDB mode:

```bash
MONGODB_URI="mongodb://localhost:27017/claim-management" bash scripts/start-with-mongo.sh
```

Both scripts:

- enforce the supported Node.js version
- install dependencies automatically when `node_modules` is missing
- start backend and frontend together
- stop both processes when interrupted

If the frontend fails, the first manual check is:

```bash
cd claim-management-frontend
npm start
```

That runs Angular through the local project install, not a global CLI.

## Local URLs

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI spec: `http://localhost:3000/api/openapi.yaml`

## Manual Commands

Backend:

```bash
cd claim-management-backend
npm start
```

Seeded backend:

```bash
cd claim-management-backend
npm run dev:seed
```

Frontend:

```bash
cd claim-management-frontend
npm start
```

## Testing

Frontend:

```bash
cd claim-management-frontend
npm test
```

Backend unit tests:

```bash
cd claim-management-backend
npm test
```

Backend integration tests:

```bash
cd claim-management-backend
npm run test:integration
```

Full backend validation:

```bash
cd claim-management-backend
npm run test:all
```

Type checking:

```bash
cd claim-management-backend
npx tsc --noEmit

cd ../claim-management-frontend
npx tsc --noEmit
```

## Git Hooks

The repository includes a versioned pre-commit hook at [.githooks/pre-commit](/Users/antoniogonzalez/Documents/repo/claim-management/.githooks/pre-commit:1).

It runs:

- frontend `npm test`
- backend `npm run test:all`

If your clone is not using the versioned hooks path yet:

```bash
git config core.hooksPath .githooks
```

## Architecture Notes

- Backend uses router -> service -> repository separation.
- Business rules live in services.
- Frontend uses Angular signals for page state and Reactive Forms for form state.
- Runtime constants are used for domain values such as claim status and damage severity.

## AI Usage

See [AI_LOG.md](/Users/antoniogonzalez/Documents/repo/claim-management/AI_LOG.md:1) for:

- how AI assistance was used
- what was manually reviewed
- testing and coverage supervision
- hidden-specification cleanup decisions
