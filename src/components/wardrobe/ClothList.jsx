import React from 'react';
import ClothCard from './ClothCard';
import { Shirt } from 'lucide-react';

export default function ClothList({ clothes }) {
  if (clothes.length === 0) {
    return (
      <div className="text-center py-16">
        <Shirt size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold">No Clothes Found</h3>
        <p className="text-gray-500">Try adjusting your search or filters, or add a new item!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {clothes.map(cloth => (
        <ClothCard key={cloth.id} cloth={cloth} />
      ))}
    </div>
  );
}