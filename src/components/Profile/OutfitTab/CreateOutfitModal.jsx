import { useState, useEffect, useRef } from 'react';
import * as ClothService from '../../../services/clothService';
import { Upload, XCircle, Loader2, Shirt } from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import { validateImage, compressImage, uploadImage } from '../../../services/imageUploadService';

export default function CreateOutfitModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    clothIds: [],
    tags: [],
    image: '',
    previewUrl: ''
  });

  const [availableClothes, setAvailableClothes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load clothes + set initial data
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadClothes = async () => {
      try {
        const clothes = await ClothService.getAll();
        if (isMounted) {
          setAvailableClothes(Array.isArray(clothes) ? clothes : []);
        }
      } catch (error) {
        console.error('Error loading clothes:', error);
        if (isMounted) {
          setAvailableClothes([]);
          setErrors(prev => ({ ...prev, load: 'Failed to load clothes. Please try again.' }));
        }
      }
    };

    loadClothes();

    // set/reset form data
    if (initialData) {
      setFormData({
        ...initialData,
        previewUrl: initialData.image || ''
      });
    } else {
      setFormData({
        name: '',
        clothIds: [],
        tags: [],
        image: '',
        previewUrl: ''
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData]);

  // cleanup blob urls when they change
  useEffect(() => {
    return () => {
      if (formData.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.previewUrl);
      }
    };
  }, [formData.previewUrl]);

  const toggleCloth = (id) => {
    setFormData(prev => ({
      ...prev,
      clothIds: prev.clothIds.includes(id)
        ? prev.clothIds.filter(cid => cid !== id)
        : [...prev.clothIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'Name is required';
    if (formData.clothIds.length === 0) validationErrors.clothIds = 'Select at least one clothing item';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsUploading(true);
      let submitData = { ...formData };

      // Upload image if local blob
      if (submitData.previewUrl?.startsWith('blob:')) {
        try {
          const uploadResult = await uploadImage(submitData.previewUrl);
          submitData.image = uploadResult.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      const { previewUrl, ...dataToSubmit } = submitData;

      await onSubmit(dataToSubmit);
      onClose(); // reset handled by effect when reopened
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save outfit. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors(prev => ({ ...prev, image: undefined }));

    const validation = validateImage(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, image: validation.error }));
      return;
    }

    try {
      setIsUploading(true);
      const compressedFile = await compressImage(file);

      // cleanup old blob
      if (formData.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.previewUrl);
      }

      const preview = URL.createObjectURL(compressedFile);
      setFormData(prev => ({
        ...prev,
        previewUrl: preview,
        image: ''
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, image: 'Failed to process image. Please try another one.' }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Outfit' : 'Create New Outfit'}
      size="xl"
    >
      <div className="w-full max-w-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-h-[75vh] overflow-y-auto p-2">
          
          {/* Outfit Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Outfit Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Summer Look, Work Outfit"
              className="w-full"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Outfit Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Outfit Image (Optional)
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-700/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              {formData.previewUrl ? (
                <div className="relative w-full h-full">
                  <img src={formData.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, previewUrl: '', image: '' }));
                    }}
                    className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Remove image"
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>

          {/* Select Clothes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Clothing Items *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-white dark:bg-gray-800">
              {availableClothes.map((cloth) => (
                <button
                  key={cloth.id}
                  type="button"
                  onClick={() => toggleCloth(cloth.id)}
                  className={`flex items-center p-2 rounded-md w-full text-left ${
                    formData.clothIds.includes(cloth.id)
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                    <Shirt className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cloth.name}</p>
                    {cloth.category && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cloth.category}</p>
                    )}
                  </div>
                  {formData.clothIds.includes(cloth.id) && (
                    <div className="ml-2 text-blue-600 dark:text-blue-400">✓</div>
                  )}
                </button>
              ))}
            </div>
            {errors.clothIds && <p className="mt-1 text-sm text-red-600">{errors.clothIds}</p>}
          </div>

          {/* Submit Errors */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded text-center">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-2 sm:space-y-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !formData.name.trim() || formData.clothIds.length === 0}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Outfit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
