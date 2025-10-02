import { StorageService } from './storageService.js';
import { v4 as uuid } from 'uuid';

const KEY = StorageService.KEYS.TRIPS;

const byUpcoming = (a, b) => new Date(a.startDate) - new Date(b.startDate);

const withDefaults = (trip) => ({
  id: uuid(),
  name: 'New trip',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  clothIds: [],
  outfitIds: [],
  packedClothIds: [],
  packedOutfitIds: [],
  notes: '',
  createdAt: new Date().toISOString(),
  ...trip,
});

export const TripService = {
  async getAll() {
    const trips = await StorageService.getAll(KEY);
    return [...trips].sort(byUpcoming);
  },

  async getById(id) {
    const trip = await StorageService.getById(KEY, id);
    return trip || null;
  },

  async create(tripData) {
    const trip = withDefaults(tripData);
    await StorageService.add(KEY, trip);
    return trip;
  },

  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }
    const updatedTrip = { ...existing, ...updates };
    await StorageService.put(KEY, updatedTrip);
    return updatedTrip;
  },

  async remove(id) {
    await StorageService.remove(KEY, id);
    return true;
  },

  async addItems(id, { clothIds = [], outfitIds = [] }) {
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

  async removeItem(id, entityId, type = 'cloth') {
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

  async togglePacked(id, entityId, type = 'cloth') {
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

  async clearAll() {
    await StorageService.clear(KEY);
  },
};
