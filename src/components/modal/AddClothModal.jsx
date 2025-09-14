import React, { useRef, useState, useEffect } from 'react'
import { useWardrobeStore } from '../../stores/useWardrobeStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  Loader2,
  ChevronsUpDown,
} from 'lucide-react'

// Reusable FormField component for cleaner layout
const FormField = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
)

export default function AddClothModal({ open, onClose }) {
  // --- Get data and actions from the Zustand store ---
  const { categories, addCloth } = useWardrobeStore()

  // --- Local state for the form ---
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef(null)

  const initialFormState = {
    name: '',
    categoryId: '',
    color: '',
    image: null,
    brand: '',
    material: '',
    season: '',
    cost: '',
    purchaseDate: '',
    requiresPressing: false,
  }

  // Effect to reset the form whenever the modal opens
  useEffect(() => {
    if (open) {
      setFormData(initialFormState)
      setErrors({})
      setImagePreview(null)
      setIsLoading(false)
      setShowAdvanced(false)
    }
  }, [open])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData((prev) => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Please enter a name.'
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    await addCloth(formData)
    setIsLoading(false)
    onClose() // Close modal on success
  }

  // Helper to flatten category tree for the select dropdown
  const getCategoryOptions = (categoryList, level = 0) => {
    let options = []
    for (const category of categoryList) {
      options.push({
        value: category.id,
        label: `${'—'.repeat(level)} ${category.name}`,
      })
      if (category.children?.length > 0) {
        options = options.concat(
          getCategoryOptions(category.children, level + 1)
        )
      }
    }
    return options
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Item" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Image Uploader --- */}
        <FormField label="Photo">
          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="upload-box"
              >
                <Upload size={28} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium">Upload</span>
              </button>
              <button type="button" className="upload-box">
                <Camera size={28} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium">Take Photo</span>
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </FormField>

        {/* --- Core Fields --- */}
        <FormField label="Name" error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </FormField>
        <FormField label="Category" error={errors.categoryId}>
          <Select
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {getCategoryOptions(categories).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormField>

        {/* --- Advanced Options --- */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full font-semibold"
          >
            <span>Advanced Options</span>
            <ChevronsUpDown
              size={20}
              className={`transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showAdvanced && (
            <div className="mt-4 space-y-6">
              <FormField label="Color">
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Blue"
                />
              </FormField>

              <FormField label="Brand">
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Nike"
                />
              </FormField>

              <FormField label="Material">
                <Input
                  value={formData.material}
                  onChange={(e) =>
                    handleInputChange('material', e.target.value)
                  }
                  placeholder="e.g., Cotton"
                />
              </FormField>

              <FormField label="Season">
                <Select
                  value={formData.season}
                  onChange={(e) => handleInputChange('season', e.target.value)}
                >
                  <option value="">Select season</option>
                  <option value="All Season">All Season</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </Select>
              </FormField>

              <FormField label="Cost ($)">
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField label="Purchase Date">
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    handleInputChange('purchaseDate', e.target.value)
                  }
                />
              </FormField>
            </div>
          )}

          <FormField label="Requires Pressing">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresPressing}
                onChange={(e) =>
                  handleInputChange('requiresPressing', e.target.checked)
                }
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Yes
              </span>
            </label>
          </FormField>
        </div>

        {/* --- Actions --- */}
        <div className="pt-2 flex gap-3 justify-end">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Adding...
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
