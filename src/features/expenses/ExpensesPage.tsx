import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, ReceiptText, Trash2, X, Filter } from 'lucide-react';
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
    const [isCreateCardOpen, setIsCreateCardOpen] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterProperty, setFilterProperty] = useState<string>('');
    const [filterExpenseType, setFilterExpenseType] = useState<string>('');
    const [filterDateFrom, setFilterDateFrom] = useState<string>('');
    const [filterDateTo, setFilterDateTo] = useState<string>('');

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

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            if (filterProperty && expense.propertyId !== filterProperty) {
                return false;
            }
            if (filterExpenseType && expense.expenseType !== Number(filterExpenseType)) {
                return false;
            }
            const expenseDate = new Date(expense.expenseDate);
            if (filterDateFrom) {
                const fromDate = new Date(filterDateFrom);
                if (expenseDate < fromDate) {
                    return false;
                }
            }
            if (filterDateTo) {
                const toDate = new Date(filterDateTo);
                toDate.setHours(23, 59, 59, 999);
                if (expenseDate > toDate) {
                    return false;
                }
            }
            return true;
        });
    }, [expenses, filterProperty, filterExpenseType, filterDateFrom, filterDateTo]);

    const hasActiveFilters = filterProperty || filterExpenseType || filterDateFrom || filterDateTo;

    const resetFilters = () => {
        setFilterProperty('');
        setFilterExpenseType('');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const totalAmount = useMemo(
        () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        [filteredExpenses]
    );

    const latestExpense = useMemo(
        () =>
            filteredExpenses.length
                ? [...filteredExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())[0]
                : null,
        [filteredExpenses]
    );

    const topExpenseType = useMemo(() => {
        if (filteredExpenses.length === 0) {
            return '-';
        }

        const counts = new Map<string, number>();
        filteredExpenses.forEach((expense) => {
            const label = getExpenseTypeConfig(expense.expenseType).label;
            counts.set(label, (counts.get(label) ?? 0) + 1);
        });

        return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }, [filteredExpenses]);

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

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                        >
                            <Filter size={16} />
                            Filters
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreateCardOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                        >
                            <Plus size={16} />
                            Create New Expense
                        </button>
                    </div>
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
                    ) : filteredExpenses.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <ReceiptText className="mx-auto mb-3" size={36} />
                            {hasActiveFilters ? 'No expenses match the selected filters' : 'No expenses found'}
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
                                    {filteredExpenses.map(expense => (
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

            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
                        <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property</label>
                                    <select
                                        value={filterProperty}
                                        onChange={(e) => setFilterProperty(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        <option value="">All Properties</option>
                                        {properties.map(property => (
                                            <option key={property.id} value={property.id}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expense Type</label>
                                    <select
                                        value={filterExpenseType}
                                        onChange={(e) => setFilterExpenseType(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        <option value="">All Types</option>
                                        <option value={ExpenseType.Maintenance}>Maintenance</option>
                                        <option value={ExpenseType.Utility}>Utility</option>
                                        <option value={ExpenseType.Tax}>Tax</option>
                                        <option value={ExpenseType.Insurance}>Insurance</option>
                                        <option value={ExpenseType.Other}>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                                    <input
                                        type="date"
                                        value={filterDateFrom}
                                        onChange={(e) => setFilterDateFrom(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                                    <input
                                        type="date"
                                        value={filterDateTo}
                                        onChange={(e) => setFilterDateTo(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors font-semibold text-sm"
                                >
                                    <X size={16} />
                                    Reset Filters
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="ml-auto px-4 py-2 bg-gray-900 text-white hover:bg-black rounded-lg transition-colors font-semibold text-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesPage;
