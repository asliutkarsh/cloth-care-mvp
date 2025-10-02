export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  clothIds: string[];
  outfitIds: string[];
  packedClothIds: string[];
  packedOutfitIds: string[];
  notes?: string;
  createdAt: string;
}
