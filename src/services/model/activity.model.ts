export interface ActivityLog {
  id: string;
  date: string;
  time: string;
  type: 'outfit' | 'individual';
  outfitId?: string;
  clothIds?: string[];
  status: 'worn' | 'planned';
  appliedWearCounts: boolean;
  notes?: string;
  createdAt: string;
}
