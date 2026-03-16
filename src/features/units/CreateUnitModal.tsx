import React, { useState } from 'react'; // Added useState
import { X, Save, Lock, Hash, Move, Layers } from 'lucide-react';

const CreateUnitModal = ({ isOpen, onClose, tenantName }: { isOpen: boolean, onClose: () => void, tenantName: string | null }) => {

    // 1. ADD THIS: State initialization
    const [formData, setFormData] = useState({
        unitNo: '',
        propertyId: '',
        floor: '',
        area: '',
        rentPrice: '',
        unitStatus: 'Available'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Guard for numbers: don't even update state if value is negative
        if ((name === 'rentPrice' || name === 'area') && Number(value) < 0) {
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Create New Unit</h2>
                        <p className="text-xs text-gray-500">Adding a physical unit to a tenant's portfolio.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); console.log(formData); }}>
                    {/* Read-Only Tenant Name */}
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Account Owner (Tenant)</label>
                        <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <Lock size={14} className="text-gray-400" />
                            <span>{tenantName || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Unit Number */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Unit Number (unit_no)</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="unitNo"
                                    type="text"
                                    required
                                    value={formData.unitNo} // Added value binding
                                    onChange={handleChange} // Added onChange
                                    placeholder="e.g. 101-A"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Property / Building ID */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Property / Building</label>
                            <select
                                name="propertyId"
                                value={formData.propertyId} // Added value binding
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none bg-white"
                            >
                                <option value="">Select Property...</option>
                                <option value="prop_1">Garden Row Apartments</option>
                                <option value="prop_2">Sunset View Plaza</option>
                            </select>
                        </div>

                        {/* Floor */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Floor</label>
                            <div className="relative">
                                <Layers size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="floor"
                                    type="text"
                                    value={formData.floor} // Added value binding
                                    onChange={handleChange}
                                    placeholder="e.g. 2nd Floor"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Area */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Area (sqm)</label>
                            <div className="relative">
                                <Move size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="area"
                                    type="number"
                                    min={20}
                                    value={formData.area} // Added value binding
                                    placeholder="e.g. 85"
                                    onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Rent Price */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Monthly Rent (rent_price)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    name="rentPrice"
                                    type="number"
                                    placeholder="0.00"
                                    min={30}
                                    value={formData.rentPrice} // Added value binding
                                    onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Unit Status */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Status (unit_status)</label>
                            <select
                                name="unitStatus"
                                value={formData.unitStatus} // Added value binding
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none bg-white"
                            >
                                <option value="Available">Available</option>
                                <option value="Rented">Rented</option>
                                <option value="UnderMaintenance">Under Maintenance</option>
                                <option value="Reserved">Reserved</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
                            <Save size={18} />
                            Create Unit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUnitModal;