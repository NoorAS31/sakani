import { useState } from 'react';
import {
    UserCircle2,
    Mail,
    Phone,
    ShieldCheck,
    KeyRound,
    Save,
    Monitor,
    UserCog
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

const AccountPage = () => {
    usePageTitle('Account');

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Account</h1>
                    <p className="text-sm text-gray-500">Manage your personal profile and account security</p>
                </div>
                <button className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center gap-2">
                    <Save size={16} />
                    Save Profile
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                    <div className="flex items-center gap-2">
                        <UserCircle2 size={18} className="text-gray-700" />
                        <h2 className="font-bold text-gray-800">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter full name"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Job Title</label>
                            <div className="relative">
                                <UserCog size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Enter role or title"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                        Profile data is not connected to controllers yet.
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-gray-700" />
                            <h2 className="font-bold text-gray-800">Security</h2>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <KeyRound size={15} />
                                Change Password
                            </button>
                            <button className="w-full rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Manage 2FA
                            </button>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Monitor size={18} className="text-gray-700" />
                            <h2 className="font-bold text-gray-800">Active Sessions</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-gray-100 p-3">
                                <p className="text-sm font-semibold text-gray-800">No session records available</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Session management will appear here when backend endpoints are ready.
                                </p>
                            </div>
                            <button className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                Sign out of all devices
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
