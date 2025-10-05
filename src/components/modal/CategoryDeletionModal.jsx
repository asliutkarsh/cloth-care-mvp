import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, Folder } from 'lucide-react';

export default function CategoryDeletionModal({
  open,
  onClose,
  onConfirm,
  category,
  availableCategories = [],
  clothCount = 0,
  isSubcategory = false,
  parentCategoryName = '',
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    // Auto-select the first available category when modal opens
    if (open && availableCategories.length > 0 && !isSubcategory) {
      setSelectedCategoryId(availableCategories[0].id);
    }
  }, [open, availableCategories, isSubcategory]);

  const handleConfirm = () => {
    if (!isSubcategory && !selectedCategoryId) {
      return; // Don't allow confirmation without selecting a target category
    }

    onConfirm(isSubcategory ? null : selectedCategoryId);
  };

  const getMessage = () => {
    if (isSubcategory) {
      return `This subcategory contains ${clothCount} item${clothCount !== 1 ? 's' : ''}. When deleted, all items will be moved to the parent category "${parentCategoryName}".`;
    }

    return `This category contains ${clothCount} item${clothCount !== 1 ? 's' : ''}. Please choose where to move these items before deleting the category.`;
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Delete Category</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {category?.name || 'Unknown Category'}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {getMessage()}
        </p>

        {!isSubcategory && availableCategories.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Move items to:
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a category...</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {isSubcategory && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <Folder size={18} className="text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Items will be moved to:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {parentCategoryName}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <Button onClick={onClose} variant="secondary" fullWidth>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            fullWidth
            disabled={!isSubcategory && !selectedCategoryId}
          >
            Delete Category
          </Button>
        </div>
      </div>
    </Modal>
  );
}
