# Storage & Data Persistence

## Overview
ClothCare persists data in IndexedDB using Dexie. A one-time migration imports legacy localStorage data.

- Library: Dexie 4.2.0
- Entry: `src/services/setup/storage.service.ts`
- Tables: categories, clothes, outfits, trips, activity_logs, preferences, user, essentials, wardrobe_wash_history

## Migration
On load, `migrateFromLocalStorage()` checks for the flag `wardrobe_migration_v1_complete` and copies any `wardrobe_*` keys into IndexedDB, then removes old keys.

## API
`StorageService` exposes:
- `KEYS` — centralized table names
- `getAll(table)` → `T[]`
- `getById(table, id)` → `T | undefined`
- `add(table, item)` → `T`
- `put(table, item)` → `T`
- `update(table, id, updates)` → `T | undefined`
- `bulkUpdate(table, items)` → `T[]`
- `remove(table, id)`
- `bulkRemove(table, ids)`
- `clear(table)`
- `clearAll()`

## Example
```js
import { StorageService } from '../services/setup';
import { v4 as uuidv4 } from 'uuid';

export async function createCloth(input) {
  const cloth = { id: uuidv4(), createdAt: new Date(), updatedAt: new Date(), status: 'clean', currentWearCount: 0, ...input };
  await StorageService.add(StorageService.KEYS.CLOTHES, cloth);
  return cloth;
}
```

## Backups
- Use Settings → Data & Privacy to Export/Import JSON backups.
- Keep backups if clearing browser storage or switching devices.
