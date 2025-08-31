import React from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function CategoriesView({
    onBack,
    categories,
    addCategory,
    deleteCategory,
    addSubcategory,
    updateWearCycle,
}) {
    return (
        <div className="max-w-6xl mx-auto p-4 pb-24">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <button
                        onClick={addCategory}
                        className="ml-auto flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        <span className="hidden md:inline">Add Category</span>
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                                    <button onClick={() => deleteCategory(category.id)} className="p-1 text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wear Cycle</label>
                                    <input
                                        type="number"
                                        value={category.wearCycle}
                                        onChange={(e) => updateWearCycle(category.id, e.target.value)}
                                        min="1"
                                        max="10"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategories</span>
                                        <button
                                            onClick={() => addSubcategory(category.id)}
                                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {category.subcategories.map((sub, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                            >
                                                {sub}
                                            </span>
                                        ))}
                                        {category.subcategories.length === 0 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">No subcategories</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
