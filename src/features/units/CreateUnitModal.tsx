import React, { useState } from 'react';
import { X, Home, Layers, Maximize, DollarSign, Save } from 'lucide-react';
import { unitService } from '../../services/unitService';

interface CreateUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string | null; // The ID from the clicked property row
    onUnitCreated: () => void;
    tenantName: string | null;
}

const CreateUnitModal = ({ isOpen, onClose, propertyId, onUnitCreated, tenantName }: CreateUnitModalProps) => {
    // Initial state matching your Task interface logic
    const [formData, setFormData] = useState({
        unitNo: '',
        floor: '',
        area: '',
        rentPrice: '',
        UnitStatus: 1,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        setIsSubmitting(true);
        try {
            const payload = {
                unitNo: formData.unitNo,
                floor: String(formData.floor),
                area: String(formData.area),
                rentPrice: Number(formData.rentPrice),
                propertyId: propertyId,
                UnitStatus: Number(formData.UnitStatus)
            };

            await unitService.create(payload);
            onUnitCreated(); // Refresh the list in UnitsPage
            onClose();
            // Reset form
            setFormData({ unitNo: '', floor: '', area: '', rentPrice: '', UnitStatus: 1 });
        } catch (err) {
            console.error("Failed to create unit:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Add New Unit</h2>
                        <p className="text-xs text-gray-500 font-medium">Adding to {tenantName || 'Portfolio'}</p>
                    </div>
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
                                type="text" required placeholder="e.g. 101"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                                value={formData.unitNo}
                                onChange={(e) => setFormData({...formData, unitNo: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Floor</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="number" required placeholder="0"
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Area (sqm)</label>
                            <div className="relative">
                                <Maximize className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="number" required placeholder="120"
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                    value={formData.area}
                                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block  text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Monthly Rent</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="number"
                                min={50}
                                required placeholder="100"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                value={formData.rentPrice}
                                onChange={(e) => setFormData({...formData, rentPrice: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Status</label>
                        <select
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none bg-white font-medium text-gray-700"
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
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-3 border rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={isSubmitting}
                            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {isSubmitting ? "Saving..." : <><Save size={18}/> Create Unit</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUnitModal;