import React, { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import {
  Camera,
  Upload,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronsUpDown,
} from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { CategoryService } from '../../services'

const FormField = ({ label, id, required, children, className, error }) => (
  <div className={className}>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
)

export default function AddClothModal({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
    customColor: '',
    image: null,
    categoryId: '',
    brand: '',
    material: '',
    season: '',
    cost: '',
    purchaseDate: '',
    requiresPressing: false,
  })
  const [errors, setErrors] = useState({})
  const [showCustomColor, setShowCustomColor] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [categories, setCategories] = useState([])
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setCategories(CategoryService.getAll())
    }
  }, [open])

  // Reset form when opening/closing
  useEffect(() => {
    if (!open) return
    setFormData({
      name: '',
      description: '',
      color: '',
      customColor: '',
      image: null,
      categoryId: '',
      brand: '',
      material: '',
      season: '',
      cost: '',
      purchaseDate: '',
      requiresPressing: false,
    })
    setErrors({})
    setShowCustomColor(false)
    setImagePreview(null)
    setMessage(null)
    setIsLoading(false)
    setShowAdvanced(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }, [open])

  const predefinedColors = [
    'Black',
    'White',
    'Silver',
    'Navy',
    'Blue',
    'SkyBlue',
    'Red',
    'Green',
    'Olive',
    'Brown',
    'Tan',
    'Beige',
    'Pink',
    'Purple',
    'Yellow',
    'Gold',
    'Orange',
    'Maroon',
  ]
  const seasons = ['All Season', 'Spring', 'Summer', 'Fall', 'Winter']

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

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim())
      newErrors.name = 'Please enter a name for the item.'
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    setMessage(null)
    if (!validateForm()) return
    setIsLoading(true)
    const clothData = {
      ...formData,
      color:
        formData.color === 'custom' ? formData.customColor : formData.color,
    }
    setTimeout(() => {
      onAdd?.(clothData)
      setMessage({ type: 'success', text: 'Cloth item added successfully!' })
      setIsLoading(false)
      setTimeout(() => {
        onClose?.()
      }, 600)
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Item" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            role="alert"
            aria-live="polite"
            className={`flex items-center justify-between gap-3 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="space-y-6">
          <FormField label="Photo (Max 5MB)">
            {imagePreview ? (
              <div className="relative group transition-all duration-300 ease-in-out">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg shadow-inner"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                >
                  <Upload
                    size={28}
                    className="text-gray-400 dark:text-gray-500 mb-2"
                  />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Upload from Gallery
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900"
                >
                  <Camera
                    size={28}
                    className="text-gray-400 dark:text-gray-500 mb-2"
                  />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Take Photo
                  </span>
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
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </FormField>

          <FormField label="Name" id="name" required error={errors.name}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              aria-invalid={!!errors.name}
              placeholder="e.g., Blue Cotton T-Shirt"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Category"
              id="category"
              required
              error={errors.categoryId}
            >
              <Select
                id="category"
                value={formData.categoryId}
                onChange={(e) =>
                  handleInputChange('categoryId', e.target.value)
                }
                aria-invalid={!!errors.categoryId}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="requiresPressing"
              className="relative inline-flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                id="requiresPressing"
                checked={formData.requiresPressing}
                onChange={(e) =>
                  handleInputChange('requiresPressing', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Item requires pressing
            </span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-800 dark:text-gray-200"
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
                <FormField label="Description" id="description">
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="e.g., Casual wear, very comfortable"
                  />
                </FormField>
                <FormField label="Color">
                  <div className="flex flex-wrap gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => {
                          handleInputChange('color', color)
                          setShowCustomColor(false)
                        }}
                        className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none ${
                          formData.color === color
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                    <button
                      type="button"
                      title="Custom Color"
                      onClick={() => {
                        handleInputChange('color', 'custom')
                        setShowCustomColor(true)
                      }}
                      className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110 focus:outline-none ${
                        showCustomColor
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full" />
                    </button>
                  </div>
                  {showCustomColor && (
                    <Input
                      value={formData.customColor}
                      onChange={(e) =>
                        handleInputChange('customColor', e.target.value)
                      }
                      placeholder="Enter custom color (e.g., Teal)"
                      className="w-full md:w-1/2 mt-3"
                    />
                  )}
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Brand" id="brand">
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) =>
                        handleInputChange('brand', e.g.target.value)
                      }
                      placeholder="Nike, Zara..."
                    />
                  </FormField>
                  <FormField label="Material" id="material">
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) =>
                        handleInputChange('material', e.target.value)
                      }
                      placeholder="Cotton, Silk..."
                    />
                  </FormField>
                  <FormField label="Season" id="season">
                    <Select
                      id="season"
                      value={formData.season}
                      onChange={(e) =>
                        handleInputChange('season', e.target.value)
                      }
                    >
                      <option value="">Select Season</option>
                      {seasons.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Cost ($)" id="cost">
                    <Input
                      type="number"
                      id="cost"
                      value={formData.cost}
                      onChange={(e) =>
                        handleInputChange('cost', e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </FormField>
                  <FormField label="Purchase Date" id="purchaseDate">
                    <Input
                      type="date"
                      id="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        handleInputChange('purchaseDate', e.target.value)
                      }
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex gap-3 justify-end">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
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
