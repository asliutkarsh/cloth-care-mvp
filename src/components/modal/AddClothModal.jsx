import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useWardrobeStore } from '../../stores/useWardrobeStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

const colorPresets = [
  { name: 'Charcoal', value: '#1f2933' },
  { name: 'Midnight', value: '#111827' },
  { name: 'Navy', value: '#1e3a8a' },
  { name: 'Royal', value: '#2563eb' },
  { name: 'Sky', value: '#38bdf8' },
  { name: 'Mint', value: '#34d399' },
  { name: 'Olive', value: '#4d7c0f' },
  { name: 'Sand', value: '#d6b27f' },
  { name: 'Blush', value: '#f472b6' },
  { name: 'Ruby', value: '#f87171' },
  { name: 'Sun', value: '#fbbf24' },
  { name: 'Slate', value: '#94a3b8' },
]

const seasons = ['All Season', 'Spring', 'Summer', 'Fall', 'Winter']

const flattenCategories = (categoryList = [], level = 0) => {
  let options = []
  for (const category of categoryList) {
    options.push({ value: category.id, label: `${'—'.repeat(level)} ${category.name}` })
    if (category.children?.length) {
      options = options.concat(flattenCategories(category.children, level + 1))
    }
  }
  return options
}

export default function AddClothModal({ open, onClose }) {
  const { categories = [], addCloth } = useWardrobeStore()

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    color: '',
    customColor: '#ffffff',
    description: '',
    image: null,
    brand: '',
    material: '',
    season: '',
    cost: '',
    purchaseDate: '',
    requiresPressing: false,
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        categoryId: '',
        color: '',
        customColor: '#ffffff',
        description: '',
        image: null,
        brand: '',
        material: '',
        season: '',
        cost: '',
        purchaseDate: '',
        requiresPressing: false,
      })
      setErrors({})
      setImagePreview(null)
      setIsSaving(false)
    }
  }, [open])

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      handleChange('image', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    handleChange('image', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectPresetColor = (value) => {
    handleChange('color', value)
    handleChange('customColor', value)
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter a name.'
    if (!form.categoryId) nextErrors.categoryId = 'Select a category.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    const payload = {
      ...form,
      color: form.color || form.customColor,
      cost: form.cost,
    }
    try {
      await addCloth(payload)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Item" size="3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Media column */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Cloth preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center px-6">
                    Add a photo to make this item easier to recognize.
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-2 text-sm font-medium hover:border-primary-deep hover:text-primary-deep"
                >
                  <Upload size={16} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-2 text-sm font-medium hover:border-primary-deep hover:text-primary-deep"
                >
                  <Camera size={16} /> Take Photo
                </button>
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-3 w-full rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200 py-2 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  Remove photo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </section>

          {/* Form column */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Essential details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Name<span className="text-red-500">*</span></label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Blue cotton shirt"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Category<span className="text-red-500">*</span></label>
                  <Select
                    value={form.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    aria-invalid={!!errors.categoryId}
                  >
                    <option value="" disabled>Select a category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                  {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Cost</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => handleChange('cost', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Color</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colorPresets.map((preset) => {
                    const isSelected = form.color === preset.value
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => selectPresetColor(preset.value)}
                        className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                          isSelected ? 'border-primary-deep shadow-lg shadow-primary-deep/30' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                        aria-label={`Use ${preset.name}`}
                      />
                    )
                  })}
                  <div className="flex items-center gap-2 rounded-full border border-dashed border-gray-400 px-3 py-1.5 text-xs text-gray-500">
                    <input
                      type="color"
                      value={form.customColor}
                      onChange={(e) => {
                        handleChange('customColor', e.target.value)
                        handleChange('color', e.target.value)
                      }}
                      className="h-5 w-5 cursor-pointer border-none bg-transparent"
                      aria-label="Choose custom color"
                    />
                    <Input
                      value={form.customColor}
                      onChange={(e) => {
                        handleChange('customColor', e.target.value)
                        handleChange('color', e.target.value)
                      }}
                      className="h-7 w-24 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Optional details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-gray-300/80 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 px-3 py-2 text-sm focus:border-primary-deep focus:ring-2 focus:ring-primary-deep/30"
                    placeholder="Notes about fabric, fit, or styling..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Brand</label>
                  <Input
                    value={form.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="e.g., Uniqlo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Material</label>
                  <Input
                    value={form.material}
                    onChange={(e) => handleChange('material', e.target.value)}
                    placeholder="e.g., Cotton"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Season</label>
                  <Select value={form.season} onChange={(e) => handleChange('season', e.target.value)}>
                    <option value="">Choose season</option>
                    {seasons.map((season) => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Purchase date</label>
                  <Input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Requires pressing</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Flag items that need extra care before wearing.</p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.requiresPressing}
                      onChange={(e) => handleChange('requiresPressing', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-400 text-primary-deep focus:ring-primary-deep"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
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
