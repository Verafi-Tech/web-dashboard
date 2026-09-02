# Verafi Web — Roadmap to Production

**Status**: Living document. Update the checkboxes and notes as work lands — this file is the source of truth for "where are we" across sessions, chats, and developers.

**Last updated**: 2026-08-29 (Phase 5 done; Settings restructured into User Settings + admin-gated Storage; Uploads now tied to projects, with uploader shown, via a new Uploads tab on Project detail)

**Supersedes**: `SUPERADMIN_DASHBOARD_PLAN.md` and `SUPERADMIN_API_RESPONSES.md` (kept in the repo for history, but both are stale — the plan predates the pivot below, and the API doc has already been caught being wrong once, see [Gotcha #3](#3-dont-trust-static-api-docs-over-the-live-schema)). For API shapes, **always check the live schema**, not a markdown file:

```
http://127.0.0.1:8000/openapi.json    (raw schema — path changed from /api/v1/openapi.json at some point before 2026-08-29; verify it's still current, this backend is actively evolving)
http://127.0.0.1:8000/docs            (Swagger UI)
```

---

## Table of contents

1. [The pivot: what changed](#1-the-pivot-what-changed)
2. [Where we are right now](#2-where-we-are-right-now)
3. [Architecture as it stands](#3-architecture-as-it-stands)
4. [Environment gotchas](#4-environment-gotchas-read-before-you-debug-for-an-hour)
5. [Domain glossary](#5-domain-glossary-vm0050--cookstove-mrv)
6. [Full backend API surface](#6-full-backend-api-surface)
7. [Role & permission model](#7-role--permission-model)
8. [Phase-by-phase roadmap](#8-phase-by-phase-roadmap)
9. [Conventions](#9-conventions-follow-these-so-the-codebase-stays-one-voice)
10. [If you're picking this up cold](#10-if-youre-picking-this-up-cold)

---

## 1. The pivot: what changed

The project started as a **super-admin-only** dashboard (methodologies, organisations, users — see the old `SUPERADMIN_DASHBOARD_PLAN.md`). The decision now is to open it up so **every Verafi user role** (`admin`, `field_agent`, `viewer`) can use the parts of the product relevant to them, not just admins.

**This does not mean starting over.** The auth/session layer was already built role-aware — [`auth.ts`](auth.ts) and [`types/next-auth.d.ts`](types/next-auth.d.ts) model role **per organisation membership**, not globally, and the session already carries every org a user belongs to plus their role in each.

Phases 1–5 are done: role-based access (three admin-only gates loosened, not the one originally spotted), Projects (full CRUD + membership), Uploads (presigned-URL flow + a Storage view), Households, and Surveys (both enrol/record/edit/delete, admin or field_agent). See each phase's writeup in [§8](#8-phase-by-phase-roadmap) for what actually shipped vs. what was originally scoped — several turned up extra gates or design decisions along the way.

What's still genuinely new: the backend (see [§6](#6-full-backend-api-surface)) exposes a bigger domain than the frontend still doesn't touch — Calculations (VM0050 carbon-credit math), Reports (generate/approve/PDF), and offline Sync. None of that has a UI yet.

---

## 2. Where we are right now

### Built and working

| Area | Status | Key files |
|---|---|---|
| Auth (login, JWT refresh, multi-org, org switcher) | ✅ Done | `auth.ts`, `proxy.ts`, `components/auth/*` |
| Role-based access (any role reaches the app; features gated per-permission) | ✅ Done (Phase 1, 2026-08-28) | `lib/auth/route-guard.ts`, `lib/auth/permissions.ts` |
| Dashboard shell (sidebar, header, breadcrumbs) | ✅ Done, nav is role-aware | `components/layout/*` |
| Methodologies (list open to all; survey-template editor admin-only) | ✅ Done | `app/dashboard/methodologies/*`, `components/methodologies/*` |
| Organisations (list, create, detail w/ Overview + Members + Projects tabs open to all members; Settings/Invite admin-only; `country` + server-generated `code` since 2026-08-31) | ✅ Done | `app/dashboard/organisations/*`, `components/organisations/*` |
| Projects (list, create, detail w/ Overview + Members + Households + Uploads + Calculations + Reports + Settings; report-facing fields `description`/`location_description`/`scale_category`/`crediting_period_start`/`crediting_period_end` since 2026-08-31) | ✅ Done (Phase 2, 2026-08-29) | `app/dashboard/projects/*`, `components/projects/*` |
| Households (enrol/edit/delete — admin or field_agent; nested detail route under a project; Overview/Surveys tabs; `community` field + server-generated `household_code` since 2026-08-31) | ✅ Done (Phase 4, 2026-08-29) | `components/households/*`, `app/dashboard/projects/[id]/households/[householdId]` |
| Surveys (record/edit/delete — admin or field_agent; one shared create+edit dialog) | ✅ Done (Phase 5, 2026-08-29) | `components/surveys/*` |
| Uploads (presigned-URL flow; tied to projects + shows uploader; project-scoped tab on Project detail, plus an org-wide admin Storage view under Settings) | ✅ Done (Phase 3 + 2026-08-29 follow-up) | `lib/api/uploads.ts`, `components/common/FileUpload.tsx`, `components/uploads/UploadsList.tsx` |
| Calculations (VM0050 emissions-reduction form — admin-only run, viewable by all; household composition prefills from enrolled households; full result breakdown + parameter audit trail) | ✅ Done (Phase 6, 2026-08-30) | `components/calculations/*`, `lib/api/calculations.ts`, `app/dashboard/projects/[id]/calculations/[calculationId]` |
| Reports (generate for a period — admin-only, viewable by all; HTML preview + PDF download; VVB approve/reject with approval-log history) | ✅ Done (Phase 7, 2026-09-01) | `components/reports/*`, `lib/api/reports.ts`, `app/dashboard/projects/[id]/reports/[reportId]` |
| Audit Logs (filterable + server-paginated; expandable rows for changes/before/after snapshots — admin-only) | ✅ Done (Phase 9, 2026-09-01) | `components/audit/*`, `lib/api/audit.ts`, `app/dashboard/audit/page.tsx` |
| Settings (User Settings — every role; Storage + Data retention — admin-only, the latter write-only by backend limitation) | ✅ Done (Phase 10, 2026-09-01) | `app/dashboard/settings/*`, `components/settings/*` |
| Users (list, invite w/ temp password, profile — admin-only section) | ✅ Done | `app/dashboard/users/*`, `components/users/*` |
| Dashboard stats (active projects, org count, user count admin-only) | ✅ Done | `components/dashboard/DashboardStats.tsx` |
| Test infra (Jest + RTL) | ✅ 42 suites / 176 tests green | see [Gotcha #1](#1-jest-fails-with-module-jestsetupts-was-not-found) |

### 2026-08-31: new backend fields incorporated

The backend shipped a batch of new optional fields across three domains, verified directly against the live schema and live create/update calls before wiring up:
- **Organisation**: `country` (editable, Create + Edit forms) and `code` (read-only, server-generated tenant code — displayed in Overview with a note that field agents use it to find the org at login).
- **Project**: `description`, `location_description`, `scale_category`, `crediting_period_start`, `crediting_period_end` — all optional, all editable in Create + Edit, all shown in the Overview tab. `location_description` takes priority over the state/country fallback when rendering the Location card.
- **Household**: `community` (optional, editable in Create + Edit, shown in Overview and the Households table) and a behavior change — **`household_code` is now server-generated** (`HH-XXXXXX`), so the "Household code" field was removed from `CreateHouseholdDialog` entirely rather than kept as a client-supplied value. `HouseholdInput.household_code` stays in the type as optional (the backend still accepts one to preserve a legacy paper-register id) but nothing in the UI sets it.

### Stubbed (empty-state placeholder only, no API wiring)

None currently — the last remaining stub (Audit Logs) was replaced in Phase 9.

### Out of scope for this app

Offline Sync ([Phase 8](#8-phase-by-phase-roadmap)) — resolved 2026-09-01: handled by a separate mobile app client, not this web app. (`POST /projects/bulk-generate/reports` is also unbuilt — see the Phase 7 writeup for why it was skipped.)

### Known bugs fixed this pass

- `lib/api/projects.ts` assumed `GET /projects` returns a bare array (per the stale static doc). The live schema confirms it's paginated (`PagedResponse<ProjectResponse>`), same pattern as `/users`. Fixed 2026-08-27 — see [Gotcha #3](#3-dont-trust-static-api-docs-over-the-live-schema).
- The Organisations Members tab called the admin-only `GET /users` (header-scoped) instead of the members-only `GET /organisations/{id}/members` — invisible while the whole app was admin-only, but would have 403'd for every non-admin the moment Phase 1 let them reach it. Fixed 2026-08-28 alongside Phase 1.
- **Photo upload failed at the direct-to-storage PUT step** with a network-level error (backend's `/uploads/presigned-url` returned 200 fine; the browser's direct PUT to the returned `presigned_url` against MinIO/S3 didn't). Root cause was backend/infra-side (CORS or an unreachable Docker-internal hostname — not distinguished, wasn't needed once fixed), not a frontend bug. Fixed backend-side by the user 2026-08-29; confirmed working. The frontend's diagnostic improvements from investigating this stay in place regardless: `hooks/useUpload.ts`'s `useUploadFile` rethrows each of its four steps with a distinct label, and `getErrorMessage` (`lib/utils/errors.ts`) surfaces a plain `Error`'s own `.message` plus FastAPI's default `{detail: ...}` shape and network-level (no-response) axios errors.
- **`components/ui/tabs.tsx`'s active-tab styling never actually applied.** It targeted `data-[selected]:*`, but Base UI's `Tabs.Tab` (checked directly in `node_modules/@base-ui/react/tabs/tab/TabsTabDataAttributes.js`) never sets `data-selected` — it sets `data-active` internally and the standard `aria-selected` attribute. Fixed 2026-08-31 by switching to Tailwind's built-in `aria-selected:*` variant instead of a Base UI internal data attribute, so this doesn't silently break again on a future Base UI version bump. The active tab is now bold (`aria-selected:font-bold`) as well as bordered/colored — all three were broken, not just the new bold styling.
- **Two calculations-list bugs found post-ship** (2026-08-30, while investigating "calculations aren't showing up" for a real household): `GET /projects/{id}/calculations` actually returns `{calculations: [...], total_count, limit, offset}` (guessed `{data}`/`{items}` initially, never matched), and each row is a flat `CalculationSummary`, not the nested `CalculationResponse` the create/detail endpoints return. Both fixed — see the Phase 6 writeup below for full detail. Also added a `superRefine` catching the backend's undocumented "survey-based monitoring requires `customer_support_level`" rule (CC Clarification 2) with a clear inline error instead of a raw 422.
- **Calculation result numbers overflowed their cards** — the backend returns full-precision decimal strings (e.g. `1.3831091039999999`). Fixed 2026-08-31 with `lib/utils/format.ts#formatDecimal`, a display-only rounding helper (never touches the value sent to/from the API); every rounded value keeps the exact original in a `title` tooltip.
- **Breadcrumb linked to two URLs that 404** — `.../projects/{id}/households` and `.../projects/{id}/calculations` are tabs inside the project page, not standalone routes, but the breadcrumb linked their intermediate segments anyway. Fixed 2026-08-31: `Breadcrumb.tsx` now keeps a `NON_NAVIGABLE_SEGMENTS` set (currently `households`, `calculations`) and renders those as plain text instead of a `Link`.

### Known issues — open

None currently. (Photo upload's storage-PUT failure — see "Known bugs fixed" below — was the only open one and is resolved.)

---

## 3. Architecture as it stands

**Stack**: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 + shadcn/ui · TanStack Query v5 · TanStack Table v8 · React Hook Form + Zod · NextAuth v5 (JWT strategy) · Axios · Jest + React Testing Library.

**⚠️ This is not the Next.js you know.** Per `AGENTS.md`: Next.js 16 has breaking changes from earlier versions. Check `node_modules/next/dist/docs/` before assuming an API from training data still works (this is how the Jest config docs were verified during the [test-infra fix](#1-jest-fails-with-module-jestsetupts-was-not-found)).

**Layered structure** (each new feature should follow this shape):

```
lib/types/<domain>.ts        → TypeScript types matching the backend response/request shapes
lib/api/<domain>.ts          → thin axios wrapper functions, one per endpoint
hooks/use<Domain>.ts         → TanStack Query hooks wrapping the api/ functions
components/<domain>/*.tsx    → presentational + "use client" interactive components
app/dashboard/<domain>/      → route files that compose the above
```

**API client** (`lib/api/client.ts`): a single axios instance with:
- Request interceptor: attaches `Authorization: Bearer <token>` and a default `X-Organisation-ID` header from the active session org (per-call overrides are supported by passing `headers` — used whenever you're acting on an org that *isn't* the user's currently-active one, e.g. viewing another org's detail page).
- Response interceptor: signs the user out on `401`.

**Error handling**: `lib/utils/errors.ts#getErrorMessage(error)` — always route caught errors through this before showing them to a user; it already knows how to unwrap the backend's `{error: {code, message, request_id}}` shape and gives sensible copy for 401/403/404.

**Session shape** (`types/next-auth.d.ts`): `session.organisations` is the full list of org memberships (`{id, name, role}`), `session.activeOrganisationId` / `activeOrganisationRole` is whichever one is currently selected (see `select-organisation` page and `OrganisationPicker.tsx`). Role is **always evaluated per-organisation** — a user can be `admin` in one org and `field_agent` in another.

---

## 4. Environment gotchas (read before you debug for an hour)

These cost real time to diagnose once already — don't re-derive them.

### 1. Jest fails with "Module `<rootDir>/jest.setup.ts` was not found"

Not a config problem. On Windows, `jest-resolve`'s native binding (`@unrs/resolver-binding-win32-x64-msvc`) fails to `LoadLibrary` with error 126 ("specified module could not be found") because the machine is missing **`vcruntime140_1.dll`** — part of the Microsoft Visual C++ 2015–2022 Redistributable (x64), which is a *different, newer* file than the more commonly-present `vcruntime140.dll`.

**Fix** (needs local admin):
```powershell
Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile "$env:TEMP\vc_redist.x64.exe"
Start-Process "$env:TEMP\vc_redist.x64.exe" -ArgumentList "/install","/passive","/norestart" -Verb RunAs -Wait
```
`winget install --id Microsoft.VCRedist.2015+.x64` can silently no-op if an older redistributable is already registered — the direct installer forces a real repair. Verify with:
```powershell
Test-Path "C:\Windows\System32\vcruntime140_1.dll"   # should be True
```

### 2. `npm run dev` / `npm test` fails with "running scripts is disabled on this system"

Windows PowerShell's default execution policy (`Restricted`) blocks `npm.ps1`. Fix, no admin needed:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 3. Don't trust static API docs over the live schema

`SUPERADMIN_API_RESPONSES.md` said `GET /users` returns a bare array; the real backend paginates it (`{data, meta}}`) — discovered empirically and left as a comment in `lib/api/users.ts`. The same doc implied `GET /projects` was a bare array too; the live OpenAPI schema (pulled 2026-08-27) confirms it's paginated as well, and `lib/api/projects.ts` was fixed to match. **Treat every endpoint shape as unverified until you've either called it against a running backend or checked `/api/v1/openapi.json` directly** — don't propagate the next assumption from a markdown file.

### 4. `npm install-scripts` gate

If a fresh `npm install` leaves native bindings broken again, check:
```
npm install-scripts ls
```
npm's install-scripts allowlist (npm 11+) can silently skip a package's `postinstall` (this is what caused the Jest binding to never regenerate correctly the first time). Approve with `npm install-scripts approve <pkg>`, then `npm rebuild <pkg>`.

---

## 5. Domain glossary (VM0050 = cookstove MRV)

Verafi runs **MRV** (Monitoring, Reporting, Verification) for carbon-credit **cookstove** projects under the **VM0050** Verra methodology. If you're not from a carbon-markets background, here's the entity chain, narrowest to broadest:

- **Methodology** — a Verra-published calculation standard (e.g. `VM0050` for improved cookstoves). Read-only reference data; admins can attach a **Survey Template** (a JSON schema of fields) to one.
- **Project** — an org's deployment of a methodology in a specific place (e.g. "Cookstove Adoption — Lagos"). Has a status (`active`/`completed`/`archived`), a start date, and optionally a `verra_project_id` once registered with Verra.
- **Household** — one enrolled beneficiary household within a project. Captures baseline info: old stove type, fuel type, family composition (used for "adult equivalent" calculations), and the new stove they received.
- **Survey** — a monitoring visit record for a household, done some time after enrollment: is the new stove still in use, in good condition, what fuel/meals are on which stove, firewood consumption. Multiple surveys accumulate per household over the project lifetime. **Surveys are the thing field agents primarily produce**, often while offline in the field.
- **Calculation** — running the VM0050 math (baseline emissions − project emissions − leakage = net emission reductions, in tCO2e) for a project/year, using household composition + baseline/project device data + monitoring survey aggregates as inputs. Produces a full audit trail of every parameter used.
- **Report** — a formal monitoring report for a project over a period (e.g. H1 2026), built from a Calculation's numbers, that goes through a VVB (Verification & Validation Body) **approval workflow** (`DRAFT → VERIFIED/REJECTED`) and can be rendered as HTML or downloaded as PDF. This is the artifact that ultimately gets sold as a verified carbon credit.
- **Sync** — because field agents often work without connectivity, the backend supports an offline-first flow: collect households/surveys locally, then bulk push to the server, with server-side conflict detection/resolution.

**Practical implication for the frontend**: the natural navigation for a `field_agent` is *Project → Households → Surveys*, not the current admin IA of *flat top-level sections*. Keep this in mind designing Phase 1's role-aware nav.

---

## 6. Full backend API surface

Pulled from the live OpenAPI schema at `http://127.0.0.1:8000/api/v1/openapi.json` on 2026-08-27. "FE status" = whether the Next.js app currently calls this endpoint anywhere.

### Auth (`/api/v1/auth`) — ✅ fully wired

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | Returns `{access_token, refresh_token, expires_in, user, organisations}` — `organisations` is `UserOrganisationInfo[]` (`{id, name, role}`), already consumed by `auth.ts`. |
| POST | `/auth/refresh` | Wired via `auth.ts#refreshAccessToken`. |
| POST | `/auth/logout` | Wired via `SignOutButton.tsx`. |
| GET | `/auth/verify` | Not currently called by the frontend (session comes from the JWT cookie instead) — fine to leave unless a "verify session is still valid" ping is needed later. |
| POST | `/auth/request-password-reset` | ✅ `lib/api/auth.ts#requestPasswordReset`, triggered from Settings → My profile (2026-08-29). |
| POST | `/auth/reset-password` | **Still not wired** — there's no page that takes a reset token + new password and calls this. The request-side only sends the email; completing the flow (the link a user would click) is unbuilt. |

### Organisations (`/api/v1/organisations`) — ✅ mostly wired

| Method | Path | Restriction | FE status |
|---|---|---|---|
| POST | `/organisations/` | authenticated users (creator becomes admin) | ✅ `CreateOrganisationDialog.tsx` |
| GET | `/organisations/` | public | not used directly (org list comes from session) |
| GET | `/organisations/me` | — | not used |
| GET | `/organisations/{id}` | members only | ✅ `useOrganisation` |
| PATCH | `/organisations/{id}` | admin only | ✅ `EditOrganisationForm.tsx` |
| DELETE | `/organisations/{id}` | admin only | ❌ no delete UI |
| GET | `/organisations/{id}/members` | members only | ✅ `useOrganisationMembers` (fixed 2026-08-28 — previously called the admin-only `GET /users` instead, which 403'd for non-admins viewing their own org) |
| DELETE | `/organisations/{id}/members/{user_id}` | admin only | ❌ no "remove member" UI yet |
| POST | `/organisations/{id}/invite` | admin only | ✅ `UserInviteDialog.tsx` |

### Users (`/api/v1/users`) — ✅ mostly wired

| Method | Path | Restriction | FE status |
|---|---|---|---|
| POST | `/users/` | public (signup) | ❌ no self-signup page — login is the only entry point today |
| GET | `/users/` | admin only, paginated | ✅ `useUsers` (org-member listing now goes through `useOrganisationMembers`, see Organisations section above) |
| GET | `/users/me/organisations` | — | not used (session already carries this) |
| GET | `/users/{id}` | self or admin in same org | ✅ `UserProfileClient.tsx` |
| PATCH | `/users/{id}` | self or admin in same org | ✅ |
| DELETE | `/users/{id}` | admin only | ❌ no delete UI |
| POST | `/users/{id}/suspend` | admin only | ❌ no suspend UI (plan doc mentioned this; never built) |

### Methodologies (`/api/v1/methodologies`) — ✅ wired

Public read endpoints + admin-only survey-template CRUD, all built. `POST /methodologies/survey-templates/{id}/validate` (validate a response against a template schema) is **not wired** — would be useful when building the actual survey data-entry form in Phase 5.

### Projects (`/api/v1/projects`) — ✅ wired (Phase 2)

| Method | Path | Restriction | FE status |
|---|---|---|---|
| POST | `/projects/` | admin only | ✅ `CreateProjectDialog.tsx` |
| GET | `/projects/` | org members, **paginated** | ✅ `useProjects` |
| GET | `/projects/{id}` | org members | ✅ `useProject` |
| PATCH | `/projects/{id}` | admin only | ✅ `EditProjectForm.tsx` |
| DELETE | `/projects/{id}` | admin only | ✅ `EditProjectForm.tsx` |
| GET/POST/DELETE | `/projects/{id}/members` | admin only (write), org members (read) | ✅ `useProjectMembers`/`useAssignProjectMember`/`useRemoveProjectMember` |
| POST | `/projects/bulk-generate/reports` | — | ❌ skipped — see the Reports row below, its own schema doesn't match live behavior |

Households/Calculations/Reports sub-resources of a project are still separate, not-yet-built domains — see their own rows below.

### Households (`/api/v1/households`, nested under `/projects/{id}/households`) — ✅ wired (Phase 4)

No explicit role restriction was documented on these endpoints (unlike Projects/Organisations/Users) — resolved with the user 2026-08-29: enrol/edit/delete is `admin` or `field_agent` (`canManageHouseholds`), not project-membership-based. All five endpoints (`POST/GET /projects/{id}/households`, `GET/PATCH/DELETE /households/{id}`) are wired via `lib/api/households.ts`.

### Surveys (`/api/v1/surveys`, nested under `/households/{id}/surveys`) — ✅ wired (Phase 5)

Confirmed with the user 2026-08-29: same rule as Households, `canManageHouseholds` reused directly (admin or field_agent), no separate permission function. `POST/GET /households/{id}/surveys` and `GET/PATCH/DELETE /surveys/{id}` all wired via `lib/api/surveys.ts`. **Not yet wired**: `POST /surveys/sync/surveys` (bulk upload of offline-collected surveys) — that one specifically belongs to [Phase 8 (Sync)](#phase-8--offline-sync), not this online CRUD phase.

### Calculations (`/api/v1/calculations`, run via `/projects/{id}/calculations`) — ✅ wired (Phase 6)

`POST /projects/{id}/calculations` takes a large structured payload (household composition, baseline/project device configs, monitoring data — `VM0050CalculationRequest`) and returns a full breakdown with a parameter audit trail (`VM0050CalculationResult`). No role restriction was documented — resolved with the user 2026-08-30: admin-only to run (feeds VVB-facing numbers directly), any org member can view (`canManageCalculations`). Design finding from the pre-build research pass: of the whole payload, only `household_composition` has a clean auto-derivation path — it's pre-filled (editable) by summing composition fields across the project's enrolled households; `baseline_devices`/`baseline_consumption`/`project_devices`/`monitoring_data` are methodology/device-catalog data with no existing source elsewhere in the app, so those stay fully manual repeatable-row sections. All four calculation endpoints wired via `lib/api/calculations.ts`; the list endpoint's response schema was undocumented (`additionalProperties: true`) so `listCalculations` normalizes bare-array/`{data}`/`{items}` shapes defensively. The separate `GET /calculations/{id}/audit-trail` endpoint was skipped as redundant — `parameter_audit_trail` already comes embedded in every `CalculationResponse`.

### Reports (`/api/v1/reports`, `/projects/{id}/reports`) — ✅ wired (Phase 7)

Generate → list → view (HTML/PDF) → approve (VVB) workflow. No role restriction was documented on generate or approve — resolved with the user 2026-09-01: both are admin-only (`canManageReports`), same class of action as Calculations (VVB-facing compliance artifact); everyone can still view. Report generation is independent of Phase 6 Calculations — it computes `usage_rate`/`tco2e_reduced` itself from Household/Survey data for a given `period_start`/`period_end`, not by referencing a Calculation record.

Three endpoints were undocumented (`additionalProperties: true`) and confirmed directly against the live backend rather than guessed:
- `GET /projects/{id}/reports` → `{items: [...], total, skip, limit}` — a third distinct pagination shape in this app, alongside `{data, meta}` (most list endpoints) and `{calculations, total_count, limit, offset}` (Calculations). Each item is a full `ReportResponse`, unlike Calculations' flatter list-row shape — no repeat of that trap.
- `GET /reports/{id}/html` → `{status: "success", html: "<!DOCTYPE html>..."}` — a complete standalone document, rendered via `<iframe srcDoc={html} sandbox="">` in `ReportDetailClient.tsx` (fully sandboxed since the content isn't guaranteed script-free).
- `GET /reports/{id}/pdf` → raw `application/pdf` bytes with `Content-Disposition: attachment` (the doc's empty `{}` schema was misleading) — fetched with `responseType: "blob"` and turned into a browser download via a temporary `<a download>` click, `downloadReportPdf` in `lib/api/reports.ts`.

`POST /projects/bulk-generate/reports` was **skipped** — its own schema (bare array body) doesn't match what the live backend actually accepts (a real call returns a validation error asking for "a valid dictionary or object"), so it's broken on its own terms independent of anything on the frontend. Revisit if the backend fixes it and it's actually wanted.

`POST /reports/{id}/approve` returned a 500 on every attempt during initial testing (2026-09-01, request_ids `fc8a5d4c...`/`ce55edbe...`) — same class of transient backend issue as the Calculations 500 from Phase 6. Retested later the same session and it worked correctly (`ApproveReportDialog.tsx` built and verified against the real endpoint, including the `approval_logs` history it returns) — not a frontend bug, no code changed to "fix" it.

`lib/api/reports.ts`/`hooks/useReport.ts`/`components/reports/*` follow the same shape as Calculations' equivalents. `ReportGenerationRequest`'s conditional-required rule (`customer_support_level` required when `usage_rate_method === "SURVEYS"`) was caught up front via a `superRefine` on `GenerateReportDialog`'s schema — this exact bug already happened once on Calculations (there, undocumented; here, actually documented in the schema description), so it didn't need to be discovered live this time.

### Uploads (`/api/v1/uploads`) — ✅ wired (Phase 3)

Presigned-URL flow: `POST /uploads/presigned-url` → direct-to-storage PUT (bypassing `apiClient` — see Phase 3 writeup) → `POST /uploads/{id}/confirm` with a SHA-256 hash → file usable. Rate-limited to 10 presigned-URL requests/hour/user (surfaced via the backend's own error message, no special-casing needed). `lib/api/uploads.ts`/`hooks/useUpload.ts`/`components/common/FileUpload.tsx` are the shared infra Households (Phase 4) and Surveys (Phase 5) consume for their photo fields.

**2026-08-29 backend update**: `UploadResponse` gained `project_id` and an embedded `uploaded_by` (`{id, full_name, email}`); `PresignedUrlRequest` gained `project_id`; `GET /uploads` gained a `project_id` filter. All wired the same day — see the Phase 3 writeup's follow-up note for what changed on the frontend.

### Sync (`/api/v1/sync`, `/api/v1/surveys/sync/surveys`) — ❌ out of scope for this app

Offline push/pull/conflict-resolution, consumed by a separate mobile app client — resolved with the user 2026-09-01 that this web app doesn't build against these endpoints at all. See [Phase 8](#phase-8--offline-sync--out-of-scope-for-this-web-app-resolved-2026-09-01).

### Audit (`/api/v1/audit`) — ✅ wired (Phase 9)

`GET /audit/logs` (filterable — `user_id`/`entity_type`/`entity_id`/`action`/`severity`/`date_from`/`date_to` — and paginated via `limit`/`offset`) returns `AuditQueryResponse`: `{audit_logs: [...], total_count, limit, offset, has_more}` — a **fourth** distinct pagination shape in this app (alongside `{data, meta}`, Calculations' `{calculations, total_count, limit, offset}`, and Reports' `{items, total, skip, limit}`). Fully documented in the OpenAPI schema (unlike Calculations/Reports' undocumented list endpoints), confirmed against a live call anyway and it matched exactly. Each `AuditLogResponse` already embeds `changes` (field-level diffs, with `sensitive`/`masked` redaction flags) and `before_snapshot`/`after_snapshot` (full entity state) — so expanding a row in the UI needs no second fetch.

**Not wired**: `GET /audit/logs/{id}` (redundant — list rows already carry full detail) and `GET /audit/entity-timeline/{type}/{id}` (redundant — filtering the list endpoint by `entity_type`+`entity_id` together returns the same data). `POST /audit/events` is backend-internal per its own schema description ("Called by domain services when state changes occur") — never called from the frontend. `POST /audit/purge` and `POST /audit/retention-policies` were deliberately deferred out of *this* phase as a separate data-governance concern — wired instead under Settings, see [Phase 10](#phase-10--settings--done-2026-09-01).

This phase also introduced a genuinely new frontend pattern: every other list view fetches up to `MAX_PAGE_SIZE=100` in one shot and does client-side table operations, but an org's full audit history can be arbitrarily large — this is the first real server-side paginated view (Previous/Next driving `offset`, gated on `has_more`).

---

## 7. Role & permission model

Three roles today, evaluated **per organisation membership**: `admin`, `field_agent`, `viewer` (see `lib/types/user.ts#UserRole`).

**Confirmed from the API** (endpoint descriptions explicitly state the restriction):

| Action | Restriction |
|---|---|
| Create/update/delete organisation | admin |
| Invite user / remove member | admin |
| List users in org | admin |
| Update/delete/suspend a user | admin (or self, for profile fields) |
| Create/update/delete project | admin |
| List/view a project | any org member |
| Manage project members | admin (write), any org member (read) |
| Create/update/delete survey template | admin |
| View methodologies / survey templates | public, no auth |

**Resolved with the user (not stated by the API, so recorded here as the source of truth):**

- Enrol households / create surveys: `admin` or `field_agent` (`canManageHouseholds`) — resolved 2026-08-29.
- Run a calculation: `admin`-only to create, any org member can view (`canManageCalculations`) — resolved 2026-08-30, since it feeds VVB-facing emissions numbers directly rather than being day-to-day field data entry.
- Generate a report / approve or reject it (`POST /reports/{id}/approve`): both `admin`-only to act, any org member can view (`canManageReports`) — resolved 2026-09-01, same reasoning as Calculations. (The `vvb_name` field just records which external body made the decision — it isn't a distinct app role; someone on the team logs what the VVB communicated out-of-band.)

**Still not stated by the API — needs a product decision before building the UI**:

- `viewer` role: is it read-only across everything, or scoped to specific areas? No endpoint mentions it explicitly.

Every one of these checks lives in `lib/auth/permissions.ts` as a named function (`canManageOrganisation(role)`, `canManageCalculations(role)`, `canManageReports(role)`, etc.) — component code calls these, never compares `role === "admin"` inline, so when a new question gets resolved there's exactly one place to update.

---

## 8. Phase-by-phase roadmap

Sizes are relative complexity (S/M/L/XL), not calendar time — nobody involved has enough information yet to promise a date range in good conscience. Re-estimate once Phase 1 is done and the team has a velocity baseline.

Each phase lists: **Goal**, **Backend endpoints**, **New/touched frontend files**, **Open questions**, **Definition of done**.

### Phase 0 — Foundation *(✅ done)*

Admin dashboard (auth, layout, methodologies, organisations, users, dashboard stats), test infra fixed, Windows environment gotchas documented. See [§2](#2-where-we-are-right-now).

---

### Phase 1 — Role-based access foundation *(✅ done, 2026-08-28)*

**Goal**: Any authenticated user with an org membership can reach the app; what they see inside is gated by role, not by a blanket route redirect.

**Resolved open question**: non-admins (`field_agent`/`viewer`) **do** see the Organisations section — Overview/Members/Projects tabs, read-only — rather than a bare Dashboard-only landing. It was already built correctly for this (Settings/Invite already gated behind admin).

**What actually needed changing turned out to be three separate admin-only gates, not one** — the original plan only named `route-guard.ts`; re-reading the code surfaced two more that would have made the fix incomplete on their own:
1. `lib/auth/route-guard.ts` — was redirecting any non-admin role away from `/dashboard`; now only checks for an active organisation, any role.
2. `app/dashboard/layout.tsx` — had its own redundant server-side copy of the same admin-only check; same fix.
3. `components/auth/OrganisationPicker.tsx` — was filtering the org list down to admin-role memberships only, showing a dead-end "Not authorized" screen to anyone without one. This was upstream of the other two: a non-admin could never even select an org to proceed past. Now lists every membership with its real role badge.

**Built**:
- `lib/auth/permissions.ts` — new, centralizes every role check (`isAdmin`, `canManageOrganisation`, `canInviteUsers`, `canManageUsers`, `canManageMethodologyTemplates`, `canViewAuditLogs`, `canViewSettings`). All currently just `role === "admin"`, but Phase 2+ only has to change one function per open question as it gets answered.
- `components/layout/nav-config.ts` / `Sidebar.tsx` — nav items carry an optional `visible(role)` predicate; Dashboard/Methodologies/Organisations show for everyone, Users/Audit/Settings admin-only.
- Page-level gates (redirect to a sensible fallback, not a raw 403) on `/dashboard/users`, `/dashboard/users/[id]`, `/dashboard/methodologies/[id]` (its only current purpose is the *editable* template form — a real read-only viewer is deferred, not built as unplanned scope), `/dashboard/audit`, `/dashboard/settings`.
- `DashboardStats.tsx` — the "Total users" card (and its underlying `useUsers()` query) is admin-only now, so it never fires the admin-only `GET /users` for a non-admin.
- **Bug fix surfaced by this work**: the Organisations Members tab was calling the *admin-only* `GET /users` (scoped by header) instead of the members-only `GET /organisations/{id}/members` — meaning a non-admin viewing their own org's Members tab would have 403'd the moment Phase 1 let them reach it. Added `getOrganisationMembers`/`useOrganisationMembers` and switched the tab to it; see the Organisations row in [§6](#6-full-backend-api-surface). `UserTable` also gained a `showActions` prop so its "View" links (which point to the now admin-gated user profile page) don't render as dead-ends for non-admin viewers.

**Deliberately not built**: no new "field_agent home" or Projects nav entry (that's Phase 2 — a nav link to a page that doesn't exist isn't real functionality); no self-service "my profile" page for non-admins even though the API allows self-view/edit (the only entry point, `/dashboard/users`, is now fully admin-gated); no read-only survey-template viewer.

**Verification**: `tsc --noEmit`, `next build`, and the full test suite (18 suites / 77 tests, up from 17/69 — added `permissions.test.ts`, extended `sidebar.test.tsx` and `dashboard-stats.test.tsx` with role-based cases, updated `route-guard.test.ts`) all pass.

---

### Phase 2 — Projects: full CRUD + membership *(✅ done, 2026-08-29)*

**Goal**: Projects become a first-class section, not just a read-only tab inside Organisation detail.

**Built**:
- `app/dashboard/projects/page.tsx` (list, scoped to the active org) and `app/dashboard/projects/[id]/page.tsx` (detail) — new routes. Nav entry added, visible to all org members (viewing is open to everyone; only admins get the "+ New project" button and Settings tab).
- `lib/api/projects.ts` extended with `getProject`/`createProject`/`updateProject`/`deleteProject`/`listProjectMembers`/`assignProjectMember`/`removeProjectMember`, all taking an optional `organisationId` override following the `organisations.ts` convention.
- New `hooks/useProject.ts` (singular — matches the `useOrganisation.ts`/`useUser.ts` convention for single-entity CRUD; `useProjects.ts` stays the list hook).
- `lib/auth/permissions.ts` — added `canManageProjects` (create/edit/delete a project, assign/remove members — all admin-only per the API; viewing is open to any org member).
- `components/projects/` — `ProjectsListClient`, `CreateProjectDialog`, `ProjectDetailClient` (tabs: Overview, Members, Settings all fully built; **Households/Calculations/Reports are `EmptyState` stubs** naming the phase that builds them, matching how Audit/Settings already stub future work), `EditProjectForm`, `AssignProjectMemberDialog`.
- `ProjectsTable` moved from `components/organisations/` to `components/projects/` (it's no longer organisation-specific) and gained a "View" link column it previously lacked.

**Correctness issue resolved**: `GET /projects/{id}` has no org id in its URL, only the `X-Organisation-ID` header conveys it — so a project reached from a *non-active* org's detail tab (`OrganisationDetailClient`'s Projects tab) needed a way to fetch under the right header. Solved with a `?org=<organisationId>` query param that `ProjectsTable` includes in its View links whenever it's given an explicit `organisationId` prop; the detail page reads it and passes it through as a header override, falling back to the active org when absent (top-level list linking needs no such care).

**Member display gap closed**: `ProjectMemberResponse` is just `{project_id, user_id, assigned_at}` — no email/name/role. `ProjectDetailClient`'s Members tab joins it against `useOrganisationMembers(project.organisation_id)` (from Phase 1) to display and to compute which org members are still available to add.

**Deferred, as planned**: no `location` (WKT point) field in the create/edit forms — optional on the backend, a map picker is out of scope for this pass.

**Verification**: `tsc --noEmit`, `next build` (15 routes now, both new ones compile), and the test suite — 22 suites / 91 tests (up from 18/77): new `projects-table.test.tsx`, `projects-list-client.test.tsx`, `create-project-dialog.test.tsx`, `edit-project-form.test.tsx`, extended `permissions.test.ts`.

---

### Phase 3 — Uploads (shared infra) *(✅ done, 2026-08-29)*

**Goal**: A reusable upload flow, because two later phases depend on it.

**Built**:
- `lib/types/upload.ts`, `lib/api/uploads.ts`, `hooks/useUpload.ts` — full presigned-URL flow (`getPresignedUrl` → `uploadFileToPresignedUrl` → `hashFile` (SHA-256 via `crypto.subtle.digest`) → `confirmUpload`), plus `listUploads`/`getUploadStats`/`deleteUpload`.
- **Correctness point**: the direct-to-storage PUT deliberately bypasses `apiClient` (plain `axios.put`) since the presigned URL points at S3/MinIO, not our backend — it must not carry our `Authorization`/`X-Organisation-ID` headers or trip the 401-signout interceptor.
- `GET /uploads` turned out to be a bare array (`skip`/`limit`), unlike the `{data, meta}` pagination on `/projects` and `/users` — `listUploads()` matches that, not the paginated convention.
- `components/common/FileUpload.tsx` — reusable click-to-pick component. Its contract deliberately ends at "here's the confirmed `Upload`" — turning that into a `photo_*_url` field is Phase 4/5's job once those forms exist, not guessed at here.
- **Real usage site, not a throwaway page**: since Households/Surveys don't exist yet to host the upload widget, this phase also replaced the Settings page stub with a **Storage** section (`StorageStats.tsx` + `UploadsList.tsx`) — quota/file-count stats with an over-80%-quota warning, and a delete-capable file list. Genuine shippable value today, not speculative scope.
- The documented 10-requests/hour rate limit needed no special handling — a 429 already falls through `getErrorMessage` to the backend's own descriptive message text.

**Verification**: `tsc --noEmit` and lint clean; test suite up to **26 suites / 104 tests** (new `format.test.ts`, `storage-stats.test.tsx`, `uploads-list.test.tsx`, `file-upload.test.tsx`). `next build` was not re-run this pass — worth doing before shipping.

**Update 2026-08-29**: a live bug (direct-to-storage PUT failing with a network-level error — CORS or hostname issue, not a frontend bug) was found and then fixed backend-side; see "Known bugs fixed" in §2. Photo upload is now confirmed working end to end.

**Uploads-per-project: ✅ done, 2026-08-29** (unblocked same day the backend shipped it). `UploadResponse` gained `project_id` (nullable — null means an org-level file) and `uploaded_by`, which turned out to be an **embedded `{id, full_name, email}` object**, not just an id — simpler than planned, no join against `useOrganisationMembers` needed. `GET /uploads` gained an optional `project_id` filter; `PresignedUrlRequest` gained `project_id` too ("required for project evidence such as survey photos" per its own field description — a business-logic requirement, not a hard schema one).

Built:
- `UploadsList.tsx` moved from `components/settings/` to `components/uploads/` (no longer Settings-specific) and generalized with optional `projectId`/`organisationId` props and a `canManage` prop gating the delete column — same shape used both in Settings (org-wide, unscoped, admin-only) and inside `ProjectDetailClient.tsx`'s new **Uploads** tab (project-scoped, viewable by all project members, delete admin-gated). Added an "Uploaded by" column (name + email), free now that the data's embedded.
- `StorageStats.tsx` stayed put in `components/settings/` — `GET /uploads/stats` has no project filter, quota is inherently org-wide.
- `FileUpload.tsx` gained optional `projectId`/`organisationId` props, threaded through `useUploadFile` into the presigned-URL request. **Threaded into every existing call site** (`CreateHouseholdDialog`, `EditHouseholdForm`, `SurveyFormDialog` — the last of which didn't have a `projectId` prop at all before, now threaded from `HouseholdDetailClient` through `SurveysTab`) — otherwise viewing uploads per-project would work, but new household/survey photos would still silently land as org-level files with nothing setting the field.
- Cache invalidation on upload/delete uses TanStack Query's default prefix matching (`invalidateQueries({queryKey: ["uploads"]})`) rather than one specific project's key, since the same upload can appear in both a project-scoped view and the org-wide Settings list.

**Verification**: `tsc --noEmit`, lint, `next build` (still 14 routes — Uploads lives inside the existing Project detail page, no new route) all clean; test suite up to **32 suites / 129 tests**.

**UX follow-up, 2026-08-29**: `FileUpload.tsx` was redesigned from a plain "Upload photo" button into an image tile — an empty state shows a dashed drop-zone, a photo (freshly picked via a local `URL.createObjectURL` preview, or a previously-uploaded one resolved through the new `useDownloadUrl` hook) fills the tile, and hovering reveals a "Change photo" overlay; clicking anywhere on the tile always opens the file picker. Every photo field (Household's old-stove photo, Survey's stove/cooking-area photos) now passes `existingUploadId` so editing shows the photo already on file, not just a "photo already on file" text note. **Environment note**: jsdom doesn't implement `URL.createObjectURL`/`revokeObjectURL` — stubbed once in `jest.setup.ts` rather than per test file, since any future component previewing a local file before upload would hit the same gap. Test suite now at **32 suites / 131 tests**.

---

### Phase 4 — Households *(✅ done, 2026-08-29)*

**Goal**: Enrol and manage households within a project.

**Resolved open question**: enrol/edit/delete is `admin` **or** `field_agent` (a plain role check, not project-membership-based) — `canManageHouseholds` in `lib/auth/permissions.ts`. `viewer` gets read-only.

**Built**:
- `lib/types/household.ts`, `lib/api/households.ts`, `hooks/useHouseholds.ts` (list) + `hooks/useHousehold.ts` (singular CRUD) — same optional-`organisationId`-override convention as Projects.
- `components/households/HouseholdsTab.tsx` replaces the `ProjectDetailClient` Households stub; `HouseholdsTable.tsx` (plain table, no search/pagination — household lists per project are small); `CreateHouseholdDialog.tsx` (full enrolment form, including a `FileUpload` — Phase 3's component finally has a real consumer); `EditHouseholdForm.tsx` (only the fields `UpdateHouseholdRequest` actually allows — size/composition/enrolment date are immutable after creation per the schema).
- **New route**: `app/dashboard/projects/[id]/households/[householdId]/page.tsx` — nested under the project route (not a bare `/dashboard/households/[id]`) specifically because a household record only carries `project_id`, not `organisation_id`; nesting means the project id and the `?org=` override are already in the URL, avoiding a worse chicken-and-egg problem than Projects had.
- `HouseholdDetailClient.tsx` is a single view (info grid + edit form), not tabbed — a Surveys tab belongs here once Phase 5 exists.
- `hh_equiv_adults` is treated as strictly display-only (server-computed decimal-as-string) — never sent in a request, matching the schema.
- **Assumption flagged in code, not confirmed against the backend**: `photo_old_stove_url` stores the Phase-3 `Upload`'s `id`, not a presigned download URL — the upload flow has no permanent-URL field, and a presigned download URL expires (1hr default), so storing that directly would go stale. One line to change (`lib/types/household.ts`'s comment + the two form components) if the real contract turns out different.

**Verification**: `tsc --noEmit`, lint, and `next build` (14 routes now) all clean; test suite up to **29 suites / 113 tests** (new `households-table`, `create-household-dialog`, `edit-household-form` tests, extended `permissions.test.ts` with a dedicated non-admin-only case for `canManageHouseholds`).

---

### Phase 5 — Surveys *(✅ done, 2026-08-29)*

**Goal**: Record monitoring visits against an enrolled household.

**Resolved open question**: permissions reuse `canManageHouseholds` directly (admin or field_agent) — confirmed by the user rather than assumed, no separate `canManageSurveys` function.

**Built**:
- `lib/types/survey.ts`, `lib/api/surveys.ts`, `hooks/useSurveys.ts` (list) + `hooks/useSurvey.ts` (create/update/delete) — same optional-`organisationId`-override convention as Households.
- **One shared `SurveyFormDialog.tsx` handles both create and edit** (an optional `survey` prop switches modes) — unlike Households' split create-dialog/edit-form, because `UpdateSurveyRequest` mirrors `CreateSurveyRequest` exactly (just all-optional), so there's no narrower-field-set reason to duplicate the form.
- `components/surveys/SurveysTable.tsx` (plain table, row-level Edit/Delete) + `SurveysTab.tsx` (owns list fetch + which dialog/target is active).
- `HouseholdDetailClient.tsx` gained `Tabs` (Overview / Surveys) — the tab Phase 4 said would make sense "once Phase 5 exists."
- Both photo fields (`photo_stove_url`, `photo_cooking_area_url`) use `FileUpload` and store the upload `id`, same assumption as Household's photo field — unaffected by the still-open storage-PUT bug (see "Known issues — open" in §2); the frontend wiring is correct regardless of that infra issue.
- **Extracted the numeric-optional-form-field helpers** (`toOptionalNumber`, `optionalNonNegativeString`, `optionalNumericString`) from `CreateHouseholdDialog.tsx` into `lib/utils/validation.ts` on their second use here — the `z.preprocess`/`zodResolver`/`useForm<T>` generic-inference conflict from Phase 4 would have recurred a third time otherwise.

**Verification**: `tsc --noEmit`, lint, and `next build` (still 14 routes — no new route, Surveys live inside the household page) all clean; test suite up to **31 suites / 123 tests**. One environment gotcha hit and worked around: Base UI's `Switch` dispatches a synthetic pointer event on click that jsdom doesn't implement (no `PointerEvent` constructor) — `user-profile.test.tsx` already avoided this by not testing the toggle interaction; `survey-form-dialog.test.tsx` does the same (asserts default boolean values submit correctly rather than simulating a click).

---

### Phase 6 — Calculations (VM0050) ✅ Done (2026-08-30)
**Size: L–XL**

**Goal**: Run the methodology's emissions-reduction calculation for a project/year and view results.

**Backend**: `POST/GET /projects/{id}/calculations`, `GET /calculations/{id}`. (`GET /calculations/{id}/audit-trail` exists but wasn't wired — see below.)

**Design pass finding**: of the whole `VM0050CalculationRequest` payload, only `household_composition` had a clean auto-derivation path — Household already stores the same four composition fields per-household (Phase 4). Everything else (`baseline_devices`, `baseline_consumption`, `project_devices`, `monitoring_data`) turned out to be methodology/device-catalog engineering data (emission factors, thermal efficiency, calorific values) with no existing source anywhere in the app — not household or survey data, closer to a stove-model spec sheet an analyst enters by hand. Resolved with the user 2026-08-30: build the full form (all sections, not a reduced v1), pre-fill household composition by **summing** composition fields across the project's enrolled households (shown as editable fields, not locked), and restrict running a calculation to `admin` (`canManageCalculations`) since it feeds VVB-facing numbers directly — everyone can still view results.

**What shipped**:
- `lib/types/calculation.ts` — full request + result types, including the nested breakdown schemas (`BaselineEmissionsBreakdown`, `ProjectEmissionsBreakdown`, `NetEmissionReductionsResult`, `ParameterAuditEntry[]`, `StoveStackingResult`).
- `lib/api/calculations.ts` — `createCalculation`, `listCalculations`, `getCalculation`. The dedicated audit-trail endpoint was skipped: `parameter_audit_trail` already comes embedded in every `CalculationResponse`, so a second fetch would be redundant.
- `hooks/useCalculation.ts` — `useCalculations`/`useCalculation`/`useCreateCalculation`.
- `components/calculations/CalculationFormDialog.tsx` + four section components (`BaselineDevicesSection`, `BaselineConsumptionSection`, `ProjectDevicesSection`, `MonitoringDataSection`) — each array section uses `useFieldArray` for add/remove rows, following the same plain-string-field convention as every prior form (`toOptionalNumber` conversion at submit). No drag-and-drop reordering (unlike `FieldBuilder.tsx`'s survey-field arrays) since row order doesn't matter here. Every repeating row uses index-suffixed `id`/`htmlFor` pairs (e.g. `baseline-device-0-fuel-type`) rather than FieldBuilder's placeholder-only convention, since several fields needed disambiguating labels across sections (e.g. "Baseline thermal efficiency" vs "Project thermal efficiency").
- `components/calculations/CalculationsTab.tsx` + `CalculationsTable.tsx` — the Project detail "Calculations" tab, replacing the stub.
- `components/calculations/CalculationDetailClient.tsx` + `app/dashboard/projects/[id]/calculations/[calculationId]/page.tsx` — full result view: summary stat cards (ER_y/BE_y/PE_y/LE_RB,y), warnings/errors banners, and tabbed baseline/project/audit-trail breakdowns.
- `lib/auth/permissions.ts#canManageCalculations` — admin-only.

**Bug caught by testing**: the native `<select>` for `usage_rate_data.customer_support_level` (an optional field with a "Not specified" option) resolves to `""`, not `undefined` — `z.enum([...]).optional()` alone rejects `""` as an invalid enum value, silently blocking form submission with no visible error. Fixed by accepting `z.union([enum, z.literal("")]).optional()` — same gotcha will recur for any future optional native-select field, worth remembering.

**Two live-backend bugs found and fixed 2026-08-30, after shipping, while investigating "calculations aren't showing up in the list" for household HH-B4B9E7**:
1. `GET /projects/{id}/calculations`'s response shape (`additionalProperties: true` in the OpenAPI doc, genuinely undocumented) is `{calculations: [...], total_count, limit, offset}` — the initial ship guessed at `{data}`/`{items}` and never matched, so the list silently rendered empty regardless of what existed. Confirmed directly against the live backend with a real admin login.
2. Each row in that `calculations` array is a **flat summary** (`calculation_id, year, status, net_emission_reductions, baseline_emissions, project_emissions, created_at`) — not the full nested `CalculationResponse` that `POST`/`GET /calculations/{id}` return. Added a separate `CalculationSummary` type for this; `CalculationsTable.tsx` now reads `calc.year`/`calc.net_emission_reductions` directly instead of `calc.result.year_y`.

Also discovered directly against the backend while testing: **survey-based monitoring requires `customer_support_level`** (CC Clarification 2) even though the OpenAPI schema marks it optional — the backend 422s without it. Added a `superRefine` on `usageRateFormSchema` so this is now a clear inline form error instead of a raw API failure, with a regression test locking it in.

**Lesson reinforced**: an endpoint whose OpenAPI response schema says `additionalProperties: true` (undocumented) should be verified against a real authenticated call before trusting any assumed shape — this is the second time in this phase alone (see the `customer_support_level` bug above) that a documented-optional/undocumented-shape field diverged from what the live backend actually does.

**Not done / explicitly deferred**: no update or delete (the backend doesn't expose either — calculations are treated as immutable audit records once created).

---

### Phase 7 — Reports ✅ Done (2026-09-01)
**Size: M–L**

**Goal**: Generate, list, view, and approve monitoring reports.

**Backend**: `POST/GET /projects/{id}/reports`, `GET /reports/{id}`, `GET /reports/{id}/html`, `GET /reports/{id}/pdf`, `POST /reports/{id}/approve`. Full detail on the three undocumented shapes verified live, and the skipped `bulk-generate` endpoint, is in the [§6 Reports writeup](#6-full-backend-api-surface).

**Resolved with the user 2026-09-01**: generating a report and recording a VVB approval/rejection are both admin-only (`canManageReports`), same class of action as Calculations — everyone can still view.

**What shipped**:
- `lib/types/report.ts` — `Report`, `ReportStatus`, `UsageRateMethod`, `CustomerSupportLevel`, `ReportApprovalLog`, `ReportGenerationInput`, `ReportApprovalInput`.
- `lib/api/reports.ts` — `generateReport`, `listReports`, `getReport`, `getReportHtml`, `downloadReportPdf` (blob), `approveReport`.
- `hooks/useReport.ts` — `useReports`/`useReport`/`useGenerateReport`/`useApproveReport`. HTML preview and PDF download are plain async calls, not TanStack Query state — a preview-on-demand and a download aren't "data to keep fresh."
- `components/reports/GenerateReportDialog.tsx` — period dates + usage rate method + conditionally-required customer support level (`superRefine`, same pattern as Calculations' `usageRateFormSchema`).
- `components/reports/ReportsTab.tsx` + `ReportsTable.tsx` — the Project detail "Reports" tab, replacing the stub.
- `components/reports/ReportDetailClient.tsx` + `app/dashboard/projects/[id]/reports/[reportId]/page.tsx` — stat cards, an HTML preview iframe, a PDF download button, an approval-log history table, and (admin-only, `status === "DRAFT"` only) a "Record VVB decision" action via `ApproveReportDialog.tsx`.
- `lib/auth/permissions.ts#canManageReports` — admin-only.
- `components/layout/Breadcrumb.tsx` — added `"reports"` to `NON_NAVIGABLE_SEGMENTS` (same reasoning as `households`/`calculations`).

**Not done / explicitly deferred**: `POST /projects/bulk-generate/reports` (schema doesn't match live backend behavior, see §6) and report `ARCHIVED` status transitions (no endpoint exposes triggering it).

---

### Phase 8 — Offline sync — ❌ out of scope for this web app (resolved 2026-09-01)

**Resolved with the user**: offline data collection is handled by a separate mobile app client, not this web admin/office app. This web app stays online-only — no local-first architecture, no sync engine, no conflict-resolution UI here. The backend's sync endpoints (`POST /sync/pull`, `POST /sync/push`, `GET /sync/status`, `POST /sync/conflicts/{id}/resolve`, `POST /surveys/sync/surveys`) are consumed by that mobile client, not by anything in this codebase. This was exactly the open question flagged in the original version of this section (kept below for context) — now closed, so this phase is skipped entirely rather than deferred.

<details>
<summary>Original pre-resolution writeup (for context only — no longer actionable)</summary>

**Size: XL — treat as its own mini-project**

**Goal**: Field agents can enrol households and record surveys with no connectivity, then sync when back online.

**This is architecturally different from every other phase** — it's not "call an API from a form," it's a local-first client with a sync engine. Open questions this section originally raised: local persistence choice (IndexedDB/Dexie for a browser PWA vs. a native/Capacitor app), whether this web app was even the intended client for the sync API at all, and how to design the conflict-resolution screen (`SyncConflictResponse` gives `entity_id`/`field`/`local_value`/`remote_value`). The second question is the one that turned out to matter — see the resolution above.

</details>

---

### Phase 9 — Audit Logs ✅ Done (2026-09-01)
**Size: S–M**

**Goal**: Replace the current empty-state stub with the real thing.

**Backend**: `GET /audit/logs` — full detail on its confirmed shape, and which related endpoints were skipped and why, is in the [§6 Audit writeup](#6-full-backend-api-surface).

**Resolved with the user 2026-09-01**: retention-policy configuration and manual purge (`POST /audit/retention-policies`, `POST /audit/purge`) are explicitly out of scope for this phase — a separate data-governance concern from viewing/filtering logs, possibly a later Settings addition. Viewing stays admin-only (`canViewAuditLogs`, already existed, no change needed — this wasn't an open question like the domain-chain phases had).

**What shipped**:
- `lib/types/audit.ts` — `AuditAction`/`AuditSeverity`/`AuditEntityType` unions (+ option-list constants for filter dropdowns), `AuditStatus`, `ChangeRecord`, `EntitySnapshot`, `AuditLog`, `AuditQueryResult`, `AuditLogFilters`.
- `lib/api/audit.ts#listAuditLogs` — GET with filters + `limit`/`offset` as query params (axios drops `undefined` params automatically, so an empty filter object needs no manual stripping).
- `hooks/useAuditLogs.ts` — a plain `useQuery`, key includes the filters object plus `limit`/`offset`.
- `components/audit/AuditLogFiltersBar.tsx` — `entity_type`/`action`/`severity` as `Select`s from the fixed enum lists, `user_id` as a `Select` populated from the existing `useUsers()` hook (already admin-gated, already fetches the org's user list) rather than a raw UUID field, `entity_id` as free text (heterogeneous across entity types, no lookup available), `date_from`/`date_to` as date inputs, a "Clear filters" button. Plain `useState`, not a form library — this is filter state, not a submission.
- `components/audit/AuditLogTable.tsx` — timestamp/action/entity/user/severity columns; user is resolved to name+email via a `Map` built from `useUsers()`, falling back to a truncated id (or "System" for a null `user_id`). Clicking a row expands it in place (no navigation, no second fetch — `changes`/snapshots are already in the row's data) showing field-level changes (with a `(redacted)` note for masked/sensitive fields) and the before/after snapshots as simple `<pre>` JSON dumps.
- `components/audit/AuditLogsClient.tsx` — owns filter + `offset` state (offset resets to 0 whenever a filter changes), Previous/Next pager gated on `offset === 0` / `has_more`.
- `app/dashboard/audit/page.tsx` — kept the existing server-side `canViewAuditLogs` redirect guard, swapped the `EmptyState` stub for `<AuditLogsClient />`.

**Not done / explicitly deferred**: retention-policy management and manual purge UI (see the resolution above); the single-record and entity-timeline endpoints (redundant with the list endpoint's own filters, per the §6 writeup).

---

### Phase 10 — Settings ✅ Done (2026-09-01)

**User Settings: ✅ done, 2026-08-29** (built ahead of its original slot, prompted directly by the user). `app/dashboard/settings/page.tsx` now has two sections: "My profile" (`UserSettingsForm.tsx` — full name edit via the existing `PATCH /users/{id}` self-edit permission, read-only email, a "send password reset email" button wired to the newly-added `lib/api/auth.ts#requestPasswordReset` / `POST /auth/request-password-reset`), visible to **every role**; and "Storage" (`StorageStats` + `UploadsList` — the latter moved to `components/uploads/` and generalized on 2026-08-29, see the Phase 3 follow-up note — still admin-gated via `canViewSettings` here, now scoped to just this section instead of the whole page). This required loosening the page's and nav item's gate from admin-only to everyone, since self-service settings must be reachable by any logged-in user — see `nav-config.ts` and the page itself.

Note: `RequestPasswordResetResponse` includes a `reset_token` field, but its own schema description flags it "temporary - for MVP testing only" (standing in for real email delivery) — the UI deliberately shows a generic "check your email" message and never surfaces that token, so it won't need rework once real delivery exists.

**Organisation Settings**: confirmed 2026-08-29 to already live in the right place — the existing admin-only Settings tab inside `OrganisationDetailClient.tsx` (Phase 2). No change made.

**Data retention: ✅ done, 2026-09-01.** The one system/platform-level setting with a real backing endpoint, now built. `POST /audit/retention-policies` and `POST /audit/purge` were deliberately deferred out of Phase 9 (Audit Logs) as a separate concern — built here instead.

**Confirmed real gap, resolved with the user 2026-09-01**: there is no `GET` endpoint anywhere to list currently-configured retention policies — only `POST` to create/update one. This makes the feature genuinely **write-only** on the backend as it stands: you can set a policy and see the immediate confirmation, but never review what's currently active from the UI. Built anyway rather than waiting on a hypothetical future endpoint — `RetentionPolicyForm.tsx` shows a full inline summary of exactly what was just set (scope, retention days, deletion behavior) as the only "current state" available, and `PurgeRecordsButton.tsx` (a `ConfirmDialog`-gated action) shows the real purge result. Confirmed live: `POST /audit/purge`'s previously-undocumented response is `{purged_count: number, message: string}`.

**What shipped**:
- `lib/types/audit.ts` (extended from Phase 9) — `RetentionPolicyType`, `RetentionPolicyInput`, `RetentionPolicy`. Reuses the existing `AuditAction`/`AuditEntityType` unions and option lists for the form's conditional Selects.
- `lib/api/audit.ts#setRetentionPolicy`/`#purgeExpiredRecords` (extended from Phase 9).
- `hooks/useRetentionPolicy.ts` — `useSetRetentionPolicy`/`usePurgeExpiredRecords`, plain mutations with no query invalidation (nothing else reads this data).
- `components/settings/RetentionPolicyForm.tsx` — policy scope Select (GLOBAL/BY_ACTION/BY_ENTITY_TYPE) with conditionally-required `action_type`/`entity_type` fields (`superRefine`), retention days (7–2555), auto-delete/anonymize `Switch` toggles.
- `components/settings/PurgeRecordsButton.tsx` — reuses `ConfirmDialog` as-is.
- `app/dashboard/settings/page.tsx` — added a third `canViewSettings`-gated "Data retention" section alongside the existing Storage one.

**Not done**: reviewing/listing previously-set policies (backend limitation, not a frontend gap — see above).

---

### Phase 11 — Hardening
**Size: M**

- Expand test coverage to every new phase's components (the existing `__tests__/` pattern — mock hooks, RTL render, `fireEvent` — should be followed for consistency; see [§9](#9-conventions)).
- Accessibility pass (the original plan's testing checklist called out WCAG 2.1 AA — not verified yet for any existing page).
- Error boundaries per route section (currently only global `app/error.tsx` + `app/dashboard/error.tsx` exist).
- Mobile responsiveness pass — genuinely important for Phases 4/5 (surveys/households are field-collected data).
- Security review: run the `security-review` skill against the full diff once the major phases land, particularly around file upload handling and the auth token flow.

### Phase 12 — Deployment
**Size: S–M**

CI pipeline, Vercel (or chosen host) env var setup for both `NEXT_PUBLIC_API_URL` variants (local vs. production backend), Sentry or equivalent error tracking, uptime monitoring. See the original `SUPERADMIN_DASHBOARD_PLAN.md`'s Deployment section for the concrete checklist — that part of the old doc is still accurate and doesn't need rewriting.

---

## 9. Conventions (follow these so the codebase stays one voice)

- **Query keys**: `["<resource>", <scopeId>]`, e.g. `["users", organisationId]`, `["organisation", id]`. When two hooks fetch the *same conceptual list* at different scopes or via different endpoints entirely (e.g. `useUsers()` for the active org's admin listing vs `useOrganisationMembers(id)` for any member's read-only view of an arbitrary org), keep them on the **same query key shape** so cache invalidation from a mutation (like inviting a user) hits both — see `hooks/useUser.ts#useInviteUser` for the pattern of accepting an optional scope override that falls back to the active org.
- **API functions never assume session context** beyond what the shared `apiClient` interceptor already injects — if a function needs to act on a *specific* org/resource that might not be the active one, take that id as an explicit parameter and pass an explicit header override, don't rely on the interceptor default. (This is exactly the bug class the Phase-0 Organisation Members/Projects tabs work fixed — see `lib/api/users.ts#listUsers`.)
- **Role checks always go through `lib/auth/permissions.ts`** (added in Phase 1), never an inline `role === "admin"` comparison — see §7 below.
- **Tables**: TanStack Table with a search `Input` + one or more `Select` filters above, a bordered/rounded table below, "Previous/Next" pagination only shown when `getPageCount() > 1`. Copy `components/users/UserTable.tsx` or `components/organisations/ProjectsTable.tsx` as the starting template for a new one rather than inventing a new pattern.
- **Forms**: React Hook Form + Zod resolver, inline field errors under each input, a `formError` state for submit-level errors (shown via `getErrorMessage`), submit button shows a `"…ing…"` pending label and is `disabled` during the mutation. See `CreateOrganisationDialog.tsx` or `UserInviteDialog.tsx`.
- **Empty/loading/error states**: every data-fetching component follows `isLoading → skeleton pulse div, isError → EmptyState with getErrorMessage(error), empty data → EmptyState with a helpful CTA, else → the real content`. Don't invent a new loading pattern per component.
- **Tests**: colocated in `__tests__/`, not next to source files. Mock the hook layer (`jest.mock("@/hooks/useX", ...)`), not the API layer, when testing a component — see `__tests__/user-invite-dialog.test.tsx`.
- **Types mirror the backend exactly** — field names, nullability (`| null` vs optional `?`), and enum values should match the OpenAPI schema precisely (this file's [§6](#6-full-backend-api-surface)/[§5](#5-domain-glossary-vm0050--cookstove-mrv) sections exist so you don't have to re-derive them by trial and error).

---

## 10. If you're picking this up cold

Whether that's a new chat session, a new AI context window, or a new human developer:

1. **Read this file first**, then skim [§2](#2-where-we-are-right-now) to see what's built vs stubbed vs missing.
2. **Check git status / recent commits** — this doc records intent and history, but the actual code is ground truth for what's currently implemented. If they disagree, trust the code and fix this doc.
3. **Never trust a static API doc over the live schema** — hit `http://127.0.0.1:8000/api/v1/openapi.json` (backend must be running locally, see `.env.local` for the expected URL) before writing a type or api function for an endpoint you haven't personally verified. This has already burned this project twice (see [Gotcha #3](#3-dont-trust-static-api-docs-over-the-live-schema)).
4. **Before debugging a broken `npm test`/`npm run dev` on a fresh Windows machine**, check [§4](#4-environment-gotchas-read-before-you-debug-for-an-hour) first — both known issues there cost real hours to diagnose from scratch.
5. **Update this file's checkboxes/status tables** as phases land, and add new gotchas to §4 as they're discovered. A roadmap that drifts from reality is worse than no roadmap.
6. **When a phase's "Open questions" haven't been answered yet, don't guess silently into the UI** — the role/permission unknowns in particular ([§7](#7-role--permission-model)) affect what gets built across several phases; getting one wrong means rework in every phase downstream of it.
