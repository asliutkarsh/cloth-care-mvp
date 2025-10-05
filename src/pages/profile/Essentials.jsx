import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, X, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui';
import { EssentialsService } from '../../services/crud';
import { useToast } from '../../context/ToastProvider';

export default function Essentials() {
  const [essentials, setEssentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEssential, setNewEssential] = useState('');
  const [editing, setEditing] = useState({ id: null, value: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const editInputRef = useRef(null);

  const fetchEssentials = useCallback(async () => {
    try {
      setLoading(true);
      const items = await EssentialsService.getAll();
      setEssentials(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      addToast('Could not load essentials.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEssentials();
  }, [fetchEssentials]);

  useEffect(() => {
    if (editing.id && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editing.id]);

  const handleAddEssential = async (e) => {
    e.preventDefault();
    const label = newEssential.trim();
    if (!label || isSaving) return;

    setIsSaving(true);
    try {
      await EssentialsService.add(label);
      setNewEssential('');
      await fetchEssentials();
      addToast('Essential added!', { type: 'success' });
    } catch (error) {
      addToast(error.message || 'Failed to add essential.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEssential = async (id) => {
    const label = editing.value.trim();
    if (!label || isSaving) return;

    setIsSaving(true);
    try {
      await EssentialsService.update(id, { label });
      setEditing({ id: null, value: '' });
      await fetchEssentials();
      addToast('Essential updated!', { type: 'success' });
    } catch (error) {
      addToast(error.message || 'Failed to update essential.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEssential = async (id) => {
    setIsSaving(true);
    try {
      await EssentialsService.remove(id);
      await fetchEssentials();
      addToast('Essential removed.', { type: 'success' });
    } catch (error) {
      addToast(error.message || 'Failed to remove essential.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const startEditing = (item) => setEditing({ id: item.id, value: item.label });
  const cancelEditing = () => setEditing({ id: null, value: '' });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-4 pb-24 sm:p-6"
    >
      <header className="flex items-center gap-2 mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full" aria-label="Go back">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Packing Essentials</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your default packing list.</p>
        </div>
      </header>

      <div className="glass-card p-4 rounded-xl">
        <form onSubmit={handleAddEssential} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={newEssential}
            onChange={(e) => setNewEssential(e.target.value)}
            placeholder="Add new item (e.g., Passport)"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
          />
          <Button type="submit" disabled={!newEssential.trim() || isSaving} className="flex items-center justify-center gap-2">
            <Plus size={18} /> Add
          </Button>
        </form>

        {loading ? (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">Loading essentials...</div>
        ) : essentials.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Your packing essentials list is empty.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {essentials.map(item => (
              <li key={item.id} className="flex items-center justify-between gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700">
                {editing.id === item.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateEssential(item.id)}
                    onBlur={() => handleUpdateEssential(item.id)}
                    className="flex-1 p-1 -m-1 border-b-2 border-primary-500 bg-transparent focus:outline-none"
                  />
                ) : (
                  <span className="flex-1 text-gray-800 dark:text-gray-200">{item.label}</span>
                )}
                <div className="flex items-center gap-1">
                  {editing.id === item.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateEssential(item.id)} disabled={isSaving} aria-label="Save"><Check size={18} className="text-green-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={cancelEditing} disabled={isSaving} aria-label="Cancel"><X size={18} /></Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => startEditing(item)} disabled={isSaving} aria-label="Edit"><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEssential(item.id)} disabled={isSaving} aria-label="Delete"><Trash2 size={16} className="text-red-500" /></Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}