import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface CreateTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTenantModal = ({ isOpen, onClose }: CreateTenantModalProps) => {
    // Initial state matches your DB fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        addressStreet: '',
        addressCity: '',
        addressRegion: '',
        status: 'Active' // Default
    });
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validation Checks
    const isNameValid = formData.name.length >= 4;
    const isEmailValid = isValidEmail(formData.email);
    const isPhoneValid = formData.phoneNumber.length >= 7;
    const isAddressValid = formData.addressStreet.length >= 5;

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && isAddressValid;


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // 1. Phone Number Restriction (Digits only)
        if (name === 'phoneNumber') {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove everything except 0-9
            if (onlyNums.length <= 15) { // Common max length for phone numbers
                setFormData(prev => ({ ...prev, [name]: onlyNums }));
            }
            return;
        }

        // 2. Name Length Restriction
        if (name === 'name' && value.length > 100) return;

        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Final check before sending to backend
        if (formData.phoneNumber.length < 7) {
            alert("Please enter a valid phone number.");
            return;
        }

        console.log("Ready to send to .NET:", formData);
        // When the backend is ready, we call tenantService.create(formData) here.
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Create New Tenant</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Section 1: Basic Information */}
                    <div>
                        <h3 className="underline text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Tenant Name</label>
                                <input name="name" type="text" onChange={handleChange}
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
                                <select name="status" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600 outline-none bg-white">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
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
                                <input name="phoneNumber" type="text" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600 outline-none" placeholder="+962    7XXXXXXXX" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Address Details */}
                    <div>
                        <h3 className="text-xs font-bold underline text-red-600 uppercase tracking-wider mb-4">Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-sm font-medium text-gray-700">Street Address</label>
                                <input name="addressStreet" type="text" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none" placeholder="123 Property Lane" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input name="addressCity" type="text" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-600-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Region</label>
                                <input name="addressRegion" type="text" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 outline-none" placeholder="e.g. State/Province" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                                isFormValid
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white active:scale-95'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Save size={18} />
                            Save Tenant
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CreateTenantModal;