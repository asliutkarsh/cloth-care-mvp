import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react'
import { CategoryService } from '../../services'
// import { AdvancedAnalyticsService } from '../../services'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

export default function CategoriesView({ onBack }) {
  const [categories, setCategories] = useState([])
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)

  const [modalData, setModalData] = useState({
    parentId: null,
    id: null,
    name: '',
    maxWearCount: 2,
  })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [reassignTarget, setReassignTarget] = useState(null)
  const [reassignCategoryId, setReassignCategoryId] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    setCategories(CategoryService.getAll())
  }

  const getEffectiveMaxWearCount = (parentId) => {
    if (!parentId) return 2
    return CategoryService.getMaxWearCount(parentId)
  }

  // open create/edit form
  const openFormModal = (parentId = null, category = null) => {
    if (category) {
      setModalData({
        id: category.id,
        parentId: category.parentId || null,
        name: category.name,
        maxWearCount:
          category.maxWearCount ?? getEffectiveMaxWearCount(category.parentId),
      })
    } else {
      setModalData({
        id: null,
        parentId,
        name: '',
        maxWearCount: getEffectiveMaxWearCount(parentId),
      })
    }
    setErrors({})
    setShowFormModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!modalData.name.trim()) errs.name = 'Name is required'
    if (!modalData.maxWearCount || parseInt(modalData.maxWearCount) < 1) {
      errs.maxWearCount = 'Max wears must be at least 1'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const payload = {
      name: modalData.name.trim(),
      parentId: modalData.parentId,
      maxWearCount: parseInt(modalData.maxWearCount),
    }

    if (modalData.id) {
      CategoryService.update(modalData.id, payload)
    } else {
      CategoryService.create(payload)
    }

    setShowFormModal(false)
    loadCategories()
  }

  const openDeleteModal = (category) => {
    const count = 3
    //  AdvancedAnalyticsService.getNumberOfClothesByCategory(
    //   category.id,
    //   getSubcategories(category.id)
    // )
    console.log('Count:', count)
    if (count > 0) {
      setReassignTarget(category)
      setShowReassignModal(true)
    } else {
      setDeleteTarget(category)
      setShowDeleteModal(true)
    }
  }

  const handleDelete = () => {
    if (deleteTarget) {
      CategoryService.delete(deleteTarget.id)
      loadCategories()
    }
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  const handleReassignAndDelete = () => {
    if (!reassignCategoryId) return
    // Move clothes logic
    const subcategories = getSubcategories(reassignTarget.id)
    const categoryIds = [
      reassignTarget.id,
      ...subcategories.map((cat) => cat.id),
    ]
    // AdvancedAnalyticsService.moveClothesToCategory(
    //   categoryIds,
    //   reassignCategoryId
    // )
    for (const categoryId of categoryIds) {
      CategoryService.delete(categoryId)
    }
    loadCategories()
    setShowReassignModal(false)
    setReassignTarget(null)
    setReassignCategoryId('')
  }

  const getSubcategories = (parentId) =>
    categories.filter((cat) => cat.parentId === parentId)

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <Button onClick={() => openFormModal()} className="ml-auto gap-2">
            <Plus size={16} />
            <span className="hidden md:inline">Add Category</span>
          </Button>
        </div>

        {/* Category list */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .filter((c) => !c.parentId)
              .map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50"
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openFormModal(null, category)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(category)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Max wear count */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Wears
                    </label>
                    <Input
                      type="number"
                      value={category.maxWearCount || ''}
                      onChange={(e) =>
                        CategoryService.update(category.id, {
                          maxWearCount: parseInt(e.target.value),
                        }) || loadCategories()
                      }
                      min="1"
                      max="10"
                    />
                  </div>

                  {/* Subcategories */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subcategories
                      </span>
                      <Button
                        onClick={() => openFormModal(category.id)}
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {getSubcategories(category.id).map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between bg-blue-100/50 dark:bg-blue-900/30 px-2 py-1 rounded-lg"
                        >
                          <div>
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              {sub.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              (max{' '}
                              {sub.maxWearCount ??
                                getEffectiveMaxWearCount(category.id)}
                              )
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openFormModal(category.id, sub)}
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-blue-500"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              onClick={() => openDeleteModal(sub)}
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {getSubcategories(category.id).length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          No subcategories
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={
          modalData.id
            ? 'Edit Category'
            : modalData.parentId
            ? 'Add Subcategory'
            : 'Add Category'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter name"
              value={modalData.name}
              onChange={(e) =>
                setModalData({ ...modalData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max Wear Count"
              min="1"
              max="10"
              value={modalData.maxWearCount}
              onChange={(e) =>
                setModalData({ ...modalData, maxWearCount: e.target.value })
              }
            />
            {errors.maxWearCount && (
              <p className="text-xs text-red-500 mt-1">{errors.maxWearCount}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deleteTarget?.name}</span>?
        </p>
      </Modal>

      {/* Reassign Clothes Modal */}
      <Modal
        open={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Clothes"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowReassignModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={!reassignCategoryId}
              onClick={handleReassignAndDelete}
            >
              Reassign & Delete
            </Button>
          </div>
        }
      >
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <span className="font-semibold">{reassignTarget?.name}</span> has
          clothes assigned. Please select a new category to move them before
          deleting.
        </p>
        <select
          className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          value={reassignCategoryId}
          onChange={(e) => setReassignCategoryId(e.target.value)}
        >
          <option value="">Select new category</option>
          {categories
            .filter((c) => c.id !== reassignTarget?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </Modal>
    </div>
  )
}
