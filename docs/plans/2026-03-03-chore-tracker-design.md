# Chore Tracker Design

Date: 2026-03-03

## Approved Direction

- Framework: Vue 3 with TypeScript
- Build tool: Vite
- UI library: Vuetify
- State: Pinia
- Routing: Vue Router
- Local storage: Dexie over IndexedDB
- PWA: vite-plugin-pwa
- Scope: Fuller MVP
- PWA/offline: Required on day one

## Goals

- Let a parent quickly log chores for a child
- Show visible monthly progress toward a reward
- Keep all data local and offline-capable
- Preserve detailed month history

## Architecture

- Single-page Vue app with route-based sections:
  - Dashboard
  - Month
  - Library
  - History
  - Settings
- Pinia stores coordinate chores, logs, settings, app state, and derived month metrics
- Dexie provides IndexedDB persistence
- Derived month metrics are computed from raw logs and settings
- Monthly archives are cached summaries, not the source of truth

## Key Product Rules

- Chore logs are the source of truth
- Streaks are a derived per-month calculation
- Streaks do not cross month boundaries
- Any log or settings change recalculates the affected month
- Offline installability is part of the first release

## UI Plan

- Vuetify app shell with bottom navigation
- Dashboard with progress card, streak card, today's logs, and add chore action
- Add chore dialog with chore selection and confirmation
- Month calendar view with daily drilldown
- Library CRUD screen
- History summary list
- Settings form with month reset action

## Technical Plan

1. Scaffold Vue 3 + Vite + TypeScript app
2. Add Vuetify, Pinia, Vue Router, Dexie, and vite-plugin-pwa
3. Build IndexedDB layer and domain logic for monthly metrics
4. Implement core stores and composables
5. Build screens and shared components
6. Verify installability and offline behavior

## Notes

- No `writing-plans` skill is available in this workspace, so implementation planning will be handled directly in the project.
- No git repository exists yet, so this design doc cannot be committed at this stage.
