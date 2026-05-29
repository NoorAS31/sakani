import React, { useState } from 'react';
import axios from 'axios';
import { X, User, Phone, CreditCard, Mail, AlignLeft, Save } from 'lucide-react';
import { renterService } from '../../services/renterService';

interface CreateRenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRenterCreated: () => void;
}

type RenterFormField = 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'nationalId' | 'description';
type FormErrors = Partial<Record<RenterFormField, string>>;

const fieldNameMap: Record<string, RenterFormField> = {
    firstname: 'firstName',
    lastname: 'lastName',
    email: 'email',
    phonenumber: 'phoneNumber',
    nationalid: 'nationalId',
    description: 'description',
};

const getFormFieldFromBackendKey = (key: string): RenterFormField | undefined => {
    const cleaned = key
        .replace(/^\$\./, '')
        .split('.')
        .pop()
        ?.replace(/\[\d+]/g, '')
        .toLowerCase();

    if (!cleaned) return undefined;
    return fieldNameMap[cleaned];
};

const validateFormData = (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
    description: string;
}): FormErrors => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nationalId.trim()) {
        errors.nationalId = "National ID is required.";
    } else if (!/^\d{10}$/.test(formData.nationalId.trim())) {
        errors.nationalId = "National ID must be exactly 10 digits.";
    }

    if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
        errors.phoneNumber = "Invalid phone number format.";
    }

    if (!formData.email.trim()) {
        errors.email = "A valid email is required for the renter's account.";
    } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = "A valid email is required for the renter's account.";
    }

    if (!formData.firstName.trim()) {
        errors.firstName = "First name is required.";
    } else if (formData.firstName.trim().length > 50) {
        errors.firstName = "First name cannot exceed 50 characters.";
    }

    if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required.";
    } else if (formData.lastName.trim().length > 50) {
        errors.lastName = "Last name cannot exceed 50 characters.";
    }

    return errors;
};

const CreateRenterModal = ({ isOpen, onClose, onRenterCreated }: CreateRenterModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        nationalId: '',
        description: ''
    });
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState('');
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as RenterFormField;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
        setGeneralError('');
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', nationalId: '', description: '' });
        setFieldErrors({});
        setGeneralError('');
        setErrorStatus(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clientValidationErrors = validateFormData(formData);
        if (Object.keys(clientValidationErrors).length > 0) {
            setFieldErrors(clientValidationErrors);
            return;
        }

        setFieldErrors({});
        setGeneralError('');
        setIsSubmitting(true);

        try {
            await renterService.create({
                ...formData,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                nationalId: formData.nationalId.trim(),
                description: formData.description.trim(),
            });
            onRenterCreated();
            handleClose();
        } catch (error) {
            console.error("Failed to create renter", error);
            
            const axiosError = axios.isAxiosError(error);
            const status = axiosError ? error.response?.status ?? null : null;
            setErrorStatus(status);
            
            // Don't show error for 404s
            if (status === 404) {
                setFieldErrors({});
                setGeneralError('');
                return;
            }
            
            const data = (error as { response?: { data?: unknown } }).response?.data as {
                errors?: Record<string, string[] | string>;
                title?: string;
                detail?: string;
                message?: string;
            } | undefined;

            const backendErrors = data?.errors;
            const parsedErrors: FormErrors = {};

            if (backendErrors && typeof backendErrors === 'object') {
                Object.entries(backendErrors).forEach(([key, value]) => {
                    const field = getFormFieldFromBackendKey(key);
                    if (!field) return;
                    const message = Array.isArray(value) ? value[0] : value;
                    if (message) parsedErrors[field] = message;
                });
            }

            if (Object.keys(parsedErrors).length > 0) {
                setFieldErrors(parsedErrors);
                setGeneralError("Please fix the highlighted fields.");
            } else {
                setGeneralError(data?.detail || data?.title || data?.message || "Error creating renter. Please check your data.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">New Renter Profile</h2>
                            <p className="text-xs text-gray-400">Add a resident to your system</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {generalError && errorStatus !== 404 && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {generalError}
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all ${
                                        fieldErrors.firstName ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="e.g. Ahmad"
                                />
                            </div>
                            {fieldErrors.firstName && <p className="text-[11px] text-red-600 ml-1">{fieldErrors.firstName}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all ${
                                        fieldErrors.lastName ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="e.g. Al-Khalili"
                                />
                            </div>
                            {fieldErrors.lastName && <p className="text-[11px] text-red-600 ml-1">{fieldErrors.lastName}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">National ID / Passport</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="nationalId"
                                    value={formData.nationalId}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all ${
                                        fieldErrors.nationalId ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="ID Number"
                                />
                            </div>
                            {fieldErrors.nationalId && <p className="text-[11px] text-red-600 ml-1">{fieldErrors.nationalId}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all ${
                                        fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="07X..."
                                />
                            </div>
                            {fieldErrors.phoneNumber && <p className="text-[11px] text-red-600 ml-1">{fieldErrors.phoneNumber}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all ${
                                    fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                                }`}
                                placeholder="ahmad@example.com"
                            />
                        </div>
                        {fieldErrors.email && <p className="text-[11px] text-red-600 ml-1">{fieldErrors.email}</p>}
                    </div>

                    {/* Description/Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Notes / Description</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-none"
                                placeholder="Additional details..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
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
                            className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : <><Save size={18} /> Create Renter</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRenterModal;
