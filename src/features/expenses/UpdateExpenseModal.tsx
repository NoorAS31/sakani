import { useState, useEffect, type FormEvent } from 'react';
import { Edit3, X } from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import { ExpenseType, type ExpenseCategory } from '../../types/expense';
import type { Expense } from '../../types/expense';

interface UpdateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: Expense | null;
    onExpenseUpdated: () => void | Promise<void>;
}

const expenseTypeOptions = [
    { value: ExpenseType.Maintenance, label: 'Maintenance' },
    { value: ExpenseType.Utility, label: 'Utility' },
    { value: ExpenseType.Tax, label: 'Tax' },
    { value: ExpenseType.Insurance, label: 'Insurance' },
    { value: ExpenseType.Other, label: 'Other' }
];

const UpdateExpenseModal = ({ isOpen, onClose, expense, onExpenseUpdated }: UpdateExpenseModalProps) => {
    const [formData, setFormData] = useState({
        expenseId: expense?.expenseID ?? '',
        amount: expense?.amount.toString() ?? '',
        description: expense?.description ?? '',
        expenseType: expense?.expenseType ?? 1
    });
    const [submitting, setSubmitting] = useState(false);

    // Update form data when expense changes
    useEffect(() => {
        if (expense) {
            setFormData({
                expenseId: expense.expenseID,
                amount: expense.amount.toString(),
                description: expense.description ?? '',
                expenseType: expense.expenseType
            });
        }
    }, [expense]);

    if (!isOpen || !expense) {
        return null;
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.amount || Number(formData.amount) <= 0) {
            return;
        }

        try {
            setSubmitting(true);
            await expenseService.update(expense.expenseID, {
                expenseId: formData.expenseId,
                amount: Number(formData.amount),
                description: formData.description || '',
                expenseType: Number(formData.expenseType)
            });

            onClose();
            await onExpenseUpdated();
        } catch (err) {
            console.error('Failed to update expense:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-600 p-6 text-white relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex flex-col items-center text-center mt-2">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
                            <Edit3 size={28} />
                        </div>
                        <h2 className="text-xl font-bold">Update Expense</h2>
                        <p className="text-xs text-slate-100">Modify expense details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                expenseType: parseInt(e.target.value, 10) as ExpenseCategory
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
                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {submitting ? 'Updating...' : 'Update Expense'}
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
        </div>
    );
};

export default UpdateExpenseModal;
