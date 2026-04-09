import { useState } from 'react';
import {
    Bell,
    Shield,
    Palette,
    Save,
    Lock,
    Check
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext';

type ToggleSwitchProps = {
    checked: boolean;
    onChange: (next: boolean) => void;
};

const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-gray-900' : 'bg-gray-300'}`}
        aria-pressed={checked}
    >
        <span
            className={`absolute top-1/2 left-0.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        >
            <Check
                size={11}
                className={`transition-all ${checked ? 'text-gray-900 opacity-100 scale-100' : 'text-gray-400 opacity-0 scale-75'}`}
            />
        </span>
    </button>
);

const SettingsPage = () => {
    usePageTitle('Settings');
    const { theme, setTheme } = useTheme();

    const [emailAlerts, setEmailAlerts] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500">Manage preferences and account configuration</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette size={18} className="text-gray-700" />
                        <h2 className="font-bold text-gray-800">Appearance</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                            <div>
                                <p className="font-semibold text-sm text-gray-800">Dark mode</p>
                                <p className="text-xs text-gray-500">Use a darker theme across all pages</p>
                            </div>
                            <ToggleSwitch
                                checked={theme === 'dark'}
                                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell size={18} className="text-gray-700" />
                        <h2 className="font-bold text-gray-800">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                            <div>
                                <p className="font-semibold text-sm text-gray-800">Email alerts</p>
                                <p className="text-xs text-gray-500">Receive payment and contract notifications by email</p>
                            </div>
                            <ToggleSwitch checked={emailAlerts} onChange={setEmailAlerts} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                            <div>
                                <p className="font-semibold text-sm text-gray-800">Task reminders</p>
                                <p className="text-xs text-gray-500">Daily summary for pending maintenance tasks</p>
                            </div>
                            <ToggleSwitch checked={taskReminders} onChange={setTaskReminders} />
                        </div>
                    </div>
                </section>

                <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className="text-gray-700" />
                        <h2 className="font-bold text-gray-800">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                            <div className="flex items-start gap-3">
                                <Lock size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">Two-factor authentication</p>
                                    <p className="text-xs text-gray-500">Add extra protection to your account</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={twoFactorAuth} onChange={setTwoFactorAuth} />
                        </div>
                        <button className="w-full rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            Change password
                        </button>
                    </div>
                </section>

                <div className="xl:col-span-2">
                    <button className="w-full xl:w-64 bg-gray-900 text-white rounded-xl py-3 text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
