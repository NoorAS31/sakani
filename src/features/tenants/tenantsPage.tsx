/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Tenant } from '../../types/tenant';
import { tenantService } from '../../services/tenantService';
import CreateTenantModal from './CreateTenantModal';

const TenantsPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const data = await tenantService.getAllTenants();
                setTenants(data);
            } catch (error) {
                console.error("Failed to load tenants", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    return (
        <div className="flex relative h-full">
            <div className={`transition-all duration-300 ${selectedTenant ? 'w-8/12' : 'w-full'} space-y-6`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Tenants Management</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
                        <Plus size={18} /> Create Tenant
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4 text-center">Is Deleted?</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 cursor-pointer">
                        {tenants.map((t) => (
                            <tr key={t.id} onClick={() => setSelectedTenant(t)} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-gray-400">#{t.id}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{t.name}</td>
                                <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {t.status}
                                        </span>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* The Modal Component */}
            <CreateTenantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />


            {selectedTenant && (
                <div className="w-4/12 ml-6 bg-white border border-gray-200 rounded-lg shadow-xl p-6 h-fit sticky top-6 animate-in slide-in-from-right">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Tenant Details</h2>
                        <button onClick={() => setSelectedTenant(null)} className="text-gray-400 hover:text-gray-600"><X /></button>
                    </div>

                    <div className="space-y-4">
                        <DetailItem label="Full Name" value={selectedTenant.name} />
                        <DetailItem label="Email Address" value={selectedTenant.email} />
                        <DetailItem label="Phone" value={selectedTenant.phoneNumber} />
                        <hr className="border-gray-100" />
                        <DetailItem label="City" value={selectedTenant.addressCity} />
                        <DetailItem label="Street" value={selectedTenant.addressStreet} />
                        <DetailItem label="Region" value={selectedTenant.addressRegion} />
                        <hr className="border-gray-100" />
                        <DetailItem label="Status" value={selectedTenant.status} />

                    </div>
                </div>
            )}
        </div>
    );
};

// Simple helper component for the Side Panel
const DetailItem = ({ label, value }: { label: string, value: any }) => (
    <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
        <p className="text-sm text-gray-700 font-medium">{value || 'N/A'}</p>
    </div>
);

export default TenantsPage;