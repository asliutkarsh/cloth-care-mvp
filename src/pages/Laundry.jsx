import { useState, useEffect } from 'react'
import { LaundryService } from '../services'
import AnimatedPage from '../components/AnimatedPage'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function Laundry() {
  const [laundryStatus, setLaundryStatus] = useState({
    dirty: [],
    needsPressing: [],
  })
  const [selectedDirty, setSelectedDirty] = useState([])
  const [selectedPressing, setSelectedPressing] = useState([])

  useEffect(() => {
    loadLaundry()
  }, [])

  const loadLaundry = () => {
    setLaundryStatus(LaundryService.getLaundryStatus())
  }

  const handleSelectDirty = (clothId) => {
    setSelectedDirty((prev) =>
      prev.includes(clothId)
        ? prev.filter((id) => id !== clothId)
        : [...prev, clothId]
    )
  }

  const handleSelectPressing = (clothId) => {
    setSelectedPressing((prev) =>
      prev.includes(clothId)
        ? prev.filter((id) => id !== clothId)
        : [...prev, clothId]
    )
  }

  const handleWash = () => {
    if (selectedDirty.length === 0) return
    LaundryService.washSelectedClothes(selectedDirty)
    setSelectedDirty([])
    loadLaundry()
  }

  const handlePress = () => {
    if (selectedPressing.length === 0) return
    LaundryService.pressSelectedClothes(selectedPressing)
    setSelectedPressing([])
    loadLaundry()
  }

  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 dark:text-white">
        <SectionHeader title="Laundry Room" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dirty Clothes Section */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Dirty Clothes ({laundryStatus.dirty.length})
              </h3>
              <Button
                onClick={handleWash}
                disabled={selectedDirty.length === 0}
              >
                Wash Selected ({selectedDirty.length})
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {laundryStatus.dirty.length > 0 ? (
                laundryStatus.dirty.map((cloth) => (
                  <LaundryItem
                    key={cloth.id}
                    cloth={cloth}
                    isSelected={selectedDirty.includes(cloth.id)}
                    onSelect={() => handleSelectDirty(cloth.id)}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Nothing to wash!
                </p>
              )}
            </div>
          </Card>

          {/* Needs Pressing Section */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Needs Pressing ({laundryStatus.needsPressing.length})
              </h3>
              <Button
                onClick={handlePress}
                disabled={selectedPressing.length === 0}
              >
                Press Selected ({selectedPressing.length})
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {laundryStatus.needsPressing.length > 0 ? (
                laundryStatus.needsPressing.map((cloth) => (
                  <LaundryItem
                    key={cloth.id}
                    cloth={cloth}
                    isSelected={selectedPressing.includes(cloth.id)}
                    onSelect={() => handleSelectPressing(cloth.id)}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Nothing to press!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}

const LaundryItem = ({ cloth, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-3 rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
      isSelected
        ? 'bg-blue-100 dark:bg-blue-900/50'
        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => {}}
      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
    />
    <img
      src={cloth.image || 'https://via.placeholder.com/150'}
      alt={cloth.name}
      className="w-12 h-12 object-cover rounded-md"
    />
    <div>
      <p className="font-medium">{cloth.name}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {cloth.brand || 'No Brand'}
      </p>
    </div>
  </div>
)
