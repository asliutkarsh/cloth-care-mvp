import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useInsightsStore } from '../stores/useInsightsStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { INSIGHT_MODULES } from '../components/insights/insightsConfig';
import { formatPrice } from '../utils/formatting';
import { Button } from '../components/ui';
import { Settings, RefreshCw, Gem, Activity, DollarSign } from 'lucide-react';

// --- Helper Functions & Reusable Components ---

const formatCurrency = (value = 0, currency = 'INR') => formatPrice(value, currency, true, 0);
const formatCPW = (value = 0, currency = 'INR') => formatPrice(value, currency, false, 2);
const getActiveModules = (selectedIds = []) => INSIGHT_MODULES.filter(m => selectedIds.includes(m.id));
const PIE_COLORS = ['#8B5CF6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    return (
      <div className="p-2 text-sm bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold">{label || data.label}</p>
        <p className="text-primary-500">{data.isCurrency ? formatCurrency(value, currency) : `Value: ${value}`}</p>
      </div>
    );
  }
  return null;
};

const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-primary-500 dark:text-primary-400">{icon}</div>
        <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
    </div>
);

const ModuleCard = ({ title, children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className={`glass-card h-full p-4 sm:p-6 rounded-2xl ${className}`}
    >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </motion.div>
);

const StatCard = ({ label, value }) => (
    <div className="glass-card p-4 rounded-xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

// --- Main Insights Page Component ---

export default function Insights() {
  const navigate = useNavigate();
  const { preferences, fetchPreferences } = useSettingsStore();
  const { data, isLoading, error, refresh, initialize } = useInsightsStore();

  useEffect(() => {
    if (!preferences) fetchPreferences();
    initialize();
  }, [preferences, fetchPreferences, initialize]);

  const activeModuleIds = useMemo(() => 
    new Set(preferences?.insightsModules?.selected || []),
    [preferences]
  );
  
  if (isLoading || !data) return <div>Loading Insights...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // --- FIX: Added 'wearTrend' back to the destructuring ---
  const { summary, categoryBreakdown = [], colorPalette = [], brandDistribution = [], fabricFocus = [], newestAdditions = [], wearTrend = [], goToItems = {}, valueAndSustainability = {}, financial = {} } = data;
  
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-16">
      {/* --- Main Header --- */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
            <h1 className="text-4xl font-extrabold mb-2">Wardrobe Insights</h1>
            <p className="text-gray-600 dark:text-gray-400">Your style dashboard.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Items" value={summary.totalClothes} />
            <StatCard label="Total Outfits" value={summary.totalOutfits} />
            <StatCard label="Closet Value" value={formatCurrency(summary.totalWardrobeValue, preferences?.currency)} />
            <StatCard label="Avg. Cost/Wear" value={formatCPW(summary.averageCostPerWear, preferences?.currency)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <Button onClick={refresh}><RefreshCw size={16} className="mr-2"/> Refresh</Button>
            <Button variant="secondary" onClick={() => navigate('/settings/insights')}><Settings size={16} className="mr-2"/> Customize Dashboard</Button>
        </div>
      </motion.header>

      {/* --- Section 1: Closet Composition --- */}
      <section className="space-y-6">
        <SectionHeader icon={<Gem size={24}/>} title="Closet Composition" subtitle="A look at what your wardrobe is made of." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModuleIds.has('categoryBreakdown') && <ModuleCard title="Category Mix"><ResponsiveContainer width="100%" height={250}><BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 20 }}><XAxis type="number" hide /><YAxis dataKey="label" type="category" width={80} tickLine={false} axisLine={false} className="text-xs"/><Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} /><Bar dataKey="value" fill="var(--color-primary)" radius={[0, 8, 8, 0]} barSize={16} /></BarChart></ResponsiveContainer></ModuleCard>}
            {activeModuleIds.has('colorPalette') && <ModuleCard title="Signature Palette"><div className="flex flex-wrap gap-4 items-center">{colorPalette.slice(0, 10).map(c => <div key={c.label} className="text-center group"><div className="w-10 h-10 rounded-full mb-1 border-2 border-white dark:border-gray-700 shadow-md group-hover:scale-110 transition-transform" style={{backgroundColor: c.label}}></div><p className="text-xs text-gray-500">{c.value}</p></div>)}</div></ModuleCard>}
            {activeModuleIds.has('brandDistribution') && <ModuleCard title="Brands You Love"><ul className="space-y-3">{brandDistribution.slice(0, 5).map(b => <li key={b.label} className="flex justify-between text-sm items-center"><span>{b.label}</span><strong className="tag">{b.value} items</strong></li>)}</ul></ModuleCard>}
            {activeModuleIds.has('fabricFocus') && <ModuleCard title="Fabric Focus"><div className="flex flex-wrap gap-2">{fabricFocus.map(f => <span key={f.label} className="tag">{f.label} ({f.value})</span>)}</div></ModuleCard>}
            {activeModuleIds.has('newestAdditions') && <ModuleCard title="Newest Additions"><ul className="space-y-3">{newestAdditions.slice(0, 5).map(item => <li key={item.id} className="text-sm"><strong>{item.name}</strong><p className="text-xs text-gray-500">Added {new Date(item.createdAt).toLocaleDateString()}</p></li>)}</ul></ModuleCard>}
        </div>
      </section>
      
      {/* --- Section 2: Wear & Usage Patterns --- */}
      <section className="space-y-6">
        <SectionHeader icon={<Activity size={24}/>} title="Wear & Usage Patterns" subtitle="How you interact with your clothes." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModuleIds.has('topGoToItems') && <ModuleCard title="Your Go-To Items"><ul className="space-y-2">{goToItems.top?.slice(0, 5).map(({cloth, count}) => <li key={cloth.id} className="flex justify-between text-sm items-center"><span>{cloth.name}</span><strong className="tag">{count} wears</strong></li>)}</ul></ModuleCard>}
            {activeModuleIds.has('wearTrend') && <ModuleCard title="Wear Frequency"><ResponsiveContainer width="100%" height={250}><LineChart data={wearTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="month" className="text-xs" /><YAxis /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></ModuleCard>}
            {activeModuleIds.has('closetGhosts') && <ModuleCard title="Closet Ghosts"><ul className="space-y-2">{valueAndSustainability.closetGhosts?.slice(0,5).map(({cloth}) => <li key={cloth.id} className="text-sm">{cloth.name}</li>)}</ul></ModuleCard>}
            {activeModuleIds.has('neverWorn') && <ModuleCard title="Never Worn Items"><ul className="space-y-2">{valueAndSustainability.neverWorn?.slice(0,5).map(c => <li key={c.id} className="text-sm">{c.name}</li>)}</ul></ModuleCard>}
        </div>
      </section>

      {/* --- Section 3: Financial Overview --- */}
      <section className="space-y-6">
        <SectionHeader icon={<DollarSign size={24}/>} title="Financial Overview" subtitle="Understanding the value of your wardrobe." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModuleIds.has('spendByCategory') && <ModuleCard title="Investment by Category"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={financial.categorySpend} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>{(financial.categorySpend || []).map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip currency={preferences?.currency} />} /></PieChart></ResponsiveContainer></ModuleCard>}
            {activeModuleIds.has('financialOverview') && <ModuleCard title="Financial Snapshot"><div className="space-y-3 text-sm"><div><p className="text-gray-500">Avg. Price/Item</p><strong>{formatCurrency(financial.averagePrice, preferences?.currency)}</strong></div>{financial.mostExpensiveItem && <div><p className="text-gray-500">Most Expensive</p><strong>{financial.mostExpensiveItem.cloth.name}</strong></div>}</div></ModuleCard>}
            {activeModuleIds.has('valueLeaders') && <ModuleCard title="Best Value Items"><ul className="space-y-2">{valueAndSustainability.workhorseItems?.slice(0,3).map(i => <li key={i.cloth.id} className="text-sm flex justify-between"><span>{i.cloth.name}</span> <strong className="tag-green">{formatCPW(i.costPerWear, preferences?.currency)}/wear</strong></li>)}</ul></ModuleCard>}
            {activeModuleIds.has('sustainabilityScore') && <ModuleCard title="Sustainability Score" className="flex flex-col justify-center items-center text-center"><div className="text-5xl font-bold text-green-500">{valueAndSustainability.sustainabilityScore ?? 0}</div><p className="text-xs text-gray-500 mt-2">A high score means you re-wear items often. Aim for 70+.</p></ModuleCard>}
        </div>
      </section>
    </main>
  );
}