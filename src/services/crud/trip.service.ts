import { StorageService } from '../setup/storage.service';
import { v4 as uuid } from 'uuid';
import { Trip } from '../model/trip.model';

interface TripData {
  name: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  clothIds?: string[];
  outfitIds?: string[];
  packedClothIds?: string[];
  packedOutfitIds?: string[];
  notes?: string;
}

const byUpcoming = (a: Trip, b: Trip): number => new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

const withDefaults = (trip: TripData): Trip => ({
  id: uuid(),
  name: trip.name || 'New trip',
  startDate: trip.startDate || new Date().toISOString().split('T')[0],
  endDate: trip.endDate || new Date().toISOString().split('T')[0],
  startTime: trip.startTime,
  endTime: trip.endTime,
  clothIds: trip.clothIds || [],
  outfitIds: trip.outfitIds || [],
  packedClothIds: trip.packedClothIds || [],
  packedOutfitIds: trip.packedOutfitIds || [],
  notes: trip.notes || '',
  createdAt: new Date().toISOString(),
});

export const TripService = {
  async getAll(): Promise<Trip[]> {
    const trips: Trip[] = await StorageService.getAll<Trip>(StorageService.KEYS.TRIPS);
    return [...trips].sort(byUpcoming);
  },

  async getById(id: string): Promise<Trip | null> {
    const trip = await StorageService.getById<Trip>(StorageService.KEYS.TRIPS, id);
    return trip || null;
  },

  async create(tripData: TripData): Promise<Trip> {
    const trip = withDefaults(tripData);
    await StorageService.add(StorageService.KEYS.TRIPS, trip);
    return trip;
  },

  async update(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }
    const updatedTrip = { ...existing, ...updates };
    await StorageService.put(StorageService.KEYS.TRIPS, updatedTrip);
    return updatedTrip;
  },

  async remove(id: string): Promise<boolean> {
    await StorageService.remove(StorageService.KEYS.TRIPS, id);
    return true;
  },

  async addItems(id: string, { clothIds = [], outfitIds = [] }: { clothIds?: string[], outfitIds?: string[] }): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const clothSet = new Set(trip.clothIds);
    clothIds.forEach((cid) => clothSet.add(cid));
    const outfitSet = new Set(trip.outfitIds);
    outfitIds.forEach((oid) => outfitSet.add(oid));
    return this.update(id, {
      clothIds: Array.from(clothSet),
      outfitIds: Array.from(outfitSet),
    });
  },

  async removeItem(id: string, entityId: string, type: 'cloth' | 'outfit' = 'cloth'): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    if (type === 'cloth') {
      return this.update(id, {
        clothIds: trip.clothIds.filter((x) => x !== entityId),
        packedClothIds: trip.packedClothIds.filter((x) => x !== entityId),
      });
    }
    return this.update(id, {
      outfitIds: trip.outfitIds.filter((x) => x !== entityId),
      packedOutfitIds: trip.packedOutfitIds.filter((x) => x !== entityId),
    });
  },

  async togglePacked(id: string, entityId: string, type: 'cloth' | 'outfit' = 'cloth'): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const key = type === 'cloth' ? 'packedClothIds' : 'packedOutfitIds';
    const set = new Set(trip[key]);
    if (set.has(entityId)) {
      set.delete(entityId);
    } else {
      set.add(entityId);
    }
    return this.update(id, { [key]: Array.from(set) });
  },

  async clearAll(): Promise<void> {
    await StorageService.clear(StorageService.KEYS.TRIPS);
  },
};
