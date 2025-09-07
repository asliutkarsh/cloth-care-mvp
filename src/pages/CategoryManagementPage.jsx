import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWardrobeStore } from '../stores/useWardrobeStore'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Button } from '../components/ui'
import CategoryItem from '../components/categories/CategoryItem'
import CategoryModal from '../components/modal/CategoryModal'
import ConfirmationModal from '../components/modal/ConfirmationModal'

const getRecursiveItemCount = (category, allClothes) => {
  let count = allClothes.filter((c) => c.categoryId === category.id).length;
  if (category.children && category.children.length > 0) {
    count += category.children.reduce(
      (sum, child) => sum + getRecursiveItemCount(child, allClothes),
      0
    );
  }
  return count;
};


export default function CategoryManagementPage() {
  const navigate = useNavigate()
  const {
    categories,
    clothes,
    addCategory,
    addSubCategory,
    updateCategory,
    removeCategory,
    isInitialized,
  } = useWardrobeStore()

  const [modalState, setModalState] = useState({
    open: false,
    mode: null,
    data: null,
  })
  const [confirmState, setConfirmState] = useState({
    open: false,
    categoryId: null,
  })

  const handleOpenModal = (mode, data = null) => {
    setModalState({ open: true, mode, data })
  }

  const handleCloseModal = () => {
    setModalState({ open: false, mode: null, data: null })
  }

  const handleSubmitModal = (formData) => {
    const { mode, data } = modalState
    if (mode === 'addTopLevel') {
      addCategory(formData)
    } else if (mode === 'addSub') {
      addSubCategory(data.parentId, formData)
    } else if (mode === 'edit') {
      updateCategory(data.id, formData)
    }
  }

  const handleDelete = (categoryId) => {
    setConfirmState({ open: true, categoryId })
  }

  const confirmDelete = async () => {
    await removeCategory(confirmState.categoryId)
    setConfirmState({ open: false, categoryId: null })
  }

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 dark:text-gray-400">Loading categories...</span>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="glass-card w-full p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold sm:text-2xl">Manage Categories</h1>
          </div>
          <Button onClick={() => handleOpenModal('addTopLevel')}>
            <PlusCircle size={16} className="mr-2" />
            Add Category
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryItem
                  key={category.id} 
                  category={category} 
                  allClothes={clothes} // Pass all clothes down
                  getRecursiveItemCount={getRecursiveItemCount} // Pass the function down
                  onEdit={(cat) => handleOpenModal('edit', cat)} 
                  onDelete={handleDelete} 
                  onAddSub={(parentId) => handleOpenModal('addSub', { parentId })} 
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No categories found. Add one to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      <CategoryModal
        open={modalState.open}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        initialData={modalState.mode === 'edit' ? modalState.data : null}
      />

      <ConfirmationModal
        open={confirmState.open}
        onClose={() => setConfirmState({ open: false, categoryId: null })}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This cannot be undone."
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  )
}
