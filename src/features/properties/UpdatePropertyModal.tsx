import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types/property';

interface UpdatePropertyModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
    onPropertyUpdated: () => void;
}

const UpdatePropertyModal = ({ property, isOpen, onClose, onPropertyUpdated }: UpdatePropertyModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        street: '',
        addressRegion: '',
        buildingNo: '',
        propertyType: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    // Pre-fill form when the modal opens or the property changes
    useEffect(() => {
        if (property) {
            setFormData({
                name: property.name,
                city: property.city,
                street: property.street,
                addressRegion: property.addressRegion,
                buildingNo: property.buildingNo,
                propertyType: typeof property.propertyType === 'string' ? 1 : property.propertyType
            });
        }
    }, [property]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                id: property.id,
                ...formData,
                propertyType: Number(formData.propertyType)
            };

            await propertyService.update(property.id, payload);
            onPropertyUpdated();
            onClose();
        } catch (err: unknown) {
            const status = axios.isAxiosError(err) ? err.response?.status ?? null : null;
            setErrorStatus(status);
            if (status === 404) {
                setError(null);
                setIsSubmitting(false);
                return;
            }
            if(err instanceof Error) {
                console.error("update failed",err.message);
                setError("Failed to update property. Please try again.");
            }
            else{
                console.error("update failed");
                setError("Failed to update property. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Edit Property</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorStatus !== 404 && error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Property Name</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">City</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Region</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.addressRegion}
                                onChange={(e) => setFormData({...formData, addressRegion: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Street Address</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.street}
                                onChange={(e) => setFormData({...formData, street: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Building No.</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.buildingNo}
                                onChange={(e) => setFormData({...formData, buildingNo: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Type</label>
                            <select
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.propertyType}
                                onChange={(e) => setFormData({...formData, propertyType: Number(e.target.value)})}
                            >
                                <option value={1}>Residential</option>
                                <option value={2}>Commercial</option>
                                <option value={3}>Industrial</option>
                                <option value={4}>Mixed Use</option>
                            </select>
                        </div>
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
                            className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
                        >
                            {isSubmitting ? "Saving..." : <><Save size={18}/> Update Property</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePropertyModal;