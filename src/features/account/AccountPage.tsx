import { useEffect, useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { storage } from '../../utils/storage';
import { tenantService } from '../../services/tenantService';

const AccountPage = () => {
    usePageTitle('Account');

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        const userRole = storage.getRole() ?? '';
        const isTenant = storage.isTenant();

        const hydrateProfile = async () => {
            setRole(userRole || 'User');

            if (!isTenant) {
                setFullName(storage.getTenantName() || 'Authorized User');
                setEmail('');
                setPhone('');
                setIsLoadingProfile(false);
                return;
            }

            try {
                const tenant = await tenantService.getMe();
                setFullName(tenant.name ?? storage.getTenantName() ?? 'Tenant');
                setEmail(tenant.email ?? '');
                setPhone(tenant.phoneNumber ?? '');
            } catch (error) {
                console.error('Failed to load tenant profile:', error);
                setFullName(storage.getTenantName() ?? 'Tenant');
            } finally {
                setIsLoadingProfile(false);
            }
        };

        void hydrateProfile();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Account</h1>
                <p className="text-sm text-gray-500 mt-1">View your profile information</p>
            </header>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-start gap-6">
                    <div className="rounded-full bg-gradient-to-br from-gray-200 to-gray-300 p-6">
                        <UserCircle2 size={64} className="text-gray-700" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        {isLoadingProfile ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-48"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-64"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        {role}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 pt-2">
                                    {email && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800">Email:</span> {email}
                                        </p>
                                    )}
                                    {phone && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800">Phone:</span> {phone}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AccountPage;
