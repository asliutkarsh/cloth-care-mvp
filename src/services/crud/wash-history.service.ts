import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../setup/storage.service';

export type WashHistoryAction = 'wash' | 'press';

export interface WashHistoryEvent {
  id: string;
  clothId: string;
  action: WashHistoryAction;
  createdAt: string;
}

export interface WashHistoryMetrics {
  totalEvents: number;
  totalWashCount: number;
}

export interface WashHistoryQueryOptions {
  limit?: number;
  cursor?: string;
}

export interface WashHistoryQueryResult {
  items: WashHistoryEvent[];
  nextCursor: string | null;
  metrics: WashHistoryMetrics;
}

const TABLE_NAME = StorageService.KEYS.WARDROBE_WASH_HISTORY;
const DEFAULT_PAGE_SIZE = 15;

const sortByNewest = (events: WashHistoryEvent[]): WashHistoryEvent[] =>
  [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const paginate = (events: WashHistoryEvent[], limit: number, cursor?: string) => {
  if (!events.length) {
    return {
      items: [] as WashHistoryEvent[],
      nextCursor: null as string | null,
    };
  }

  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_PAGE_SIZE;

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = events.findIndex((event) => event.id === cursor);
    if (cursorIndex >= 0) {
      startIndex = cursorIndex + 1;
    }
  }

  const items = events.slice(startIndex, startIndex + normalizedLimit);

  const hasMore = startIndex + items.length < events.length;
  const nextCursor = hasMore && items.length ? items[items.length - 1].id : null;

  return { items, nextCursor };
};

export const WashHistoryService = {
  async logEvent(clothId: string, action: WashHistoryAction): Promise<WashHistoryEvent> {
    const entry: WashHistoryEvent = {
      id: uuidv4(),
      clothId,
      action,
      createdAt: new Date().toISOString(),
    };

    await StorageService.add(TABLE_NAME, entry);
    return entry;
  },

  async getHistoryForCloth(clothId: string, options: WashHistoryQueryOptions = {}): Promise<WashHistoryQueryResult> {
    const { limit = DEFAULT_PAGE_SIZE, cursor } = options;
    const events = await StorageService.getAll<WashHistoryEvent>(TABLE_NAME);
    const filtered = sortByNewest(events.filter((event) => event.clothId === clothId));

    const { items, nextCursor } = paginate(filtered, limit, cursor);

    const metrics: WashHistoryMetrics = {
      totalEvents: filtered.length,
      totalWashCount: filtered.filter((event) => event.action === 'wash').length,
    };

    return { items, nextCursor, metrics };
  },

  async getTotalWashCount(clothId: string): Promise<number> {
    const events = await StorageService.getAll<WashHistoryEvent>(TABLE_NAME);
    return events.filter((event) => event.clothId === clothId && event.action === 'wash').length;
  },
};
