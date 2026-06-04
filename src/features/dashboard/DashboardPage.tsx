import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Home, Loader2, FileText, TrendingUp, DollarSign, 
    Building2, CheckCircle2, TrendingDown, Lock
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { unitService } from '../../services/unitService';
import { contractService } from '../../services/contractService';
import { accountingService } from '../../services/accountingService';
import type { Property } from '../../types/property';
import type {Unit} from '../../types/unit';
import type { Contract } from '../../types/contract';
import type { AccountingStats } from '../../types/accounting';
import { usePageTitle } from '../../hooks/usePageTitle';
import { storage } from '../../utils/storage';

const DashboardPage = () => {
    usePageTitle('Dashboard');
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [accountingStats, setAccountingStats] = useState<AccountingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccountingAccess, setHasAccountingAccess] = useState(true);
    const userRole = storage.getRole();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            const statsPromise = accountingService
                .getStats(today.getMonth() + 1, today.getFullYear(), monthStart.toISOString(), monthEnd.toISOString(), 1)
                .then(stats => {
                    setHasAccountingAccess(true);
                    return stats;
                })
                .catch((err) => {
                    // Handle 403 permission errors gracefully
                    if (err.response?.status === 403) {
                        setHasAccountingAccess(false);
                        return null;
                    }
                    console.error("Failed to fetch accounting stats", err);
                    return null;
                });

            try {
                const [props, allContracts, stats] = await Promise.all([
                    propertyService.getAll(),
                    contractService.getAll(),
                    statsPromise
                ]);
                setProperties(props);
                setContracts(allContracts);
                if (stats) setAccountingStats(stats);
                
                const unitsPromises = props.map((p: Property) => 
                    unitService.getByPropertyId(p.id).catch(() => [])
                );
                const unitsArrays = await Promise.all(unitsPromises);
                const units = unitsArrays.flat();
                setAllUnits(units);
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    const getUnitStatus = (u: Unit) => u.unitStatus;
    const unitStats = {
        available: allUnits.filter(u => getUnitStatus(u) === 1).length,
        rented: allUnits.filter(u => getUnitStatus(u) === 2).length,
        maintenance: allUnits.filter(u => getUnitStatus(u) === 3).length,
        reserved: allUnits.filter(u => getUnitStatus(u) === 4).length,
        total: allUnits.length
    };

    const getContractStatus = (c: Contract) => c.contractStatus;
    const contractStats = {
        active: contracts.filter(c => getContractStatus(c) === 2).length,
        pending: contracts.filter(c => getContractStatus(c) === 1).length,
        expired: contracts.filter(c => getContractStatus(c) === 3).length,
        terminated: contracts.filter(c => getContractStatus(c) === 4).length,
        total: contracts.length
    };

    // Calculate ring segments for units
    const unitRingSegments = () => {
        if (unitStats.total === 0) return { available: 0, rented: 0, maintenance: 0, reserved: 0 };
        const total = unitStats.total;
        return {
            available: (unitStats.available / total) * 100,
            rented: (unitStats.rented / total) * 100,
            maintenance: (unitStats.maintenance / total) * 100,
            reserved: (unitStats.reserved / total) * 100
        };
    };

    const unitSegs = unitRingSegments();

    if (loading) return (
        <div className="h-96 flex items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8 page-fade-in">
            <div className="mb-6 sm:mb-8 card-fade-in-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Real-time portfolio and financial overview</p>
            </div>

            {hasAccountingAccess ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 card-fade-in-2">
                    {/* Expected Revenue */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-blue-100 dark:border-blue-900 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">This Month</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Expected Revenue</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">${(accountingStats?.totalExpectedMonth ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">Revenue to be collected</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-green-100 dark:border-green-900 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">Collected</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Collected Revenue</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">${(accountingStats?.totalCollectedMonth ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">{accountingStats ? ((accountingStats.totalCollectedMonth / (accountingStats.totalExpectedMonth || 1)) * 100).toFixed(1) : '0'}% collected</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-red-100 dark:border-red-900 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">Outflow</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">SS{(accountingStats?.expensesMonth ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">Operating expenses</p>
                    </div>

                    {/* Net Income */}
                    <div className={`rounded-xl shadow-sm dark:shadow-lg border p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow ${
                        (accountingStats?.netIncomeMonth ?? 0) >= 0 
                            ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900' 
                            : 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-900'
                    }`}>
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className={`p-2 sm:p-3 rounded-lg ${
                                (accountingStats?.netIncomeMonth ?? 0) >= 0 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30' 
                                    : 'bg-amber-50 dark:bg-amber-900/30'
                            }`}>
                                <TrendingUp size={20} className={
                                    (accountingStats?.netIncomeMonth ?? 0) >= 0 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : 'text-amber-600 dark:text-amber-400'
                                } />
                            </div>
                            <span className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${
                                (accountingStats?.netIncomeMonth ?? 0) >= 0 
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                                    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                            }`}>
                                {(accountingStats?.netIncomeMonth ?? 0) >= 0 ? 'Positive' : 'Negative'}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Net Income</p>
                        <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${
                            (accountingStats?.netIncomeMonth ?? 0) >= 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            ${(accountingStats?.netIncomeMonth ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">Revenue minus expenses</p>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-purple-100 dark:border-purple-900 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">Utilization</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{(accountingStats?.occupancyRate ?? 0).toFixed(1)}%</p>
                        <div className="mt-2 sm:mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                            <div 
                                className="bg-purple-600 dark:bg-purple-500 h-1.5 sm:h-2 rounded-full" 
                                style={{ width: `${Math.min((accountingStats?.occupancyRate ?? 0), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 sm:mb-8 card-fade-in-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center justify-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 lg:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <Lock size={24} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Financial Details Unavailable</h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">You don't have permission to view accounting and financial details.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {userRole !== 'SuperAdmin' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 card-fade-in-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Home size={18} className="text-orange-500" />
                            <span className="hidden sm:inline">Unit Status</span>
                            <span className="sm:hidden">Units</span>
                        </h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        {/* Circle - responsive layout */}
                        <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-32 lg:h-32 xl:w-64 xl:h-64 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-gray-700" />
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" 
                                        stroke="#22c55e" strokeWidth="3"
                                        strokeDasharray={`${unitSegs.available} ${100 - unitSegs.available}`}
                                        strokeDashoffset="0"
                                    />
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" 
                                        stroke="#3b82f6" strokeWidth="3"
                                        strokeDasharray={`${unitSegs.rented} ${100 - unitSegs.rented}`}
                                        strokeDashoffset={`${-unitSegs.available}`}
                                    />
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" 
                                        stroke="#ef4444" strokeWidth="3"
                                        strokeDasharray={`${unitSegs.maintenance} ${100 - unitSegs.maintenance}`}
                                        strokeDashoffset={`${-(unitSegs.available + unitSegs.rented)}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl sm:text-3xl lg:text-2xl xl:text-5xl font-bold text-gray-900 dark:text-white">{unitStats.total}</span>
                                </div>
                            </div>

                            {/* Legend - below circle on XL, beside on LG */}
                            <div className="text-xs sm:text-sm space-y-1 sm:space-y-2 w-full lg:w-auto xl:space-y-0 xl:flex xl:gap-8">
                                <div className="flex items-center gap-2 lg:flex-col lg:items-start xl:flex-col xl:items-start">
                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                                    <span className="font-bold text-gray-900 dark:text-white ml-auto lg:ml-0 xl:ml-0">{unitStats.available}</span>
                                </div>
                                <div className="flex items-center gap-2 lg:flex-col lg:items-start xl:flex-col xl:items-start">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Rented</span>
                                    <span className="font-bold text-gray-900 dark:text-white ml-auto lg:ml-0 xl:ml-0">{unitStats.rented}</span>
                                </div>
                                <div className="flex items-center gap-2 lg:flex-col lg:items-start xl:flex-col xl:items-start">
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                                    <span className="font-bold text-gray-900 dark:text-white ml-auto lg:ml-0 xl:ml-0">{unitStats.maintenance}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contract Status */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={18} className="text-purple-500" />
                            <span className="hidden sm:inline">Contracts</span>
                        </h2>
                        <button 
                            onClick={() => navigate('/contracts')}
                            className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-bold whitespace-nowrap"
                        >
                            View All →
                        </button>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Active</span>
                            <span className="font-bold text-gray-900 dark:text-white">{contractStats.active}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Pending</span>
                            <span className="font-bold text-gray-900 dark:text-white">{contractStats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Expired</span>
                            <span className="font-bold text-gray-900 dark:text-white">{contractStats.expired}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Terminated</span>
                            <span className="font-bold text-gray-900 dark:text-white">{contractStats.terminated}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Info */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
                    <div className="space-y-2 sm:space-y-3">
                        <button
                            onClick={() => navigate('/property')}
                            className="w-full p-2 sm:p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Properties</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{properties.length} total</p>
                        </button>
                        <button
                            onClick={() => navigate('/units')}
                            className="w-full p-2 sm:p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                            <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Units</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{unitStats.total} total</p>
                        </button>
                        <button
                            onClick={() => navigate('/expenses')}
                            className="w-full p-2 sm:p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Expenses</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Manage monthly costs</p>
                        </button>
                        <button
                            onClick={() => navigate('/accounting')}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                            <p className="font-bold text-gray-900 dark:text-white">Financial Details</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">View full accounting</p>
                        </button>
                    </div>
                </div>
                </div>
                    )}
        </div>

    );
};

export default DashboardPage;
