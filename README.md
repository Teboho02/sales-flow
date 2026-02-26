# Sales Flow

Multi-tenant sales automation frontend built with Next.js (App Router) and Ant Design. It manages clients, contacts, opportunities, proposals, contracts, and dashboard reporting against the SalesFlow API. All data is tenant-scoped; JWTs carry `tenantId` and roles.

## Table of Contents
- Overview
- Architecture
- Setup
- Environment
- Roles & Permissions
- Running Locally
- Conventions & Gotchas
- Feature Map (UI ↔ API)

## Overview
- **Auth**: `/api/Auth/login` and `/api/Auth/register`; bearer token stored in `localStorage` (`auth_token`, `auth_user`). Axios interceptor attaches it to every request.
- **Tenant isolation**: `tenantId` is derived from JWT; never send it in payloads or queries.
- **Core flows**: client/contact creation, opportunity pipeline (Lead→Closed Won/Lost), proposals (draft→submit→approve/reject), contracts (draft→activate), dashboard metrics.
- **UI**: Ant Design components, antd-style for styling, App layout with protected routes.
- **State**: React Context + reducer providers per domain (auth, opportunity, client, proposal). All API calls go through a shared axios instance (`getAxiosInstace`).

## Architecture
- Next.js App Router under `src/app` with grouped routes `(app)`, `(auth)`.
- Providers under `src/provider/*`: actions, context, reducer, index with hooks.
- Utils: `src/utils/axiosInstance.ts` sets baseURL from env and injects bearer token; clears creds on 401.
- Styling: antd-style `createStyles` per page/component.

## Setup
1) Install deps
```bash
npm install
```
2) Environment
- Copy `.env` or set:
```
NEXT_PUBLIC_BACKEND_API_URL=https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net/
```
3) Run dev server
```bash
npm run dev
# http://localhost:3000
```

## Environment
- `NEXT_PUBLIC_BACKEND_API_URL`: SalesFlow API base URL (no trailing slash required; axios trims extras).

## Roles & Permissions
| Role | How to obtain | Access level |
|---|---|---|
| `Admin` | Register with `tenantName`, or assigned by another Admin | Full access to all endpoints including delete, approve, reject, assign, and user management |
| `SalesManager` | Register with `"role": "SalesManager"` when joining | Full access including approve/reject proposals, assign opportunities, and delete records |
| `BusinessDevelopmentManager` | Register with `"role": "BusinessDevelopmentManager"` | Create and manage opportunities, proposals, contracts, and activities |
| `SalesRep` | Default when no role is specified | Read own data, create activities, update assigned opportunities |

## Running Locally
```bash
npm run dev        # start dev server
npm run lint       # lint
npm run build      # production build
npm run start      # serve .next build
```

## Conventions & Gotchas
- **Enums are integers** (stages, statuses, sources, priorities). Send ints, not labels.
- **Stages**: set via `PUT /api/Opportunities/{id}/stage` (not in update body). Closed Lost (6) requires `lossReason`.
- **Proposals**: status changes via `/submit`, `/approve`, `/reject`. Update endpoint works only in Draft.
- **Deletes**: expect 204 No Content.
- **Pagination**: `pageNumber` is 1-based; list endpoints return `PagedResultDto`.
- **Tenant**: never include `tenantId` in requests after auth; cross-tenant returns 404.
- **Token expiry**: axios interceptor clears `auth_token`/`auth_user` on 401.

## Feature Map (UI ↔ API)
- **Auth**: login/register pages → `/api/Auth/login`, `/api/Auth/register`.
- **Clients**: list/create/edit/delete, stats drawer → `/api/Clients`, `/api/Clients/{id}`, `/stats`.
- **Opportunities**: list, create, stage update, assign, delete → `/api/Opportunities`, `/stage`, `/assign`.
- **Proposals**: list, create, submit, approve/reject, delete → `/api/Proposals`, `/submit`, `/approve`, `/reject`.
- **Dashboard**: metrics → `/api/Dashboard/overview`, `/api/Opportunities/pipeline`, `/api/Dashboard/sales-performance`.
- **Contracts**: API supported.

Testing auth locally: use `/api/Auth/register` with `tenantName` to create an Admin; use `tenantId` + `role` to add SalesManager/Rep. Then log in via `/api/Auth/login` and work through clients → opportunities → proposals → contracts.
