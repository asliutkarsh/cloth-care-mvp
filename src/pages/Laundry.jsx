import React, { useEffect, useState } from 'react';
import { useLaundryStore } from '../stores/useLaundryStore';
import LaundryList from '../components/laundry/LaundryList';
import { WashingMachine, Sheet, CheckCircle2 } from 'lucide-react';
import LaundrySkeleton from '../components/skeleton/LaundrySkeleton';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = {
  WASHING: 'washing',
  PRESSING: 'pressing',
};

export default function Laundry() {
  const { dirtyClothes, needsPressing, washSelected, pressSelected, isInitialized, fetchStatus } = useLaundryStore();
  const [activeTab, setActiveTab] = useState(TABS.WASHING);

  useEffect(() => {
      fetchStatus();
  }, [fetchStatus]);

  if (!isInitialized) {
    return <LaundrySkeleton />;
  }

  const allCaughtUp = dirtyClothes.length === 0 && needsPressing.length === 0;

  const animationContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const animationItem = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <main className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <motion.div variants={animationContainer} initial="hidden" animate="visible">
        <motion.header variants={animationItem} className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <WashingMachine /> Laundry Day
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Tackling the laundry</p>
        </motion.header>

        {allCaughtUp ? (
          <motion.div variants={animationItem} className="text-center py-16 px-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">All Caught Up!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Your laundry basket is empty. Great job! ✨</p>
          </motion.div>
        ) : (
          <>
            {/* --- Overview Card --- */}
            <motion.div variants={animationItem} className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-3xl font-bold">{dirtyClothes.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Items to Wash</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-3xl font-bold">{needsPressing.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Items to Press</p>
              </div>
            </motion.div>

            {/* --- Tab Navigation --- */}
            <motion.div variants={animationItem} className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <TabButton
                label="Needs Washing"
                icon={<WashingMachine size={16} />}
                isActive={activeTab === TABS.WASHING}
                onClick={() => setActiveTab(TABS.WASHING)}
              />
              <TabButton
                label="Needs Pressing"
                // Corrected: Using the 'Sheet' icon component
                icon={<Sheet size={16} />}
                isActive={activeTab === TABS.PRESSING}
                onClick={() => setActiveTab(TABS.PRESSING)}
              />
            </motion.div>

            {/* --- Tab Content --- */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === TABS.WASHING && (
                  <LaundryList
                    title="Dirty Clothes"
                    items={dirtyClothes}
                    actionText="Wash Selected"
                    onAction={washSelected}
                  />
                )}
                {activeTab === TABS.PRESSING && (
                  <LaundryList
                    title="Needs Pressing"
                    items={needsPressing}
                    actionText="Press Selected"
                    onAction={pressSelected}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </main>
  );
}

// A reusable TabButton component for our new interface
const TabButton = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors">
    {isActive ? <span className="text-primary-500">{icon}</span> : <span className="text-gray-500">{icon}</span>}
    <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}>
      {label}
    </span>
    {isActive && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" layoutId="underline" />}
  </button>
);