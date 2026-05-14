# AI Log

## Purpose

This file documents how AI assistance was used during development, what parts were generated or accelerated by AI, and how the output was reviewed and corrected.

## AI Tools Used

- Codex / GPT-based coding assistant in the local repository workspace

## How AI Was Used

### 1. Backend API and persistence

AI was used to accelerate:

- scaffolding CRUD routes for `claims` and nested `damages`
- connecting the backend to MongoDB
- adding an ephemeral seeded MongoDB development flow
- creating the OpenAPI specification and Swagger docs endpoint
- refactoring the backend toward manual dependency injection

Human supervision applied:

- reviewed route nesting to ensure `damages` are always dependent on `claimId`
- verified that `claimId` is not accepted in damage request bodies and is derived from the route
- checked that `totalAmount` is recalculated from persisted damages instead of trusting client input
- validated that startup modes remained separated between external Mongo and ephemeral dev Mongo

### 2. Design and architecture

AI was used to propose and implement:

- router factories
- repository and service separation
- dependency composition through a single application assembly point

Human supervision applied:

- confirmed that business logic moved out of Express route handlers
- confirmed that route behavior stayed stable after the DI refactor
- reviewed the dependency boundaries to keep persistence concerns out of the routers

### 3. Testing

AI was used to generate:

- Jest setup
- service unit tests for `claimService` and `damageService`
- mock-based tests around deletion cascades and `totalAmount` synchronization

Human supervision applied:

- corrected the test runner configuration
- fixed TypeScript/Jest typing issues
- reran the suite until it passed cleanly
- verified coverage output instead of trusting generated tests blindly

Current backend test result at the time of writing:

- `npm test -- --coverage`
- service-layer coverage currently reports 100% for the tested service files

### 4. OpenAPI / SDD usage

AI was used to draft the OpenAPI YAML from the implemented backend routes.

Human supervision applied:

- aligned the spec to the actual API behavior
- corrected the partial-update claim contract so the runtime matched the documented schema
- verified the raw spec and Swagger UI endpoints at runtime

## Corrections Made to AI Output

- corrected claim update validation so `PATCH /claims/:id` behaves as a true partial update
- corrected OpenAPI/runtime mismatch around claim update behavior
- corrected test setup issues for Jest + TypeScript
- corrected path resolution for loading the OpenAPI YAML in the backend
- corrected startup verification and cleanup flow when running the seeded backend locally

## Frontend Reactive Logic Supervision

The frontend reactive claim-detail flow required by the case is not implemented yet.

When implemented, AI-generated frontend code must be supervised against these checks:

- damage add/edit/delete must update the displayed total immediately without reload
- reactive forms must enforce required damage fields before submit
- the claim detail screen must keep totals derived from the current damage state, not manual user input
- UI restrictions must mirror backend rules, especially damage editing only while the claim is `Pending`

## Verification Performed

- `npx tsc --noEmit` on the backend after refactors
- runtime verification of the seeded dev backend startup
- runtime verification of `/api/openapi.yaml` and `/api/docs`
- `npm test`
- `npm test -- --coverage`

## Development Approach

AI was used as an accelerator, not as an authority.

Every non-trivial AI-generated change was reviewed for:

- route correctness
- schema correctness
- business-rule placement
- test validity
- runtime behavior
