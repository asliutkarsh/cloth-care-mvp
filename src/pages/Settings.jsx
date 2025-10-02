import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSettingsStore } from '../stores/useSettingsStore'
import ThemeToggle from '../components/ThemeToggle'
import { Button, SettingsMenuItem } from '../components/ui'
import ConfirmationModal from '../components/modal/ConfirmationModal'
import SettingsSkeleton from '../components/skeleton/SettingsSkeleton'
import { MIN_MODULES, MAX_MODULES } from '../components/insights/insightsConfig'
import { useToast } from '../context/ToastProvider.jsx'
import { APP_VERSION } from '../app.config.js'

export default function Settings() {
  const navigate = useNavigate()
  const {
    exportData,
    importData,
    resetApp,
    preferences,
    updatePreference,
    fetchPreferences,
  } = useSettingsStore()
  const [confirmState, setConfirmState] = useState({ open: false })
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const { addToast } = useToast()
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (!preferences) {
      fetchPreferences()
    }
  }, [preferences, fetchPreferences])

  useEffect(() => {
    if (!preferences) return
    if (preferences.wardrobeDefaults) {
      const defaults = preferences.wardrobeDefaults
      if (defaults.viewMode) setViewMode(defaults.viewMode)
      if (defaults.sortBy) setSortBy(defaults.sortBy)
    }
  }, [preferences])

  const onConfirmClose = () => setConfirmState({ open: false })

  const handleResetApp = () => {
    setConfirmState({
      open: true,
      title: 'Reset All Data?',
      message:
        'This will permanently delete all your clothes, outfits, and history. This action cannot be undone.',
      confirmText: 'Yes, Reset Everything',
      isDanger: true,
      onConfirm: async () => {
        if (isResetting) return
        setIsResetting(true)
        try {
          await resetApp()
          await fetchPreferences()
          addToast('App data has been reset successfully.', { type: 'success' })
          onConfirmClose()
        } catch (error) {
          console.error('Failed to reset app data', error)
          addToast('Reset failed. Please try again.', { type: 'error' })
        } finally {
          setIsResetting(false)
        }
      },
    })
  }

  if (!preferences) {
    return <SettingsSkeleton />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <div className="mb-4 text-center glass-card border border-dashed border-accent-orange/40 bg-accent-orange/10 text-coolgray-700 dark:text-coolgray-500 p-3">
        <p className="text-sm">
          Tip: You can customize quick filters in <span className="tag-new">Manage Quick Filters</span> for faster browsing.
        </p>
      </div>

      <div className="glass-card w-full p-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="p-2 min-w-10 min-h-10"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        </div>

        <div className="p-4 sm:p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light mode</div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wardrobe</h3>
            <SettingsMenuItem
              title="Manage Categories"
              subtitle="Add, edit, or delete your categories"
              onClick={() => navigate('/settings/categories')}
            />
            <SettingsMenuItem
              title="Manage Quick Filters"
              subtitle="Customize the filter chips in your wardrobe"
              onClick={() => navigate('/settings/filters')}
            />

            <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">Default View</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Applies to both Clothes and Outfits</div>
                </div>
                <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-primary-activeBg text-white' : ''}`}
                    onClick={async () => {
                      setViewMode('grid')
                      await updatePreference('wardrobeDefaults', {
                        ...(preferences?.wardrobeDefaults || {}),
                        viewMode: 'grid',
                        sortBy,
                      })
                    }}
                    type="button"
                  >
                    Grid
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-primary-activeBg text-white' : ''}`}
                    onClick={async () => {
                      setViewMode('list')
                      await updatePreference('wardrobeDefaults', {
                        ...(preferences?.wardrobeDefaults || {}),
                        viewMode: 'list',
                        sortBy,
                      })
                    }}
                    type="button"
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">Default Sort</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Applied when you open your wardrobe</div>
                </div>
                <select
                  value={sortBy}
                  onChange={async (e) => {
                    const next = e.target.value
                    setSortBy(next)
                    await updatePreference('wardrobeDefaults', {
                      ...(preferences?.wardrobeDefaults || {}),
                      viewMode,
                      sortBy: next,
                    })
                  }}
                  className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-gray-900"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                  <option value="mostWorn">Most worn</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insights dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personalise which analytics cards appear on your Insights page.
            </p>
            <SettingsMenuItem
              title="Manage Insights Modules"
              subtitle={`Choose between ${MIN_MODULES} and ${MAX_MODULES} cards to display`}
              onClick={() => navigate('/settings/insights')}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <SettingsMenuItem
              title="About ClothCare"
              subtitle={`Version ${APP_VERSION}`}
              onClick={() => navigate('/about')}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data & Privacy</h3>

            <div className="mb-4 text-center glass-card border border-dashed border-accent-orange/40 bg-accent-orange/10 text-coolgray-700 dark:text-coolgray-500 p-3">
              <p className="text-sm mb-2">
                <strong> Important:</strong> Your wardrobe data is stored locally in your browser's storage.
              </p>
              <p className="text-sm mb-2">
                Please export your data regularly using the "Export Data" option below to avoid losing your wardrobe information when clearing browser cache or switching devices.
              </p>
              <p className="text-sm">
                <strong> We're working on:</strong> Cloud synchronization to make your wardrobe accessible across all your devices.
              </p>
            </div>

            <SettingsMenuItem
              title="Export Data"
              subtitle="Download your wardrobe data"
              onClick={exportData}
            />
            <SettingsMenuItem
              title="Import Data"
              subtitle="Restore from a backup file"
              onClick={importData}
            />
            <SettingsMenuItem
              title="Reset App Data"
              subtitle="Clear all data (cannot be undone)"
              onClick={handleResetApp}
              danger
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={confirmState.open}
        onClose={() => !isResetting && onConfirmClose()}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={isResetting ? 'Resetting' : confirmState.confirmText}
        isDanger={confirmState.isDanger}
      />
    </div>
  )
}
