import { StorageService } from './storageService';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = StorageService.KEYS.TRIPS;

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
    const trips = (await StorageService.get(STORAGE_KEY)) || [];
    return trips.sort(byUpcoming);
  },

  async getById(id) {
    const trips = await this.getAll();
    return trips.find((trip) => trip.id === id) || null;
  },

  async create(tripData) {
    const trips = await this.getAll();
    const trip = withDefaults(tripData);
    trips.push(trip);
    await StorageService.set(STORAGE_KEY, trips);
    return trip;
  },

  async update(id, updates) {
    const trips = await this.getAll();
    let updatedTrip = null;
    const nextTrips = trips.map((trip) => {
      if (trip.id !== id) return trip;
      updatedTrip = { ...trip, ...updates };
      return updatedTrip;
    });
    if (!updatedTrip) {
      return null;
    }
    await StorageService.set(STORAGE_KEY, nextTrips.sort(byUpcoming));
    return updatedTrip;
  },

  async remove(id) {
    const trips = await this.getAll();
    const nextTrips = trips.filter((trip) => trip.id !== id);
    await StorageService.set(STORAGE_KEY, nextTrips);
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
    await StorageService.set(STORAGE_KEY, []);
  },
};
