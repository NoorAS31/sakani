import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types/tenant';

interface UpdateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTenantUpdated: () => void;
    tenant: Tenant | null;
}

const UpdateTenantModal = ({ isOpen, onClose, onTenantUpdated, tenant }: UpdateTenantModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        addressStreet: '',
        addressCity: '',
        addressRegion: '',
        status: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    useEffect(() => {
        if (tenant && isOpen) {
            setFormData({
                name: tenant.name || '',
                email: tenant.email || '',
                phoneNumber: tenant.phoneNumber || '',
                addressStreet: tenant.addressStreet || '',
                addressCity: tenant.addressCity || '',
                addressRegion: tenant.addressRegion || '',
                status: tenant.status || 1
            });
            setError('');
        }
    }, [tenant, isOpen]);

    if (!isOpen || !tenant) return null;

    // Validation Checks - moved after guard clause
    const isNameValid = formData.name.length >= 4;
    const isEmailValid = isValidEmail(formData.email);
    const isPhoneValid = formData.phoneNumber.length >= 7;
    const isAddressValid = formData.addressStreet.length >= 5;

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && isAddressValid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setError('');

        if (name === 'phoneNumber') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            if (onlyNums.length <= 15) {
                setFormData(prev => ({ ...prev, [name]: onlyNums }));
            }
            return;
        }

        if (name === 'status') {
            if (value !== '') {
                setFormData(prev => ({ ...prev, [name]: Number(value) }));
            }
            return;
        }

        if (name === 'name' && value.length > 100) return;

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phoneNumber.length < 7) {
            alert("Please enter a valid phone number.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await tenantService.update(tenant.id, {
                id: tenant.id,
                ...formData
            });
            onTenantUpdated();
            onClose();
        } catch (err: any) {
            console.error("Failed to update tenant", err);
            setError(err.response?.data?.message || "Failed to update tenant. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Update Tenant</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="underline text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Tenant Name</label>
                                <input name="name" type="text" onChange={handleChange} value={formData.name}
                                       className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                                           formData.name && !isNameValid ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-500'
                                       }`}
                                       placeholder="Min 4 characters" />
                                {formData.name && !isNameValid && (
                                    <p className="text-[10px] text-red-500 font-medium italic">Name must be at least 4 characters.</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600 outline-none bg-white">
                                    <option value="">-- Select Status --</option>
                                    <option value={1}>Active</option>
                                    <option value={2}>Suspended</option>
                                    <option value={3}>Inactive</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                                        formData.email && !isEmailValid ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-500'
                                    }`}
                                    placeholder="contact@company.com"
                                />
                                {formData.email && !isEmailValid && (
                                    <p className="text-[10px] text-red-500 font-medium italic">Please enter a valid email address.</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    name="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                                        formData.phoneNumber && !isPhoneValid ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-500'
                                    }`}
                                    placeholder="Enter phone number"
                                />
                                {formData.phoneNumber && !isPhoneValid && (
                                    <p className="text-[10px] text-red-500 font-medium italic">Phone number must be at least 7 digits.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Address Information */}
                    <div>
                        <h3 className="underline text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-gray-700">Street Address</label>
                                <input
                                    name="addressStreet"
                                    type="text"
                                    value={formData.addressStreet}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                                        formData.addressStreet && !isAddressValid ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-500'
                                    }`}
                                    placeholder="e.g., 123 Business Ave"
                                />
                                {formData.addressStreet && !isAddressValid && (
                                    <p className="text-[10px] text-red-500 font-medium italic">Street address must be at least 5 characters.</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    name="addressCity"
                                    type="text"
                                    value={formData.addressCity}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600 outline-none transition-all"
                                    placeholder="e.g., Cairo"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Region/State</label>
                                <input
                                    name="addressRegion"
                                    type="text"
                                    value={formData.addressRegion}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600 outline-none transition-all"
                                    placeholder="e.g., Cairo Governorate"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-black transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isSubmitting ? 'Updating...' : 'Update Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTenantModal;
