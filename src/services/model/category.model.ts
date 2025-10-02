export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  maxWearCount: number;
  icon: string;
  createdAt: string;
  isHidden: boolean;
  defaultProperties?: {
    requiresPressing?: boolean;
    season?: string;
  };
}
