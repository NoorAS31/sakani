import React, { useState, useEffect } from 'react';
import { X, Save, Home, AlertTriangle } from 'lucide-react';
import { unitService } from '../../services/unitService';
import { contractService } from '../../services/contractService';
import type { Unit } from '../../types/unit';
import type {Contract} from "../../types/contract.ts";

interface UpdateUnitModalProps {
    unit: Unit;
    isOpen: boolean;
    onClose: () => void;
    onUnitUpdated: (propertyId: string) => void;
}

const UpdateUnitModal = ({ unit, isOpen, onClose, onUnitUpdated }: UpdateUnitModalProps) => {
    const [formData, setFormData] = useState({
        unitNo: '',
        floor: '',
        area: '',
        rentPrice: 0,
        unitStatus: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasActiveContract, setHasActiveContract] = useState(false);
    const [checkingContract, setCheckingContract] = useState(true);

    // Check if unit has an active or draft contract
    useEffect(() => {
        const checkContract = async () => {
            if (!unit || !isOpen) return;
            
            setCheckingContract(true);
            try {
                const contracts = await contractService.getAll();
                const unitHasContract = contracts.some((c: Contract) =>
                    c.unitId === unit.id && (c.contractStatus === 1 || c.contractStatus === 2)
                );
                setHasActiveContract(unitHasContract);
            } catch (error) {
                console.error("Failed to check contracts:", error);
                setHasActiveContract(false);
            } finally {
                setCheckingContract(false);
            }
        };
        
        checkContract();
    }, [unit, isOpen]);

    // Map the incoming data correctly
    useEffect(() => {
        if (unit) {
            setFormData({
                unitNo: unit.unitNo,
                floor: unit.floor,
                area: String(unit.area),
                rentPrice: unit.rentPrice,
                unitStatus: unit.unitStatus ?? 1
            });
        }
    }, [unit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (hasActiveContract) {
            return;
        }
        
        setIsSubmitting(true);

        try {
            const payload = {
                id: unit.id,
                unitNo: formData.unitNo,
                floor: String(formData.floor),
                area: String(formData.area),
                rentPrice: Number(formData.rentPrice),
                propertyId: unit.propertyId,
                UnitStatus: Number(formData.unitStatus)
            };

            await unitService.update(unit.id, payload);
            onUnitUpdated(unit.propertyId);
            onClose();
        } catch (err: unknown) {
            if(err instanceof Error) {
                console.error("Update failed:", err.message);
            }
         else {
            console.error("Update failed:", err);
        }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Edit Unit #{unit.unitNo}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {hasActiveContract && !checkingContract && (
                    <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Unit has an active or pending contract</p>
                            <p className="text-xs text-amber-600 mt-1">You cannot edit this unit while it has a draft or active contract. Please terminate or expire the contract first.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Unit Number</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text" required
                                disabled={hasActiveContract}
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                value={formData.unitNo}
                                onChange={(e) => setFormData({...formData, unitNo: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Floor</label>
                            <input
                                type="text" required
                                disabled={hasActiveContract}
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Area (sqm)</label>
                            <input
                                type="number" required
                                disabled={hasActiveContract}
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                value={formData.area}
                                onChange={(e) => setFormData({...formData, area: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1"> Rent</label>
                        <input
                            type="number" required
                            disabled={hasActiveContract}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            value={formData.rentPrice}
                            onChange={(e) => setFormData({...formData, rentPrice: Number(e.target.value)})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Status</label>
                        <select
                            disabled={hasActiveContract}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            value={formData.unitStatus}
                            onChange={(e) => setFormData({...formData, unitStatus: Number(e.target.value)})}
                        >
                            <option value={1}>Available</option>
                            <option value={2}>Rented</option>
                            <option value={3}>Under Maintenance</option>
                            <option value={4}>Reserved</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || hasActiveContract || checkingContract} 
                            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checkingContract ? "Checking..." : isSubmitting ? "Saving..." : <><Save size={18}/> Update Unit</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateUnitModal;