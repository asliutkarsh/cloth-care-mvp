import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, ChevronRight, LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import { NotificationService, InitializationService } from '../../services/data';

const SettingsMenuItem = ({ title, subtitle, onClick, danger = false }) => (
    <Button onClick={onClick} variant={danger ? 'danger' : 'ghost'} size="sm" className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="text-left">
            <div className="font-medium">{title}</div>
            {subtitle && (
                <div className={`text-sm ${danger ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {subtitle}
                </div>
            )}
        </div>
        <ChevronRight size={16} className="text-gray-400" />
    </Button>
);

export default function SettingsView({ onBack }) {
    const [settings, setSettings] = useState(NotificationService.getSettings());

    const handleSettingsChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        NotificationService.updateSettings(newSettings);
    };

    const handleExport = () => {
        const data = InitializationService.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloth-care-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        InitializationService.importData(data);
                        alert('Data imported successfully!');
                        // Optionally, refresh the app or navigate away
                        window.location.reload();
                    } catch (error) {
                        alert('Failed to import data.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all app data? This cannot be undone.')) {
            InitializationService.resetApp();
            alert('App data has been reset.');
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 pb-24">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-sm border border-white/20 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>

                <div className="p-4 space-y-6">
                    {/* Appearance */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Appearance
                        </h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">Theme</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light</div>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Notifications
                        </h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">Laundry Reminders</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Get notified about dirty clothes</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSettingsChange('enabled', !settings.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${settings.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {settings.enabled && (
                            <div className="ml-6 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notification Day
                                        </label>
                                        <Select value={settings.dayOfWeek} onChange={(e) => handleSettingsChange('dayOfWeek', parseInt(e.target.value))}>
                                            <option value={0}>Sunday</option>
                                            <option value={1}>Monday</option>
                                            <option value={2}>Tuesday</option>
                                            <option value={3}>Wednesday</option>
                                            <option value={4}>Thursday</option>
                                            <option value={5}>Friday</option>
                                            <option value={6}>Saturday</option>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notification Time
                                        </label>
                                        <Input type="time" value={settings.timeOfDay} onChange={(e) => handleSettingsChange('timeOfDay', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data & Privacy */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Data & Privacy
                        </h3>
                        <SettingsMenuItem title="Export Data" subtitle="Download your wardrobe data" onClick={handleExport} />
                        <SettingsMenuItem title="Import Data" subtitle="Restore from backup" onClick={handleImport} />
                        <SettingsMenuItem title="Reset App Data" subtitle="Clear all data (cannot be undone)" onClick={handleReset} danger />
                    </div>

                    {/* Account */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Account
                        </h3>
                        <SettingsMenuItem title="About ClothCare" subtitle="App version & info" onClick={() => alert('ClothCare v1.0.0')} />
                        <SettingsMenuItem title="Privacy Policy" subtitle="How we protect your data" onClick={() => alert('Privacy Policy')} />
                        <SettingsMenuItem title="Terms of Service" subtitle="App usage terms" onClick={() => alert('Terms of Service')} />
                    </div>

                    {/* Logout */}
                    <Button variant="danger" fullWidth className="mt-6 flex items-center justify-center gap-2">
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
