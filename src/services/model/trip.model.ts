export interface TripEssential {
  id: string;
  label: string;
  packed: boolean;
  sourceId?: string;
  isCustom?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination?: string; 
  startTime?: string;
  endTime?: string;
  clothIds: string[];
  outfitIds: string[];
  packedClothIds: string[];
  packedOutfitIds: string[];
  essentials: TripEssential[];
  notes?: string;
  createdAt: string;
}