import React, { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useWardrobeStore } from '../../stores/useWardrobeStore'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'

const colorPresets = [
  '#1f2933',
  '#111827',
  '#1e3a8a',
  '#2563eb',
  '#38bdf8',
  '#34d399',
  '#4d7c0f',
  '#d6b27f',
  '#f472b6',
  '#f87171',
  '#fbbf24',
  '#94a3b8',
]

const seasons = ['All Season', 'Spring', 'Summer', 'Fall', 'Winter']

const flattenCategories = (list = [], depth = 0) => {
  let options = []
  for (const category of list) {
    options.push({ value: category.id, label: `${'—'.repeat(depth)} ${category.name}` })
    if (category.children?.length) {
      options = options.concat(flattenCategories(category.children, depth + 1))
    }
  }
  return options
}

export default function ClothModal({ open, onClose, onSubmit, initialData = null }) {
  const categories = useWardrobeStore((state) => state.categories || [])
  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    color: '',
    customColor: '#ffffff',
    image: null,
    description: '',
    brand: '',
    material: '',
    season: '',
    cost: '',
    purchaseDate: '',
    requiresPressing: false,
  })
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const base = initialData || {}
      setForm({
        name: base.name || '',
        categoryId: base.categoryId || '',
        color: base.color || '',
        customColor: base.color || '#ffffff',
        image: base.image || null,
        description: base.description || '',
        brand: base.brand || '',
        material: base.material || '',
        season: base.season || '',
        cost: base.cost != null ? String(base.cost) : '',
        purchaseDate: base.purchaseDate || '',
        requiresPressing: !!base.requiresPressing,
      })
      setErrors({})
      setPreview(base.image || null)
      setIsSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open, initialData])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        handleChange('image', reader.result)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error during image compression:', error)
      // Optionally notify the user via toast.
    }
  }

  const removeImage = () => {
    setPreview(null)
    handleChange('image', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
      ...initialData,
      ...form,
      color: form.color || form.customColor,
      cost: form.cost,
    }

    try {
      await Promise.resolve(onSubmit(payload))
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Item' : 'Add New Item'} size="3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt={form.name || 'Cloth preview'} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400 px-6 text-center">
                    Add or update the photo so this item stands out.
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 py-2 text-sm font-medium hover:border-primary-deep hover:text-primary-deep"
                >
                  <Upload size={16} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 py-2 text-sm font-medium hover:border-primary-deep hover:text-primary-deep"
                >
                  <Camera size={16} /> Capture
                </button>
              </div>

              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
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
          </aside>

          <section className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Essential details</h3>

              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Navy linen shirt"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <Select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} aria-invalid={!!errors.categoryId}>
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
                    const isActive = form.color === preset
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          handleChange('color', preset)
                          handleChange('customColor', preset)
                        }}
                        className={`h-9 w-9 rounded-full border-2 transition ${
                          isActive ? 'border-primary-deep shadow-lg shadow-primary-deep/30' : 'border-white dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: preset }}
                        aria-label={`Use color ${preset}`}
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
                      aria-label="Pick custom color"
                      className="h-5 w-5 border-none bg-transparent"
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Additional details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-gray-300/80 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 px-3 py-2 text-sm focus:border-primary-deep focus:ring-2 focus:ring-primary-deep/20"
                    placeholder="Add notes about fit, fabric, or styling ideas..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Brand</label>
                  <Input value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} placeholder="e.g., Uniqlo" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Material</label>
                  <Input value={form.material} onChange={(e) => handleChange('material', e.target.value)} placeholder="e.g., Linen" />
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
                  <Input type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} />
                </div>
                <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Requires pressing</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Keep this on to remind yourself before wearing.</p>
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
              'Save changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
