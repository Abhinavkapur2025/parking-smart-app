# Workspace

## Overview

pnpm workspace monorepo using TypeScript. The main product artifact is Smart Parking, a responsive India-focused parking management web app for drivers and parking operators.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS
- **Build**: esbuild (API), Vite (web)

## Smart Parking App

- **Web artifact**: `artifacts/smart-parking`
- **Preview path**: `/`
- **API artifact**: `artifacts/api-server`
- **API base path**: `/api`
- **Database schema**: `lib/db/src/schema/parking.ts`
- **API routes**: `artifacts/api-server/src/routes/parking.ts`
- **OpenAPI contract**: `lib/api-spec/openapi.yaml`

### Current Features

- Driver-facing parking search by city/area and vehicle type.
- Real parking location data with Indian city examples.
- Booking flow with phone number, vehicle number, duration, and cash/UPI mode.
- My Bookings lookup by phone number.
- Operator portal at `/admin` with dashboard metrics, city breakdown, recent bookings, location CRUD, and booking status management.
- Seed data initializes parking locations and example bookings when the API is first used.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/smart-parking run dev` — run Smart Parking web app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
