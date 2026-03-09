# Trukio App — Session Memory

## Project Overview
Mobile-first logistics operations platform for small freight operators in India.
- Expo SDK 55, React Native 0.83.2, React 19.2.4, TypeScript
- Expo Router v4 (file-based), Supabase (backend), WatermelonDB (offline-first local DB)
- Zustand v5 (global state), Feature-first folder structure in `src/`
- Design: warm sand (#FAF7F2) + deep teal (#1A6B5A)

## Phase Status
- **Phase 1 (Skeleton):** COMPLETE — app runs on Expo Go iOS, all screens scaffolded, schema + types complete
- **Phase 2 (Core Loop):** COMPLETE — all code written, needs dev build testing
- **Phase 3-5:** Not started

## Critical Architecture Notes
- WatermelonDB uses `jsi: false` in `src/db/index.ts` (legacy bridge for Expo Go compatibility)
- **WatermelonDB requires a development build (not Expo Go)** — first time DB is actually used is Phase 2
  - Run `npx expo run:ios` instead of `npx expo start` to get a dev build
- `database` singleton exported from `src/db/index.ts`
- `syncManager` singleton exported from `src/sync/SyncManager.ts`
- Sync is pull-based (no conflict resolution), last-write-wins
- Queue in `src/sync/queue.ts` is in-memory only (clears on app restart)

## Key File Paths
- Auth: `src/features/auth/hooks/useAuth.ts`, `src/services/supabase/auth.ts`
- DB: `src/db/index.ts`, `src/db/schema.ts`, `src/db/models/`
- Sync: `src/sync/SyncManager.ts`, `src/sync/queue.ts`
- Stores: `src/store/authStore.ts`, `src/store/syncStore.ts`, `src/store/uiStore.ts`
- Root layout: `src/app/_layout.tsx` (has DatabaseProvider, banners, autoSync wiring)

## Phase 2 Implementation Summary
All files implemented:
- `src/db/models/Order.ts` — `createNew()`, `getJob()`, `markAssigned()`, `markCompleted()`
- `src/db/models/Job.ts` — `createForOrder()`, `transitionTo(JobStatus)`, `getOrder()`
- `src/db/models/Driver.ts` — `getActiveDriversForOwner(db, ownerId)`
- `src/db/models/TeamMembership.ts` — NEW (needed for driver queries)
- `src/sync/queue.ts` — `enqueue()` with dedup, `flush(supabase)`, `getPendingCount()`
- `src/sync/SyncManager.ts` — full pull sync + autoSync + NetInfo subscription
- Owner screens: orders/index, orders/new, orders/[id], drivers/index, drivers/[id]
- Driver screens: (driver)/job.tsx, (driver)/history.tsx

## User Preferences
- User runs `npm install` and `npx expo start` manually — always ask before running commands
- User has Node v24.14.0 via nvm (multiple Node versions installed)
- User's device: iOS (Expo Go), needs dev client for Phase 2+ (WatermelonDB requires native)

## Product Doc
- Stored at: `/Users/khamseaffan/Desktop/truckio/trukio_product_doc_v4.pdf`
- 5 phases: Skeleton → Core Loop → Map+Location → Invoices → AI Voice/Chat

## Supabase Tables
owners, drivers, team_memberships, material_catalogue, orders, jobs, job_locations, invoices, invoice_templates, subscriptions, notifications, audit_log

## Job Status Transitions (from `src/shared/constants/jobStatuses.ts`)
assigned → [accepted, rejected] → accepted → [picked_up] → [in_transit] → [delivered]
