/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Plus, X, Mail, Phone, MapPin, Info, UserPlus, Edit2, Trash2 } from 'lucide-react';
import type { Tenant } from '../../types/tenant';
import { tenantService } from '../../services/tenantService';
import CreateTenantModal from './CreateTenantModal';
import UpdateTenantModal from './UpdateTenantModal';
import AddTenantUserModal from './AddTenantUserModal';
import { usePageTitle } from '../../hooks/usePageTitle';

const TenantsPage = () => {
    usePageTitle('Tenants');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleTenantCreated = () => {
        tenantService.getAllTenants().then(data => {
            setTenants(data);
        });
    };

    const handleTenantUpdated = () => {
        tenantService.getAllTenants().then(data => {
            setTenants(data);
            const updated = data.find(t => t.id === selectedTenant?.id);
            if (updated) {
                setSelectedTenant(updated);
            }
        });
    };

    const handleTenantUserCreated = () => {
        setIsAddUserModalOpen(false);
        tenantService.getAllTenants().then(setTenants);
    };

    const handleDelete = async () => {
        if (!selectedTenant) return;

        if (!window.confirm(`Are you sure you want to delete "${selectedTenant.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await tenantService.delete(selectedTenant.id);
            setTenants(tenants.filter(t => t.id !== selectedTenant.id));
            setSelectedTenant(null);
        } catch (error) {
            console.error("Failed to delete tenant", error);
            alert("Failed to delete tenant. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-6 relative min-h-screen">
            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${selectedTenant ? 'w-8/12' : 'w-full'} space-y-6`}>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tenants Directory</h1>
                        <p className="text-sm text-gray-500">Manage property managers and contact information</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            disabled={!selectedTenant || !!selectedTenant?.userId}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            title={selectedTenant?.userId ? "User account already exists for this tenant" : ""}>
                            <UserPlus size={18} /> Add Tenant account
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-sm font-semibold">
                            <Plus size={18} /> Add Tenant
                        </button>
                    </div>
                </div>

                {/* Grid of Tenant Cards */}
                <div className={`grid grid-cols-1 ${selectedTenant ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                    {tenants.map(tenant => (
                        <div key={tenant.id}
                             onClick={() => setSelectedTenant(tenant)}
                             className={`bg-white rounded-3xl transition-all border p-6 cursor-pointer relative group ${
                                 selectedTenant?.id === tenant.id
                                     ? 'border-gray-900 ring-2 ring-gray-900/5 shadow-md'
                                     : 'border-gray-100 hover:shadow-md'
                             }`}>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                        selectedTenant?.id === tenant.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-900 group-hover:text-white'
                                    }`}>
                                        <span className="text-lg font-bold">{tenant.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{tenant.name}</h3>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${
                                            tenant.status === 1 ? 'text-green-600' : tenant.status === 2 ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                            {tenant.status === 1 ? 'Active' : tenant.status === 2 ? 'Suspended' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-3 p-2 rounded-xl">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">{tenant.email}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">{tenant.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">{tenant.addressCity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Side Details Panel */}
            {selectedTenant && (
                <div className="w-4/12 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-[fit-content] sticky top-8 animate-in slide-in-from-right duration-300">
                    {/* Header with Background Accent */}
                    <div className="bg-gray-900 p-6 text-white relative">
                        <button
                            onClick={() => setSelectedTenant(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                                <span className="text-3xl font-bold">{selectedTenant.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-xl font-bold">{selectedTenant.name}</h2>
                            <p className="text-xs text-gray-400 font-mono">#{selectedTenant.id.split('-')[0]}</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Contact Information Group */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} /> Contact Information
                            </h3>
                            <DetailItem icon={<Mail size={16}/>} label="Email Address" value={selectedTenant.email}/>
                            <DetailItem icon={<Phone size={16}/>} label="Phone Number" value={selectedTenant.phoneNumber} />
                        </div>

                        <hr className="border-gray-100" />

                        {/* Address Information Group */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} /> Address
                            </h3>
                            <DetailItem label="Street" value={selectedTenant.addressStreet}/>
                            <DetailItem label="City" value={selectedTenant.addressCity} />
                            <DetailItem label="Region" value={selectedTenant.addressRegion} />
                        </div>

                        <hr className="border-gray-100" />

                        {/* Status Group */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} /> Status
                            </h3>
                            <div className="group flex items-start gap-3">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</p>
                                    <p className={`text-sm font-semibold ${
                                        selectedTenant.status === 1 ? 'text-green-600' : selectedTenant.status === 2 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {selectedTenant.status === 1 ? 'Active' : selectedTenant.status === 2 ? 'Suspended' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsUpdateModalOpen(true)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all font-semibold"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CreateTenantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTenantCreated={handleTenantCreated}
            />

            <UpdateTenantModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onTenantUpdated={handleTenantUpdated}
                tenant={selectedTenant}
            />

            <AddTenantUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={handleTenantUserCreated}
                tenant={selectedTenant}
            />
        </div>
    );
};

const DetailItem = ({ label, value, icon }: { label: string, value: any, icon?: React.ReactNode }) => (
    <div className="group flex items-start gap-3">
        {icon && <div className="mt-0.5 text-gray-400">{icon}</div>}
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
            <p className="text-sm text-gray-700 font-semibold">{value && value.trim ? value.trim() : (value || 'N/A')}</p>
        </div>
    </div>
);

export default TenantsPage;