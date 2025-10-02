export interface Outfit {
  id: string;
  name: string;
  clothIds: string[];
  createdAt: string;
  description?: string;
  tags?: string[];
  occasion?: 'work' | 'casual' | 'formal' | 'sport';
  favorite: boolean;
}
