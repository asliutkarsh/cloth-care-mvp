import { v4 as uuid } from 'uuid';
import { StorageService } from '../setup/storage.service';
import { EssentialItem } from '../model/essential.model';

const TABLE = StorageService.KEYS.ESSENTIALS;

const sortEssentials = (items: EssentialItem[]): EssentialItem[] =>
  [...items].sort((a, b) => a.label.localeCompare(b.label));

export const EssentialsService = {
  async getAll(): Promise<EssentialItem[]> {
    const items = await StorageService.getAll<EssentialItem>(TABLE);
    return sortEssentials(items);
  },

  async add(label: string): Promise<EssentialItem> {
    const trimmed = label.trim();
    if (!trimmed) {
      throw new Error('Label cannot be empty');
    }
    const item: EssentialItem = {
      id: uuid(),
      label: trimmed,
      createdAt: new Date().toISOString(),
    };
    await StorageService.add(TABLE, item);
    return item;
  },

  async update(id: string, updates: Partial<Omit<EssentialItem, 'id'>>): Promise<EssentialItem | null> {
    const existing = await StorageService.getById<EssentialItem>(TABLE, id);
    if (!existing) return null;
    const updated: EssentialItem = { ...existing, ...updates };
    await StorageService.put(TABLE, updated);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(TABLE, id);
    return true;
  },

  async replaceAll(labels: string[]): Promise<EssentialItem[]> {
    const items: EssentialItem[] = labels
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({ id: uuid(), label, createdAt: new Date().toISOString() }));

    await StorageService.clear(TABLE);
    if (items.length) {
      await StorageService.bulkUpdate(TABLE, items);
    }
    return sortEssentials(items);
  },
};
