import React, { useState } from 'react';
import { X, Save, Building2, MapPin, Hash, Globe, Home } from 'lucide-react';
import { storage } from '../../utils/storage';
import {propertyService} from "../../services/propertyService.ts";

interface CreatePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPropertyCreated: () => void;
}

const CreatePropertyModal = ({ isOpen, onClose, onPropertyCreated }: CreatePropertyModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        street: '',
        addressRegion: '',
        buildingNo: '',
        propertyType: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'buildingNo' && Number(value) < 0) return;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'propertyType' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // Optional: add a loading state to your button

        try {
            const propertyPayload = {
                name: formData.name,
                city: formData.city,
                street: formData.street,
                addressRegion: formData.addressRegion,
                buildingNo: formData.buildingNo,
                propertyType: formData.propertyType,
                tenantId: storage.getTenantID()
            };

            const newPropertyId = await propertyService.create(propertyPayload);

            console.log("Property created with ID:", newPropertyId);
            onPropertyCreated();
            onClose();
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Add New Property</h2>
                        <p className="text-xs text-gray-500">Registering a new building for {storage.getTenantName()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Property Name */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Property Name</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="name" required placeholder="e.g. Al-Yasmeen Tower"
                                    value={formData.name} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* City */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">City</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="city" required placeholder="e.g. Amman"
                                    value={formData.city} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Region */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Region / District</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="addressRegion" required placeholder="e.g. Abdali"
                                    value={formData.addressRegion} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Street */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Street Name</label>
                            <input
                                name="street" required placeholder="e.g. King Hussein St."
                                value={formData.street} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none"
                            />
                        </div>

                        {/* Building No */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Building Number</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="buildingNo" type="number" required placeholder="44"
                                    value={formData.buildingNo} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Property Category</label>
                            <div className="relative">
                                <Home size={16} className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="propertyType"
                                    value={formData.propertyType} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-gray-500 outline-none bg-white appearance-none"
                                >
                                    <option value="1">Residential</option>
                                    <option value="2">Commercial</option>
                                    <option value="3">Industrial</option>
                                    <option value="4">Mixed-Use</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting} // Disable if already sending
                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Property
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePropertyModal;