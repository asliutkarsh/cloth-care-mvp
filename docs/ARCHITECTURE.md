# ClothCare Architecture

## Overview
ClothCare uses a layered architecture with clear separation of concerns.

- UI: `src/components`, `src/pages`, `src/layouts`
- State: `src/stores` (Zustand)
- Services: `src/services` (`crud/`, `logic/`, `model/`, `setup/`)
- Context: `src/context`

## Layers

### UI Layer
- Pages orchestrate user flows and compose feature components.
- Cross-cutting primitives live in `components/ui`.
- Layouts provide navigation and shell (`AppLayout`, `PublicLayout`).

### State Layer (Zustand)
- Feature stores encapsulate domain state and actions.
- Stores call services; they do not persist directly.
- Bootstrapped via `AuthProvider` calling store init actions.

### Service Layer
- `crud/`: CRUD for cloth, outfit, category, activity, trip.
- `logic/`: Derived computations, non-CRUD feature logic.
- `model/`: Domain types and helpers.
- `setup/`: App setup and `StorageService` (Dexie/IndexedDB).

Principles:
- Stateless services with side-effects isolated to storage.
- UI never touches storage APIs.
- Prefer small, composable functions and early returns.

## Data Flow
1. UI triggers store action
2. Store delegates to service(s)
3. Service uses `StorageService` to read/write IndexedDB
4. Store updates state → UI re-renders

## Error Handling
- Boot errors surfaced in `AuthProvider` with retry.
- User-facing errors via `ToastProvider` toasts.

## Routing
- Public: `PublicLayout` (`/`, `/login`, `/signup`)
- Protected: `ProtectedRoute` + `AppLayout` (wardrobe, calendar, etc.)
