import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToast } from '../../context/ToastProvider.jsx';
import { Camera, Upload, Loader2, ArrowLeft, ArrowRight, Trash2, Palette } from 'lucide-react';
import imageCompression from 'browser-image-compression';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { getCurrencySymbol } from '../../utils/formatting';


// --- Reusable Animated Switch ---
const AnimatedSwitch = ({ isSelected, onToggle }) => (
  <button type="button" onClick={onToggle} className={`flex w-10 h-6 rounded-full items-center transition-colors ${isSelected ? 'bg-primary-500 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}>
    <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
  </button>
);

// --- Default Presets and Helpers ---
const DEFAULT_COLOR_PRESETS = [ { name: 'Charcoal', value: '#1f2933' }, { name: 'Midnight', value: '#111827' }, { name: 'Navy', value: '#1e3a8a' }, { name: 'Royal', value: '#2563eb' }, { name: 'Sky', value: '#38bdf8' }, { name: 'Mint', value: '#34d399' }, { name: 'Olive', value: '#4d7c0f' }, { name: 'Sand', value: '#d6b27f' }, { name: 'Blush', value: '#f472b6' }, { name: 'Ruby', value: '#f87171' }, { name: 'Sun', value: '#fbbf24' }, { name: 'Slate', value: '#94a3b8' }];
const seasons = ['All Season', 'Spring', 'Summer', 'Fall', 'Winter'];
const flattenCategories = (categories = [], level = 0) => {
  let options = [];
  for (const category of categories) {
    options.push({ value: category.id, label: `${'—'.repeat(level)} ${category.name}` });
    if (category.children?.length) {
      options = options.concat(flattenCategories(category.children, level + 1));
    }
  }
  return options;
};


export default function ClothModal({ open, onClose, onSubmit, initialData = null }) {
  const { categories = [] } = useWardrobeStore();
  const { preferences } = useSettingsStore();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [direction, setDirection] = useState(1);
  const [showCustomColor, setShowCustomColor] = useState(false);

  const colorPresets = useMemo(() => preferences?.colorPresets || DEFAULT_COLOR_PRESETS, [preferences]);
  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const selectedColorName = useMemo(() => {
    if (!form.color) return '';
    const preset = colorPresets.find(p => p.value === form.color);
    return preset ? preset.name : form.color.toUpperCase();
  }, [form.color, colorPresets]);

  useEffect(() => {
    if (open) {
      const base = initialData || {};
      setForm({
        name: base.name || '',
        categoryId: base.categoryId || '',
        color: base.color || '',
        image: base.image || null,
        description: base.description || '',
        brand: base.brand || '',
        material: base.material || '',
        season: base.season || '',
        cost: base.cost != null ? String(base.cost) : '',
        purchaseDate: base.purchaseDate || '',
        requiresPressing: !!base.requiresPressing,
      });
      setErrors({});
      setImagePreview(base.image || null);
      setIsSaving(false);
      setShowCustomColor(false);
      setStep(1);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, initialData]);

  const handleChange = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) { setErrors(prev => ({...prev, [field]: null})); } };
  const handleImageUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 });
        const reader = new FileReader();
        reader.onloadend = () => { setImagePreview(reader.result); handleChange('image', reader.result); };
        reader.readAsDataURL(compressedFile);
      } catch (error) { addToast('Image compression failed.', { type: 'error' }); }
  };
  const handleRemoveImage = () => { if (fileInputRef.current) fileInputRef.current.value = ''; setImagePreview(null); handleChange('image', null); };
  
  const validateStep = (currentStep) => {
    const nextErrors = {};
    if (currentStep === 1) {
      if (!form.name.trim()) nextErrors.name = 'Please enter a name.';
      if (!form.categoryId) nextErrors.categoryId = 'Select a category.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => { if (step === 1 && !validateStep(1)) return; setDirection(1); setStep(s => s + 1); };
  const handleBack = () => { setDirection(-1); setStep(s => s - 1); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) { setStep(1); return; }
    setIsSaving(true);
    const payload = { ...initialData, ...form, cost: form.cost ? parseFloat(form.cost) : undefined };
    try {
      await onSubmit(payload);
      addToast(`Item ${initialData ? 'updated' : 'added'} successfully!`, { type: 'success' });
      onClose();
    } catch (error) { addToast('Could not save item.', { type: 'error' }); console.error(error); }
    finally { setIsSaving(false); }
  };

  const wizardVariants = { enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }) };

  const wizardFooter = (
    <div className="flex justify-between items-center">
        <div><span className="text-sm text-gray-500">Step {step} of 2</span></div>
        <div className="flex gap-3">
            {step > 1 && <Button type="button" variant="secondary" onClick={handleBack}><ArrowLeft size={16} className="mr-2"/> Back</Button>}
            {step < 2 ? <Button type="button" onClick={handleNext}>Next <ArrowRight size={16} className="ml-2"/></Button> : <Button type="button" onClick={handleSubmit} disabled={isSaving}>{isSaving ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : 'Save Changes'}</Button>}
        </div>
    </div>
  );

  return (
    <Modal open={open} onClose={() => { onClose(); setTimeout(() => setStep(1), 300); }} title={initialData ? 'Edit Item' : 'Add New Item'} size="3xl" footer={wizardFooter}>
        <div className="relative overflow-x-hidden">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div key={step} custom={direction} variants={wizardVariants} initial="enter" animate="center" exit="exit" transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }} className="space-y-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                            <section className="space-y-3">
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-center justify-center relative">
                                    {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={40} className="text-gray-400" />}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Upload</Button>
                                    {imagePreview && <Button type="button" variant="danger-ghost" onClick={handleRemoveImage}><Trash2 size={16} /> Remove</Button>}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </section>
                            <section className="space-y-4">
                                <div><label>Name<span className="text-red-500">*</span></label><Input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g., Blue Cotton Shirt" error={!!errors.name} />{errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}</div>
                                <div><label>Category<span className="text-red-500">*</span></label><Select value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)} error={!!errors.categoryId}><option value="" disabled className="bg-white dark:bg-gray-800">Select a category</option>{(categoryOptions || []).map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 text-black dark:text-white">{opt.label}</option>)}</Select>{errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}</div>
                                <div className="md:col-span-2 flex items-center justify-between p-4 glass-card rounded-xl">
                                    <div><p className="font-medium">Requires Pressing</p><p className="text-sm text-gray-500">Flag if this item needs extra care.</p></div>
                                    <AnimatedSwitch isSelected={form.requiresPressing} onToggle={() => handleChange('requiresPressing', !form.requiresPressing)} />
                                </div>

                            </section>
                        </div>
                    )}
                    {step === 2 && (
                        <section className="space-y-6">
                            <div>
                                <label className="mb-2 block font-medium">Color {selectedColorName && <span className="text-gray-500 font-normal ml-2">{selectedColorName}</span>}</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {colorPresets.map(p => <button key={p.value} type="button" onClick={() => {handleChange('color', p.value); setShowCustomColor(false);}} className={`h-9 w-9 rounded-full border-2 transition-all ${form.color === p.value ? 'border-primary-500 ring-2 ring-primary-500' : 'border-white dark:border-gray-700'}`} style={{ backgroundColor: p.value }} title={p.name} />)}
                                    <Button type="button" variant={showCustomColor ? "primary" : "outline"} size="sm" onClick={() => setShowCustomColor(!showCustomColor)} className="h-9 w-9 p-0"><Palette size={16}/></Button>
                                    <AnimatePresence>{showCustomColor && (<motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center gap-2 overflow-hidden"><div className="flex items-center gap-2 rounded-lg p-2 glass-card"><input type="color" value={form.color || '#ffffff'} onChange={e => handleChange('color', e.target.value)} className="w-10 h-10 p-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer" /><Input value={form.color} onChange={e => handleChange('color', e.target.value)} placeholder="#RRGGBB" className="w-28"/></div></motion.div>)}</AnimatePresence>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div><label>Brand</label><Input value={form.brand} onChange={e => handleChange('brand', e.target.value)} placeholder="e.g., Uniqlo" /></div>
                                <div><label>Material</label><Input value={form.material} onChange={e => handleChange('material', e.target.value)} placeholder="e.g., 100% Cotton" /></div>
                                <div><label>Season</label><Select value={form.season} onChange={(e) => handleChange('season', e.target.value)}><option value="" className="bg-white dark:bg-gray-800">Choose season</option>{seasons.map((season) => (<option key={season} value={season} className="bg-white dark:bg-gray-800 text-black dark:text-white">{season}</option>))}</Select></div>
                                <div><label>Cost</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 text-sm">{preferences?.currency ? getCurrencySymbol(preferences.currency) : '$'}</span></div><Input type="number" min="0" value={form.cost} onChange={e => handleChange('cost', e.target.value)} placeholder="0.00" className="pl-7" /></div></div>
                                <div className="md:col-span-2"><label>Purchase Date</label><Input type="date" value={form.purchaseDate} onChange={e => handleChange('purchaseDate', e.target.value)} /></div>
                            </div>
                        </section>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    </Modal>
  );
}