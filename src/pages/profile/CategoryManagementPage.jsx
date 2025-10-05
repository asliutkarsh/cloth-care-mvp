import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardrobeStore } from '../../stores/useWardrobeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Folder, ChevronDown, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import CategoryModal from '../../components/modal/CategoryModal';
import CategoryDeletionModal from '../../components/modal/CategoryDeletionModal';
import CategoryManagementSkeleton from '../../components/skeleton/CategoryManagementSkeleton';
import { useToast } from '../../context/ToastProvider';

// --- Reusable Accordion Category Item Component ---
// --- Correct recursive count of all clothes inside a category (including deep children) ---
const getRecursiveItemCount = (category, allClothes) => {
  // Count clothes assigned directly to this category
  let count = allClothes.filter(c => c.categoryId === category.id).length;

  // Recursively add counts from all descendant categories
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      count += getRecursiveItemCount(child, allClothes);
    }
  }

  return count;
};

const CategoryItem = ({ category, allClothes, onEdit, onDelete, onAddSub, isSubItem = false, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const itemCount = getRecursiveItemCount(category, allClothes);


  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50 ${isSubItem ? 'ml-4' : ''}`}
    >
      <div
        className="flex items-center p-3 cursor-pointer"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab mr-2" />
        <span className="text-xl mr-2">{category.icon || '📁'}</span>
        <span className="font-medium flex-1">{category.name}</span>
        <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 mr-3">
          {itemCount}
        </span>
        {hasChildren && (
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 transition-transform" />
          </motion.div>
        )}
        <div className="flex items-center ml-2">
          {depth < 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddSub(category.id); 
              }}
              title="Add Subcategory"
            >
              <Plus size={16} className="text-green-500" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(category); 
            }}
            title="Edit Category"
          >
            <Pencil size={16} className="text-blue-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(category.id); 
            }}
            title="Delete Category"
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-2">
              {category.children.map(child => (
                <CategoryItem
                  key={child.id}
                  category={child}
                  allClothes={allClothes}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSub={onAddSub}
                  isSubItem
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// --- Main Page Component ---
export default function CategoryManagementPage() {
  const navigate = useNavigate();
  const store = useWardrobeStore();
  const { categories, clothes, addCategory, addSubCategory, updateCategory, removeCategory, isInitialized, getAvailableCategoriesForMove } = store;
  const { addToast } = useToast();
  
  // State declarations
  const [modalState, setModalState] = useState({ open: false, mode: null, data: null });
  const [deleteState, setDeleteState] = useState({ open: false, category: null, clothCount: 0, isSubcategory: false, parentCategoryName: '' });

  // Modal handlers
  const handleOpenModal = (mode, data = null) => setModalState({ open: true, mode, data });
  const handleCloseModal = () => setModalState({ open: false, mode: null, data: null });

  const handleSubmitModal = async (formData) => {
    try {
      const { mode, data } = modalState;
      if (mode === 'addTopLevel') {
        await addCategory(formData);
        addToast('Category added successfully', { type: 'success' });
      } else if (mode === 'addSub') {
        await addSubCategory(data.parentId, formData);
        addToast('Subcategory added successfully', { type: 'success' });
      } else if (mode === 'edit') {
        await updateCategory(data.id, formData);
        addToast('Category updated successfully', { type: 'success' });
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving category:', err);
      addToast(err.message || 'An error occurred while saving the category', { type: 'error' });
    }
  };

  const handleDelete = (categoryId) => {

    // Find category in hierarchical structure
    const findCategoryById = (categories, id) => {
      for (const category of categories) {
        if (category.id === id) return category;
        if (category.children) {
          const found = findCategoryById(category.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategoryById(categories, categoryId);
    if (!category) {
      return;
    }

    const categoryClothes = store.getClothesByCategoryId(categoryId);

    // Check what clothes actually have this category ID
    const clothesWithThisCategory = store.clothes.filter(cloth => cloth.categoryId === categoryId);

    // Also check what clothes have the parent category ID (in case clothes are assigned to parent)
    const parentCategoryId = category.parentId;
    const clothesWithParentCategory = store.clothes.filter(cloth => cloth.categoryId === parentCategoryId);

    //Also check clothes from its subcategories
    const subCategories = category.children || [];
    const clothesWithSubCategories = subCategories.reduce((acc, subCategory) => {
      return [...acc, ...store.clothes.filter(cloth => cloth.categoryId === subCategory.id)];
    }, []);

    const clothCount = [...clothesWithThisCategory, ...clothesWithParentCategory, ...clothesWithSubCategories].length;
    const isSubcategory = category.parentId !== null;

    // Find parent category name
    const findParentCategoryName = (categories, parentId) => {

      // First, try to find the parent in the current categories
      for (const category of categories) {
        if (category.id === parentId) {
          return category.name;
        }
      }

      // If not found, check if parentId exists in any category's parentId field
      const allCategoriesFlat = [];
      const flattenCategories = (cats) => {
        for (const cat of cats) {
          allCategoriesFlat.push(cat);
          if (cat.children) {
            flattenCategories(cat.children);
          }
        }
      };
      flattenCategories(categories);

      const parentExists = allCategoriesFlat.some(cat => cat.parentId === parentId);
      return 'Unknown Parent';
    };

    const parentCategoryName = isSubcategory
      ? findParentCategoryName(categories, category.parentId)
      : '';


    setDeleteState({
      open: true,
      category,
      clothCount,
      isSubcategory,
      parentCategoryName
    });
  };
  
  const confirmDelete = async (targetCategoryId = null) => {
    try {
      await removeCategory(deleteState.category.id, targetCategoryId);
      addToast('Category deleted successfully', { type: 'success' });
      setDeleteState({ open: false, category: null, clothCount: 0, isSubcategory: false, parentCategoryName: '' });
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast(err.message || 'An error occurred while trying to delete the category', { type: 'error' });
      setDeleteState({ open: false, category: null, clothCount: 0, isSubcategory: false, parentCategoryName: '' });
    }
  };

  if (!isInitialized) return <CategoryManagementSkeleton />;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <Button
          onClick={() => handleOpenModal('addTopLevel')}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories
          .filter(cat => !cat.parentId)
          .map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              allClothes={clothes}
              onEdit={(cat) => handleOpenModal('edit', cat)}
              onDelete={handleDelete}
              onAddSub={(parentId) => handleOpenModal('addSub', { parentId })}
              depth={0}
            />
          ))}
      </div>

      <CategoryModal
        open={modalState.open}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        initialData={modalState.mode === 'edit' ? modalState.data : null}
      />

      <CategoryDeletionModal
        open={deleteState.open}
        onClose={() => setDeleteState({ open: false, category: null, clothCount: 0, isSubcategory: false, parentCategoryName: '' })}
        onConfirm={confirmDelete}
        category={deleteState.category}
        availableCategories={store.getAvailableCategoriesForMove(deleteState.category?.id)}
        clothCount={deleteState.clothCount}
        isSubcategory={deleteState.isSubcategory}
        parentCategoryName={deleteState.parentCategoryName}
      />
    </div>
  );
}