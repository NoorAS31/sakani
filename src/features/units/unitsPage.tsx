import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Home, Plus, Layers, Maximize2, Edit2, Trash2, Loader2, FileText } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { unitService } from '../../services/unitService';
import CreateUnitModal from './CreateUnitModal';
import CreateContractModal from '../contracts/CreateContractModal';
import { storage } from "../../utils/storage.ts";
import type { Property } from '../../types/property';
import type { Unit } from '../../types/unit';
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal.tsx";
import UpdateUnitModal from "./UpdateUnitModal.tsx";
import { usePageTitle } from '../../hooks/usePageTitle';
import axios from "axios";

const UnitsPage = () => {
    usePageTitle('Units');
    const [properties, setProperties] = useState<Property[]>([]);
    const [unitsByProperty, setUnitsByProperty] = useState<Record<string, Unit[]>>({});
    const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
    const [loadingUnits, setLoadingUnits] = useState<string[]>([]);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

    // Initial load of properties
    useEffect(() => {
        propertyService.getAll().then(setProperties);
    }, []);
    const handleUnitCreated = async (propertyId: string) => {
        // Re-fetch only the units for the building we just added a unit to
        const updatedUnits = await unitService.getByPropertyId(propertyId);
        setUnitsByProperty(prev => ({ ...prev, [propertyId]: updatedUnits }));
    };

    const toggleProperty = async (propertyId: string) => {
        const isExpanded = expandedProperties.includes(propertyId);

        if (isExpanded) {
            setExpandedProperties(prev => prev.filter(id => id !== propertyId));
        } else {
            setExpandedProperties(prev => [...prev, propertyId]);

            // If we haven't loaded units for this property yet, fetch them
            if (!unitsByProperty[propertyId]) {
                try {
                    setLoadingUnits(prev => [...prev, propertyId]);
                    const units = await unitService.getByPropertyId(propertyId);
                    setUnitsByProperty(prev => ({ ...prev, [propertyId]: units }));
                } catch (err: unknown) {
                    if (axios.isAxiosError(err)) {
                        if (err.response?.status === 404) {
                            setUnitsByProperty(prev => ({
                                ...prev,
                                [propertyId]: []
                            }));
                        } else {
                            console.error("Failed to fetch units:", err);
                        }
                    } else {
                        console.error("Unexpected error:", err);
                    }
                } finally {
                    setLoadingUnits(prev => prev.filter(id => id !== propertyId));
                }
            }
        }
    };
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    const getStatusConfig = (statusNum: number) => {
        switch (statusNum) {
            case 1: return { label: 'AVAILABLE', color: 'bg-green-100 text-green-700' };
            case 2: return { label: 'RENTED', color: 'bg-blue-100 text-blue-700' };
            case 3: return { label: 'MAINTENANCE', color: 'bg-red-100 text-red-700' };
            case 4: return { label: 'RESERVED', color: 'bg-amber-100 text-amber-700' };
            default: return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const confirmDeleteUnit = async () => {
        if (!unitToDelete) return;

        try {

            await unitService.delete(unitToDelete.id);

            try {

                const updatedUnits = await unitService.getByPropertyId(unitToDelete.propertyId);
                setUnitsByProperty(prev => ({
                    ...prev,
                    [unitToDelete.propertyId]: updatedUnits
                }));
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                    setUnitsByProperty(prev => ({
                        ...prev,
                        [unitToDelete.propertyId]: []
                    }));
                }
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete unit.");
        } finally {setUnitToDelete(null);
        }
    };
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [contractUnit, setContractUnit] = useState<Unit | null>(null);

    const handleRefreshPropertyUnits = async (propertyId: string) => {
        const updatedData = await unitService.getByPropertyId(propertyId);

        setUnitsByProperty(prev => ({
            ...prev,
            [propertyId]: updatedData
        }));
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-fade-in">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 card-fade-in-1">Units Portfolio</h1>

            {properties.map((property, index) => (
                <div key={property.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-3 ${index < 3 ? `card-fade-in-${index + 2}` : ''}`}>
                    {/* Property Header */}
                    <div
                        onClick={() => toggleProperty(property.id)}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors gap-2 sm:gap-0"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 font-semibold text-xs sm:text-sm text-gray-700">
                            {expandedProperties.includes(property.id) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                            <span className="truncate">{property.name}</span>
                            <span className="text-[9px] sm:text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-500 uppercase tracking-widest flex-shrink-0">
                                {property.city}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePropertyId(property.id);
                                setIsUnitModalOpen(true);
                            }}
                            className="bg-gray-800 text-white p-1.5 rounded-md hover:bg-black shadow-sm flex items-center gap-1 text-[11px] sm:text-xs px-2 sm:px-3 whitespace-nowrap"
                        >
                            <Plus size={12} /> Add Unit
                        </button>
                    </div>

                    {/* Units List */}
                    {expandedProperties.includes(property.id) && (
                        <div className="divide-y divide-gray-100 animate-in slide-in-from-top-2 duration-200">
                            {loadingUnits.includes(property.id) ? (
                                <div className="p-3 sm:p-4 flex justify-center text-gray-400"><Loader2 className="animate-spin" size={20} /></div>
                            ) : unitsByProperty[property.id]?.length === 0 ? (
                                <div className="p-3 sm:p-6 ml-6 sm:ml-8 mr-3 sm:mr-4 my-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActivePropertyId(property.id);
                                            setIsUnitModalOpen(true);
                                        }}
                                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50/30 transition-all group"
                                    >
                                        <div className="p-2 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                                            <Plus size={16} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-center">No units yet. Click to add the first unit.</span>
                                    </button>
                                </div>                            ) : (
                                unitsByProperty[property.id]?.map(unit => {
                                    const currentStatus = (unit as Unit).unitStatus;
                                    const statusConfig = getStatusConfig(currentStatus);

                                    return (
                                        <div key={unit.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 ml-6 sm:ml-8 hover:bg-blue-50/20 group transition-colors gap-2 sm:gap-0">
                                            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                                <Home size={16} className="text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                   <div className="font-bold text-gray-800 text-xs sm:text-sm">Unit #{unit.unitNo}</div>
                                                   <div className="flex gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-tighter">
                                                        <span className="flex items-center gap-0.5 flex-shrink-0"><Layers size={8}/> Floor {unit.floor}</span>
                                                        <span className="flex items-center gap-0.5 flex-shrink-0"><Maximize2 size={8}/> {unit.area} sqm</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="text-right">
                                                   <p className="text-xs sm:text-sm font-bold text-gray-900">${unit.rentPrice}</p>
                                                   <p className="text-[9px] sm:text-[10px] text-gray-400">Rent</p>
                                                </div>


                                                <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black flex-shrink-0 ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>

                                                <div className="flex items-center gap-1 opacity-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {currentStatus === 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setContractUnit(unit); }}
                                                           className="p-1 sm:p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                            title="Create Contract"
                                                        >
                                                            <FileText size={12} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingUnit(unit); }}
                                                       className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setUnitToDelete(unit); }}
                                                       className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            ))}

            <CreateUnitModal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                tenantName={storage.getTenantName() || null}
                propertyId={activePropertyId}
                onUnitCreated={() => activePropertyId && handleUnitCreated(activePropertyId)}
            />

            <DeleteConfirmationModal
                isOpen={!!unitToDelete}
                onClose={() => setUnitToDelete(null)}
                onConfirm={confirmDeleteUnit}
                title={unitToDelete ? `Unit #${unitToDelete.unitNo}` : ""}
            />

            {editingUnit && (
                <UpdateUnitModal
                    unit={editingUnit}
                    isOpen={!!editingUnit}
                    onClose={() => setEditingUnit(null)}
                    onUnitUpdated={(propId) => handleRefreshPropertyUnits(propId)}
                />
            )}

            {contractUnit && (
                <CreateContractModal
                    isOpen={!!contractUnit}
                    onClose={() => setContractUnit(null)}
                    onContractCreated={() => {
                        setContractUnit(null);
                        // Refresh units to update status
                        if (contractUnit.propertyId) {
                            handleRefreshPropertyUnits(contractUnit.propertyId);
                        }
                    }}
                    preselectedUnit={contractUnit}
                />
            )}
        </div>
    );
};
export default UnitsPage;