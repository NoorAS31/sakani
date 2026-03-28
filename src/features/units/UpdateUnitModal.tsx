import React, { useState, useEffect } from 'react';
import { X, Save, Home} from 'lucide-react';
import { unitService } from '../../services/unitService';
import type { Unit } from '../../types/unit';

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
        UnitStatus: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FIX 1: Map the incoming data correctly
    useEffect(() => {
        if (unit) {
            setFormData({
                unitNo: unit.unitNo,
                floor: unit.floor,
                area: String(unit.area),
                rentPrice: unit.rentPrice,
                UnitStatus: (unit as any).status ?? unit.unitStatus ?? 1
            });
        }
    }, [unit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                id: unit.id,
                unitNo: formData.unitNo,
                floor: String(formData.floor),
                area: String(formData.area),
                rentPrice: Number(formData.rentPrice),
                propertyId: unit.propertyId,
                UnitStatus: Number(formData.UnitStatus)
            };

            await unitService.update(unit.id, payload);
            onUnitUpdated(unit.propertyId);
            onClose();
        } catch (err: any) {
            console.error("Update failed:", err.response?.data || err.message);
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Unit Number</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text" required
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
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
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Area (sqm)</label>
                            <input
                                type="number" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                value={formData.area}
                                onChange={(e) => setFormData({...formData, area: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Monthly Rent</label>
                        <input
                            type="number" required
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                            value={formData.rentPrice}
                            onChange={(e) => setFormData({...formData, rentPrice: Number(e.target.value)})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Status</label>
                        <select
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                            value={formData.UnitStatus}
                            onChange={(e) => setFormData({...formData, UnitStatus: Number(e.target.value)})}
                        >
                            <option value={1}>Available</option>
                            <option value={2}>Rented</option>
                            <option value={3}>Under Maintenance</option>
                            <option value={4}>Reserved</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2">
                            {isSubmitting ? "Saving..." : <><Save size={18}/> Update Unit</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateUnitModal;