import { StorageService } from '../setup/storage.service';
import { v4 as uuid } from 'uuid';
import { Trip, TripEssential } from '../model/trip.model';
import { EssentialsService } from '../crud/essentials.service';
import { EssentialItem } from '../model/essential.model';

interface TripData {
  name: string;
  startDate: string;
  endDate: string;
  destination?: string;
  startTime?: string;
  endTime?: string;
  clothIds?: string[];
  outfitIds?: string[];
  packedClothIds?: string[];
  packedOutfitIds?: string[];
  notes?: string;
  essentials?: TripEssential[];
}

const byUpcoming = (a: Trip, b: Trip): number => new Date(a.startDate).getTime() - new Date(b.startDate).getTime();

const withDefaults = (trip: TripData): Trip => ({
  id: uuid(),
  name: trip.name || 'New trip',
  startDate: trip.startDate || new Date().toISOString().split('T')[0],
  endDate: trip.endDate || new Date().toISOString().split('T')[0],
  // ADDED: destination field
  destination: trip.destination || '', 
  startTime: trip.startTime,
  endTime: trip.endTime,
  clothIds: trip.clothIds || [],
  outfitIds: trip.outfitIds || [],
  packedClothIds: trip.packedClothIds || [],
  packedOutfitIds: trip.packedOutfitIds || [],
  essentials: trip.essentials || [],
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
    if (!trip) return null;

    if (!trip.essentials) {
      const defaults = await EssentialsService.getAll();
      const essentials = defaults.map((item: EssentialItem) => ({
        id: item.id,
        label: item.label,
        packed: false,
        sourceId: item.id,
        isCustom: false,
      }));
      // Ensure 'destination' is included for existing trips that might not have it saved
      const updatedTrip = { destination: '', ...trip, essentials }; 
      await StorageService.put(StorageService.KEYS.TRIPS, updatedTrip);
      return updatedTrip;
    }
    
    // Fallback for missing destination on old data
    if (trip.destination === undefined) {
        trip.destination = '';
    }

    return trip;
  },

  async create(tripData: TripData): Promise<Trip> {
    // If the tripData already includes essentials (as is the case with copy trip), use them.
    // Otherwise, fetch defaults (as is the case with new trip).
    const essentials = tripData.essentials ?? (await EssentialsService.getAll()).map((item: EssentialItem) => ({
      id: item.id,
      label: item.label,
      packed: false,
      sourceId: item.id,
      isCustom: false,
    }));
    
    // 'tripData' for 'copy' functionality will contain all arrays (clothIds, outfitIds, etc.)
    // These arrays are correctly passed to withDefaults to maintain the copied items.
    const trip = withDefaults({ ...tripData, essentials });
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

  async countClothReferences(clothId: string): Promise<number> {
    const trips = await this.getAll();
    return trips.reduce((count, trip) => {
      const inPlanned = Array.isArray(trip.clothIds) && trip.clothIds.includes(clothId);
      const inPacked = Array.isArray(trip.packedClothIds) && trip.packedClothIds.includes(clothId);
      return inPlanned || inPacked ? count + 1 : count;
    }, 0);
  },

  async removeClothReferences(clothId: string): Promise<number> {
    const trips = await this.getAll();
    const updates: Trip[] = [];

    for (const trip of trips) {
      const clothIds = (trip.clothIds || []).filter((id) => id !== clothId);
      const packedClothIds = (trip.packedClothIds || []).filter((id) => id !== clothId);
      if (clothIds.length !== (trip.clothIds || []).length || packedClothIds.length !== (trip.packedClothIds || []).length) {
        updates.push({ ...trip, clothIds, packedClothIds });
      }
    }

    if (updates.length > 0) {
      await StorageService.bulkUpdate(StorageService.KEYS.TRIPS, updates);
    }

    return updates.length;
  },

  async addItems(
    id: string,
    { clothIds = [], outfitIds = [], replaceIndividuals = false }: { clothIds?: string[]; outfitIds?: string[]; replaceIndividuals?: boolean }
  ): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const currentClothIds = replaceIndividuals
      ? [...clothIds]
      : Array.from(new Set([...(trip.clothIds || []), ...clothIds]));
    const outfitSet = new Set(trip.outfitIds || []);
    outfitIds.forEach((oid) => outfitSet.add(oid));
    return this.update(id, {
      clothIds: currentClothIds,
      outfitIds: Array.from(outfitSet),
    });
  },

  async removeItem(
    id: string,
    entityId: string,
    type: 'cloth' | 'outfit' = 'cloth',
    options: { outfitClothIds?: string[] } = {}
  ): Promise<Trip | null> {
    if (type === 'cloth') {
      return this.removeCloth(id, entityId);
    }
    return this.removeOutfit(id, entityId, options.outfitClothIds);
  },

  async removeCloth(id: string, clothId: string): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    return this.update(id, {
      clothIds: (trip.clothIds || []).filter((x) => x !== clothId),
      packedClothIds: (trip.packedClothIds || []).filter((x) => x !== clothId),
    });
  },

  async removeOutfit(id: string, outfitId: string, outfitClothIds: string[] = []): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const packedClothIds = outfitClothIds.length
      ? (trip.packedClothIds || []).filter((cid) => !outfitClothIds.includes(cid))
      : trip.packedClothIds || [];
    return this.update(id, {
      outfitIds: (trip.outfitIds || []).filter((x) => x !== outfitId),
      packedOutfitIds: (trip.packedOutfitIds || []).filter((x) => x !== outfitId),
      packedClothIds,
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

  async bulkTogglePacked(id: string, clothIds: string[]): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const set = new Set(trip.packedClothIds || []);
    const allPacked = clothIds.every((cid) => set.has(cid));
    if (allPacked) {
      clothIds.forEach((cid) => set.delete(cid));
    } else {
      clothIds.forEach((cid) => set.add(cid));
    }
    return this.update(id, { packedClothIds: Array.from(set) });
  },

  async clearAll(): Promise<void> {
    await StorageService.clear(StorageService.KEYS.TRIPS);
  },

  async addCustomEssential(id: string, label: string): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const trimmed = label.trim();
    if (!trimmed) return trip;
    const exists = (trip.essentials || []).some((item) => item.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) return trip;
    const essential: TripEssential = {
      id: uuid(),
      label: trimmed,
      packed: false,
      isCustom: true,
    };
    const essentials = [...(trip.essentials || []), essential];
    return this.update(id, { essentials });
  },

  async addEssentialFromMaster(id: string, item: EssentialItem): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const exists = (trip.essentials || []).some(
      (essential) => essential.sourceId === item.id || essential.label.toLowerCase() === item.label.toLowerCase()
    );
    if (exists) return trip;
    const essential: TripEssential = {
      id: uuid(),
      label: item.label,
      packed: false,
      sourceId: item.id,
      isCustom: false,
    };
    const essentials = [...(trip.essentials || []), essential];
    return this.update(id, { essentials });
  },

  async removeEssential(id: string, essentialId: string): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const essentials = (trip.essentials || []).filter((item) => item.id !== essentialId);
    return this.update(id, { essentials });
  },

  async toggleEssentialPacked(id: string, essentialId: string): Promise<Trip | null> {
    const trip = await this.getById(id);
    if (!trip) return null;
    const essentials = (trip.essentials || []).map((item) =>
      item.id === essentialId ? { ...item, packed: !item.packed } : item
    );
    return this.update(id, { essentials });
  },

};

