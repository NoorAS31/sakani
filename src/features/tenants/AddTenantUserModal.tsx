import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/authService';
import type { Tenant } from '../../types/tenant';

interface AddTenantUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenant: Tenant | null;
}

interface FormData {
    email: string;
    password: string;
    name: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    name?: string;
    general?: string;
}

const validateFormData = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
        errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
    }

    if (!formData.password.trim()) {
        errors.password = "Password is required.";
    }

    if (!formData.name.trim()) {
        errors.name = "Name is required.";
    }

    return errors;
};

const AddTenantUserModal = ({ isOpen, onClose, onSuccess, tenant }: AddTenantUserModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        name: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    if (!isOpen || !tenant) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    };

    const resetForm = () => {
        setFormData({ email: '', password: '', name: '' });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateFormData(formData);
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            await authService.registerTenantUser(tenant.id, {
                email: formData.email.trim(),
                password: formData.password,
                name: formData.name.trim()
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Failed to register tenant user", error);
            
            const axiosError = axios.isAxiosError(error);
            const status = axiosError ? error.response?.status ?? null : null;
            setErrorStatus(status);
            
            // Don't show error for 404s
            if (status === 404) {
                setErrors({});
                return;
            }
            
            const errorData = (error as { response?: { data?: unknown } }).response?.data as {
                errors?: Record<string, string[] | string>;
                title?: string;
                detail?: string;
                message?: string;
            } | undefined;

            const errorMessage = errorData?.detail || errorData?.title || errorData?.message || "Failed to create user account.";
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Add User for {tenant.name}</h2>

                    {errors.general && errorStatus !== 404 && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {errors.general}
                        </p>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all ${
                                    errors.name ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Full name"
                            />
                        </div>
                        {errors.name && <p className="text-[11px] text-red-600 ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all ${
                                    errors.email ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Email address"
                            />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-600 ml-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all ${
                                    errors.password ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="Password"
                            />
                        </div>
                        {errors.password && <p className="text-[11px] text-red-600 ml-1">{errors.password}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTenantUserModal;
