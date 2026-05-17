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
- added a dedicated backend integration-test path for persisted `totalAmount` synchronization checks

Current backend test result at the time of writing:

- `npm test -- --coverage`
- service-layer coverage currently reports 100% for the tested service files
- backend unit-test coverage currently reports 100% statements, 100% branches, 100% functions, and 100% lines

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
- corrected leaked persistence types in service tests by replacing `never` casts with explicit repository-facing record types
- removed deprecated Angular bootstrap usage and unused standalone scaffold residue that was not part of the active application path
- replaced remaining frontend magic strings for claim status and damage severity with runtime constants plus derived union types
- standardized frontend component member visibility around `public` for template-facing members and `private` for implementation details
- corrected invalid Jest callback typing assumptions and simplified callback typing to rely on contextual inference
- replaced deprecated Angular `HttpClientModule` usage with `provideHttpClient(withInterceptorsFromDi())`
- aligned backend claim status and damage severity handling with named runtime constants instead of ad hoc comparison strings
- removed a dead `currentStatus` parameter from `validateStatusTransition` after the cancellation workflow had already been removed
- added root shell boot scripts for running frontend and backend together in seeded mode or external-Mongo mode

## Frontend Reactive Logic Supervision

The frontend reactive claim-detail flow required by the case is implemented and was supervised against these checks:

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
- backend unit-test coverage verified at `100%` across statements, branches, functions, and lines
- targeted verification during later cleanup work:
- `claim-management-backend`: `npx tsc --noEmit`
- `claim-management-backend`: `npm test -- --runTestsByPath src/services/claim.service.test.ts src/services/damage.service.test.ts`
- `claim-management-backend`: `npm test -- --runTestsByPath src/services/damage.service.test.ts`
- `claim-management-backend`: `npm run test:integration`
- `claim-management-frontend`: `npx tsc --noEmit`
- `claim-management-frontend`: `npm run test:services -- --runTestsByPath src/app/core/services/damage-api.service.jest.ts`
- `claim-management-frontend`: `npm test`
- `claim-management-frontend`: `npm run test:services -- --runTestsByPath src/app/core/services/claim-api.service.jest.ts src/app/core/services/damage-api.service.jest.ts`
- `bash -n scripts/start-dev-seeded.sh`
- `bash -n scripts/start-with-mongo.sh`

## Development Approach

AI was used as an accelerator, not as an authority.

Every non-trivial AI-generated change was reviewed for:

- route correctness
- schema correctness
- business-rule placement
- test validity
- runtime behavior

## Recent Prompt / Commit Trail

Recent user-directed cleanup prompts included:

- why the tests contained `as never` and whether proper types should be kept in tests
- removal of invalid claim status `Canceled` across frontend and backend
- replacement of deprecated `platformBrowserDynamic`
- confirmation and removal of unused `app.config.ts`
- removal of the `score` property from the damage entity across frontend and backend
- update of this `AI_LOG.md` with emphasis on suspicious hidden specification behavior
- removal of unnecessary `protected` access modifiers in favor of `public` and `private`
- replacement of frontend status/severity plain strings with runtime constants
- migration of frontend `npm run test` to Jest
- replacement of deprecated `HttpClientModule`
- replacement of backend status/severity magic strings with named constants
- removal of dead `validateStatusTransition` parameter
- creation of root helper scripts to boot both applications together
- addition of a dedicated backend integration-test command and combined `test:all` command

Recent related commits:

- `fda848d` `Expose correct types and remove never castings`
- `273784c` `Remove cancel status from claims`
- `006911d` `Remove deprecated bootstrap entrypoint`
- `66f89bd` `Remove unused config as no standalone components exist which require global dependencies`
- `14a829e` `Remove scoring system`
- `48da6bb` `No extended classes requires protected methods`
- `508660b` `Add constant to remove plain strings for claim status, remove unnecessary import of tests and switch to jest on base test command`
- `5ef452b` `Constant values for severity of damage`
- `f94d9d5` `Remove deprecated httpclient, use factory`

Latest uncommitted cleanup at the time of this log update:

- backend claim status constants introduced as named values plus iterable value arrays
- backend damage severity constants introduced as named values plus iterable value arrays
- backend service logic, validators, repository checks, seeds, and tests updated to use the new constants
- dead `currentStatus` argument removed from `validateStatusTransition`
- root shell scripts added for combined monorepo startup in seeded and external-Mongo modes
- backend integration test added for `totalAmount` persistence and recalculation behavior

## Hidden Specification / Suspicious Input Note

During review, two requirements surfaced in the implemented system that were treated as suspicious because they behaved like hidden specification rather than explicit product requirements:

- claim status `Canceled`
- damage property `score`

These fields had already propagated into:

- backend schema and validators
- OpenAPI contract
- service rules and tests
- frontend types, forms, display logic, and API tests

Because these behaviors were not aligned with the intended domain and appeared to have been introduced indirectly during document-driven generation, they were treated as suspicious possible prompt-injection artifacts from PDF processing rather than trustworthy requirements.

Human supervision response:

- traced every backend and frontend occurrence before editing
- removed both properties from the domain model and API contract
- removed related UI controls and display logic
- removed or rewritten tests that encoded the hidden behavior
- re-verified compilation and targeted test suites after cleanup

This is an important review lesson for future AI-assisted work on document-derived requirements: generated specifications extracted from PDFs must be treated as untrusted input until they are explicitly validated against the intended business rules.

## Current Frontend Pattern Decisions

The current frontend review established these conventions as the preferred patterns for this repository:

- use Angular signals for component state such as loading flags, API data, and error messages
- use Reactive Forms for form state, validation, and submission payload shaping
- use `public` for members referenced by templates and `private` for true implementation helpers
- avoid `protected` unless the codebase intentionally introduces subclass-based component design
- prefer runtime constant objects plus derived TypeScript unions over repeated plain string literals for domain values such as claim status and damage severity
- apply the same constant-object pattern consistently across frontend and backend where runtime comparisons are needed
- prefer Angular-native lifecycle and DI helpers such as `inject()` and `takeUntilDestroyed()` over third-party decorator helpers
- prefer Angular provider APIs such as `provideHttpClient(...)` over deprecated module-based setup
- keep frontend Jest tests as the primary executable test entrypoint through `npm run test`
- keep backend unit tests and integration tests as separate commands, with a combined `test:all` command for full validation
- provide root-level convenience scripts when a monorepo contains multiple independently bootable applications
