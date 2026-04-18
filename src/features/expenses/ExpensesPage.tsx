import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle.ts';
import { expenseService } from '../../services/expenseService.ts';
import { propertyService } from '../../services/propertyService.ts';
import { unitService } from '../../services/unitService.ts';
import { ExpenseType, type Expense } from '../../types/expense.ts';
import type { Property } from '../../types/property.ts';
import type { Unit } from '../../types/unit.ts';
import CreateExpenseModal from './CreateExpenseModal.tsx';

const ExpensesPage = () => {
    usePageTitle('Expenses');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const data = await expenseService.getAll();
            setExpenses(data);
        } catch (err) {
            console.error('Failed to load expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([propertyService.getAll(), expenseService.getAll(), unitService.getAll()])
            .then(([propertyData, expenseData, unitData]) => {
                setProperties(propertyData);
                setExpenses(expenseData);
                setUnits(unitData);
            })
            .catch(err => {
                console.error('Failed to load expenses page data:', err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDeleteExpense = async (expenseId: string) => {
        if (!window.confirm('Delete this expense?')) {
            return;
        }

        try {
            setDeletingId(expenseId);
            await expenseService.delete(expenseId);
            await loadExpenses();
        } catch (err) {
            console.error('Failed to delete expense:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const propertyNameById = properties.reduce<Record<string, string>>((acc, property) => {
        acc[property.id] = property.name;
        return acc;
    }, {});

    const unitNameById = units.reduce<Record<string, string>>((acc, unit) => {
        acc[unit.id] = `Unit #${unit.unitNo}`;
        return acc;
    }, {});

    const totalAmount = useMemo(
        () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
        [expenses]
    );

    const latestExpense = useMemo(
        () =>
            expenses.length
                ? [...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())[0]
                : null,
        [expenses]
    );

    const topExpenseType = useMemo(() => {
        if (expenses.length === 0) {
            return '-';
        }

        const counts = new Map<string, number>();
        expenses.forEach((expense) => {
            const label = getExpenseTypeConfig(expense.expenseType).label;
            counts.set(label, (counts.get(label) ?? 0) + 1);
        });

        return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }, [expenses]);

    function getExpenseTypeConfig(typeNum: number) {
        switch (typeNum) {
            case ExpenseType.Maintenance:
                return { label: 'Maintenance', color: 'bg-indigo-50 text-indigo-700' };
            case ExpenseType.Utility:
                return { label: 'Utility', color: 'bg-blue-50 text-blue-700' };
            case ExpenseType.Tax:
                return { label: 'Tax', color: 'bg-amber-50 text-amber-700' };
            case ExpenseType.Insurance:
                return { label: 'Insurance', color: 'bg-violet-50 text-violet-700' };
            case ExpenseType.Other:
                return { label: 'Other', color: 'bg-gray-100 text-gray-700' };
            default:
                return { label: `#${typeNum}`, color: 'bg-gray-100 text-gray-700' };
        }
    }

    return (
        <div className="p-6 flex flex-row gap-6 relative min-h-screen">
            <div className={`transition-all duration-300 ${isCreateCardOpen ? 'w-8/12' : 'w-full'} space-y-6`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
                        <p className="text-sm text-gray-500">Track and manage property expenses</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateCardOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                    >
                        <Plus size={16} />
                        Create New Expense
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Top Category</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{topExpenseType}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Last Activity</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                            {latestExpense ? new Date(latestExpense.expenseDate).toLocaleDateString() : '-'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {latestExpense ? getExpenseTypeConfig(latestExpense.expenseType).label : 'No expenses yet'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 flex justify-center">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <ReceiptText className="mx-auto mb-3" size={36} />
                            No expenses found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left px-4 py-3">Date</th>
                                        <th className="text-left px-4 py-3">Property</th>
                                        <th className="text-left px-4 py-3">Unit</th>
                                        <th className="text-left px-4 py-3">Type</th>
                                        <th className="text-left px-4 py-3">Description</th>
                                        <th className="text-right px-4 py-3">Amount</th>
                                        <th className="text-right px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(expense => (
                                        <tr key={expense.expenseID} className="border-t border-gray-100">
                                            <td className="px-4 py-3 text-gray-700">
                                                {new Date(expense.expenseDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {propertyNameById[expense.propertyId] ?? expense.propertyId}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {expense.unitId ? (unitNameById[expense.unitId] ?? expense.unitId) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getExpenseTypeConfig(expense.expenseType).color}`}>
                                                    {getExpenseTypeConfig(expense.expenseType).label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{expense.description || '-'}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                ${expense.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExpense(expense.expenseID)}
                                                    disabled={deletingId === expense.expenseID}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <CreateExpenseModal
                isOpen={isCreateCardOpen}
                onClose={() => setIsCreateCardOpen(false)}
                properties={properties}
                onExpenseCreated={loadExpenses}
            />
        </div>
    );
};

export default ExpensesPage;
