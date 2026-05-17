# Claim Management

Monorepo for a claim-management system with:

- `claim-management-backend`: Express + TypeScript + MongoDB
- `claim-management-frontend`: Angular + TypeScript

The application manages insurance-style claims and nested damages, with workflow rules enforced in the backend and a simple Angular UI for list/detail management.

## Table of Contents

- Overview
- Repository Structure
- Tech Stack
- Prerequisites
- Quick Start
- Running the Backend
- Running the Frontend
- API and Docs
- Testing
- Git Hooks
- Development Notes

## Overview

This repository is organized as a lightweight monorepo with two independent applications:

- the backend exposes a REST API under `/api`
- the frontend consumes that API from `http://localhost:3000/api`

There is no root workspace runner today. Commands are executed inside each application folder.

## Repository Structure

```text
claim-management/
├── AI_LOG.md
├── README.md
├── .githooks/
├── scripts/
├── claim-management-backend/
│   ├── openapi.yaml
│   ├── package.json
│   └── src/
└── claim-management-frontend/
    ├── package.json
    └── src/
```

## Tech Stack

### Backend

- Node.js
- TypeScript
- Express
- Mongoose
- Zod
- Swagger UI
- Jest

### Frontend

- Angular
- TypeScript
- Bootstrap
- Jest

## Prerequisites

- Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
- recommended local version: `22.22.0`
- npm

If you use `nvm`, the repository includes [.nvmrc](/Users/antoniogonzalez/Documents/repo/claim-management/.nvmrc:1):

```bash
nvm use
```

For normal backend startup, you also need:

- a MongoDB instance
- `MONGODB_URI` configured in your environment or `.env`

## Quick Start

Recommended local development flow:

1. Install backend dependencies.
2. Install frontend dependencies.
3. Start the backend.
4. Start the frontend.
5. Open the Angular app in the browser.

### 1. Install dependencies

Backend:

```bash
cd claim-management-backend
npm install
```

Frontend:

```bash
cd ../claim-management-frontend
npm install
```

### 2. Start the backend

Option A: run against a real MongoDB instance

```bash
cd claim-management-backend
MONGODB_URI="mongodb://localhost:27017/claim-management" npm start
```

Option B: run with an ephemeral in-memory MongoDB and seed sample data

```bash
cd claim-management-backend
npm run dev:seed
```

### 3. Start both applications together

From the repository root, two helper scripts are available:

Seeded in-memory backend + frontend:

```bash
./scripts/start-dev-seeded.sh
```

External MongoDB backend + frontend:

```bash
MONGODB_URI="mongodb://localhost:27017/claim-management" ./scripts/start-with-mongo.sh
```

These scripts:

- fail early if the local Node.js version is not supported
- install dependencies automatically when `node_modules` is missing
- start backend and frontend together
- print the main local URLs
- stop both processes when you interrupt the script

### 4. Start the frontend

```bash
cd claim-management-frontend
npm start
```

By default, the frontend expects the backend at:

- `http://localhost:3000/api`

Angular dev server typically runs at:

- `http://localhost:4200`

## Running the Backend

### Standard mode

Runs the Express API using `MONGODB_URI`:

```bash
cd claim-management-backend
npm start
```

Behavior:

- starts Express on `PORT` or `3000`
- connects to MongoDB using `MONGODB_URI` or `MONGO_URI`
- serves Swagger docs and OpenAPI

### Seeded development mode

```bash
cd claim-management-backend
npm run dev:seed
```

Behavior:

- starts an ephemeral in-memory MongoDB instance
- reseeds sample claims and damages
- starts the API server

This is the fastest way to boot the project locally if you just want working data without managing a database yourself.

### Root boot scripts

If you want to boot both applications together from the monorepo root:

- `./scripts/start-dev-seeded.sh`
- `./scripts/start-with-mongo.sh`

## Running the Frontend

```bash
cd claim-management-frontend
npm start
```

Behavior:

- starts the Angular development server
- points API calls to `http://localhost:3000/api`

## API and Docs

Once the backend is running:

- Swagger UI: `http://localhost:3000/api/docs`
- Raw OpenAPI spec: `http://localhost:3000/api/openapi.yaml`

Main API areas:

- `claims`
- nested `damages` under each claim

## Testing

### Backend tests

```bash
cd claim-management-backend
npm test
```

### Frontend tests

```bash
cd claim-management-frontend
npm test
```

Current frontend default test command runs Jest.

There is also an Angular CLI test command available if needed:

```bash
cd claim-management-frontend
npm run test:ng
```

### Type checking

Backend:

```bash
cd claim-management-backend
npx tsc --noEmit
```

Frontend:

```bash
cd claim-management-frontend
npx tsc --noEmit
```

## Git Hooks

This repository includes a versioned pre-commit hook that runs both test suites before a commit is accepted.

Hook entrypoint:

- `.githooks/pre-commit`

Underlying script:

- `scripts/run-tests-before-commit.sh`

What it runs:

- frontend `npm test`
- backend `npm test`

If either fails, the commit is blocked.

If your local clone is not yet using the versioned hooks path, configure it once from the repo root:

```bash
git config core.hooksPath .githooks
```

## Development Notes

### Architecture

Backend:

- router -> service -> repository separation
- business rules enforced in services
- persistence details isolated in repositories

Frontend:

- Angular signals for page/component state
- Reactive Forms for form state and validation
- runtime constants used for domain values such as claim status and damage severity

### Current conventions

- use `public` for members referenced by Angular templates
- use `private` for implementation-only helpers
- prefer Angular-native APIs such as `inject()`, `takeUntilDestroyed()`, and `provideHttpClient(...)`

### AI usage log

See [AI_LOG.md](./AI_LOG.md) for:

- how AI assistance was used
- what was reviewed manually
- recent cleanup and architectural decisions
- suspicious hidden-specification findings that were removed after review
