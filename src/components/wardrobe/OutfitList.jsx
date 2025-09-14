import React from 'react';
import OutfitCard from './OutfitCard';
import { Layers } from 'lucide-react';

export default function OutfitList({ outfits }) {
  if (outfits.length === 0) {
    return (
      <div className="text-center py-16">
        <Layers size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold">No Outfits Found</h3>
        <p className="text-gray-500">Create your first outfit using the action button!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {outfits.map(outfit => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
}