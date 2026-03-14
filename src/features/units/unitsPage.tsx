import{ useEffect, useState } from 'react';
import { unitService } from '../../services/unitService';
import type { Unit } from '../../types/unit';
import { Plus, Building2, MapPin, Maximize2 } from 'lucide-react';
import CreateUnitModal from './CreateUnitModal';

const UnitsPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const role = localStorage.getItem('role');
                const tId = localStorage.getItem('tenantId');

                let data;
                if (role === 'Tenant' && tId) {
                    data = await unitService.getUnitsByTenant(tId);
                } else {
                    data = await unitService.getAllUnits();
                }
                setUnits(data);
            } catch (error) {
                console.error("Error fetching units:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rented':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'UnderMaintenance':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Reserved':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="p-8 text-gray-500 italic">Connecting to Sakani Vault...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Units Portfolio</h1>
                    <p className="text-gray-500 text-sm">Managing physical assets and availability.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                    <Plus size={18} /> Add New Unit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Unit / ID</th>
                        <th className="px-6 py-4">Location (Floor)</th>
                        <th className="px-6 py-4">Area (sqm)</th>
                        <th className="px-6 py-4">Rent Price</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {units.length > 0 ? units.map((unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{unit.unitNo}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {unit.id.slice(0, 8)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    {unit.floor || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Maximize2 size={14} className="text-gray-400" />
                                    {unit.area} m²
                                </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                                ${unit.rentPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusStyles(unit.unitStatus)}`}>
                                {unit.unitStatus.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                No units found for this tenant.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <CreateUnitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tenantName={localStorage.getItem('tenantName') || "Super Admin"}
            />
        </div>
    );
};

export default UnitsPage;