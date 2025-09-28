import React, { useEffect } from 'react';
import { useLaundryStore } from '../stores/useLaundryStore';
import LaundryList from '../components/laundry/LaundryList';
import { WashingMachine } from 'lucide-react';
import LaundrySkeleton from '../components/skeleton/LaundrySkeleton';

export default function Laundry() {
  const { 
    dirtyClothes, 
    needsPressing, 
    fetchStatus, 
    washSelected, 
    pressSelected, 
    isInitialized 
  } = useLaundryStore();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!isInitialized) {
    return <LaundrySkeleton />;
  }

  return (
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <WashingMachine /> Laundry Day
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your dirty and needs-pressing clothes.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LaundryList
          title="Dirty Clothes"
          items={dirtyClothes}
          actionText="Wash Selected"
          onAction={washSelected}
        />
        <LaundryList
          title="Needs Pressing"
          items={needsPressing}
          actionText="Press Selected"
          onAction={pressSelected}
        />
      </div>
    </main>
  );
}