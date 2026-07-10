import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import axios from 'axios';
import { expenseService } from '../../services/expenseService.ts';
import { unitService } from '../../services/unitService.ts';
import { ExpenseType } from '../../types/expense.ts';
import type { Property } from '../../types/property.ts';
import type { Unit } from '../../types/unit.ts';

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: Property[];
    onExpenseCreated: () => void | Promise<void>;
}

const expenseTypeOptions = [
    { value: ExpenseType.Maintenance, label: 'Maintenance' },
    { value: ExpenseType.Utility, label: 'Utility' },
    { value: ExpenseType.Tax, label: 'Tax' },
    { value: ExpenseType.Insurance, label: 'Insurance' },
    { value: ExpenseType.Other, label: 'Other' }
];

const getInitialFormState = () => ({
    propertyId: '',
    unitId: '',
    amount: '',
    description: '',
    expenseType: 1
});

const CreateExpenseModal = ({ isOpen, onClose, properties, onExpenseCreated }: CreateExpenseModalProps) => {
    const [formData, setFormData] = useState(getInitialFormState);
    const [formUnits, setFormUnits] = useState<Unit[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!formData.propertyId) {
            setFormUnits([]);
            return;
        }

        unitService.getByPropertyId(formData.propertyId)
            .then(setFormUnits)
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setFormUnits([]);
                    return;
                }
                console.error('Failed to load units for expense form:', err);
            });
    }, [formData.propertyId]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.propertyId || !formData.amount || Number(formData.amount) <= 0) {
            return;
        }

        try {
            setSubmitting(true);
            await expenseService.create({
                propertyId: formData.propertyId,
                unitId: formData.unitId || null,
                amount: Number(formData.amount),
                description: formData.description || '',
                expenseType: Number(formData.expenseType)
            });

            setFormData(getInitialFormState());
            onClose();
            await onExpenseCreated();
        } catch (err) {
            console.error('Failed to create expense:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-4/12 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-fit sticky top-8 animate-in slide-in-from-right duration-300">
            <div className="bg-gray-900 p-6 text-white relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
                        <Plus size={28} />
                    </div>
                    <h2 className="text-xl font-bold">Create New Expense</h2>
                    <p className="text-xs text-gray-300">Add expense details for your portfolio</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Property</label>
                    <div className="relative">
                        <Building2 size={15} className="absolute left-3 top-2.5 text-gray-400" />
                        <select
                            value={formData.propertyId}
                            onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value, unitId: '' }))}
                            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm"
                            required
                        >
                            <option value="">Select Property</option>
                            {properties.map(property => (
                                <option key={property.id} value={property.id}>
                                    {property.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit (Optional)</label>
                    <select
                        value={formData.unitId}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                        disabled={!formData.propertyId}
                    >
                        <option value="">All Property Units</option>
                        {formUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                                Unit #{unit.unitNo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Expense Type</label>
                        <select
                            value={formData.expenseType}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expenseType: parseInt(e.target.value, 10)
                            }))}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                            required
                        >
                            {expenseTypeOptions.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea
                        placeholder="Short note about this expense"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm min-h-24"
                    />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-60"
                    >
                        {submitting ? 'Saving...' : 'Create Expense'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateExpenseModal;
