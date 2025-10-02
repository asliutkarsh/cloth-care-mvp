export type ClothStatus = 'clean' | 'dirty' | 'needs_pressing' | 'needs_repair';

export interface Cloth {
  id: string;
  name: string;
  categoryId: string;
  status: ClothStatus;
  currentWearCount: number;
  totalWearCount: number;
  createdAt: string;
  updatedAt?: string;
  images: string;
  description?: string;
  brand?: string;
  material?: string;
  season?: string;
  color?: string;
  cost?: number;
  purchaseDate?: string;
  requiresPressing: boolean;
  favorite: boolean;
  isArchived: boolean;
  archiveType?: 'donated' | 'lent' | 'storage' | 'other';
  careInstructions?: string;
  linkedItemIds?: string[];
  loanInfo?: {
    to: string;
    returnDate: string;
  };
}
