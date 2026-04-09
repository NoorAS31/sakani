import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Loader2, FileText } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { unitService } from '../../services/unitService';
import { contractService } from '../../services/contractService';
import { accountingService } from '../../services/accountingService';
import type { Property } from '../../types/property';
import type {Unit} from '../../types/unit';
import type { Contract } from '../../types/contract';
import type { ExpectedPayment } from '../../types/accounting';
import { storage } from "../../utils/storage.ts";
import { usePageTitle } from '../../hooks/usePageTitle';

const DashboardPage = () => {
    usePageTitle('Dashboard');
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [upcomingExpectedPayments, setUpcomingExpectedPayments] = useState<ExpectedPayment[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 14);
            endDate.setHours(23, 59, 59, 999);

            const upcomingPromise = accountingService
                .getExpected(startDate.toISOString(), endDate.toISOString())
                .catch((err) => {
                    console.error("Failed to fetch upcoming expected payments", err);
                    return [];
                });

            if (storage.isSuperAdmin()) {
                const upcoming = await upcomingPromise;
                setUpcomingExpectedPayments(upcoming);
                setLoading(false);
                return;
            }

            try {
                const [props, allContracts, upcoming] = await Promise.all([
                    propertyService.getAll(),
                    contractService.getAll(),
                    upcomingPromise
                ]);
                setProperties(props);
                setContracts(allContracts);
                setUpcomingExpectedPayments(upcoming);
                setSelectedPropertyId(props[0]?.id ?? null);
                
                // Fetch units for each property
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
    // Unit Status Aggregation - handle both camelCase and PascalCase
    const getUnitStatus = (u: any) => u.unitStatus ?? u.UnitStatus;
    const unitStats = {
        available: allUnits.filter(u => getUnitStatus(u) === 1).length,
        rented: allUnits.filter(u => getUnitStatus(u) === 2).length,
        maintenance: allUnits.filter(u => getUnitStatus(u) === 3).length,
        reserved: allUnits.filter(u => getUnitStatus(u) === 4).length,
        total: allUnits.length
    };

    // Contract Status Aggregation - handle both camelCase and PascalCase
    const getContractStatus = (c: any) => c.contractStatus ?? c.ContractStatus;
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

    // Calculate ring segments for contracts
    const contractRingSegments = () => {
        if (contractStats.total === 0) return { active: 0, pending: 0, expired: 0, terminated: 0 };
        const total = contractStats.total;
        return {
            active: (contractStats.active / total) * 100,
            pending: (contractStats.pending / total) * 100,
            expired: (contractStats.expired / total) * 100,
            terminated: (contractStats.terminated / total) * 100
        };
    };

    const unitSegs = unitRingSegments();
    const contractSegs = contractRingSegments();
    const upcomingExpectedCount = upcomingExpectedPayments.length;
    const upcomingExpectedTotal = upcomingExpectedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const selectedProperty = properties.find((property) => property.id === selectedPropertyId) ?? null;
    const selectedPropertyUnits = selectedProperty
        ? allUnits.filter((unit) => unit.propertyId === selectedProperty.id)
        : [];
    const selectedPropertyUnitIds = new Set(selectedPropertyUnits.map((unit) => unit.id));
    const selectedPropertyContracts = contracts.filter((contract) => selectedPropertyUnitIds.has(contract.unitId));

    const getPropertyTypeLabel = (propertyType: string | number) => {
        const value = Number(propertyType);
        if (value === 1) return 'Residential';
        if (value === 2) return 'Commercial';
        if (value === 3) return 'Industrial';
        if (value === 4) return 'Mixed Use';
        return String(propertyType || 'Unknown');
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );
    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Tenant Dashboard</h1>
                <p className="text-gray-500 text-sm">Portfolio Overview & Property Health</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



                {/* Card 1: Unit Status (Preview Circle) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <Home size={18} className="text-orange-500" /> Unit Occupancy
                        </h2>
                    </div>

                    <div className="flex items-center justify-around h-32">
                        {/* The Visual Circle - SVG Donut Chart */}
                        <div className="relative w-28 h-28">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {/* Background circle */}
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                {/* Available - Green */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#22c55e" strokeWidth="3"
                                    strokeDasharray={`${unitSegs.available} ${100 - unitSegs.available}`}
                                    strokeDashoffset="0"
                                />
                                {/* Rented - Blue */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#3b82f6" strokeWidth="3"
                                    strokeDasharray={`${unitSegs.rented} ${100 - unitSegs.rented}`}
                                    strokeDashoffset={`${-unitSegs.available}`}
                                />
                                {/* Maintenance - Red */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#ef4444" strokeWidth="3"
                                    strokeDasharray={`${unitSegs.maintenance} ${100 - unitSegs.maintenance}`}
                                    strokeDashoffset={`${-(unitSegs.available + unitSegs.rented)}`}
                                />
                                {/* Reserved - Amber */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#f59e0b" strokeWidth="3"
                                    strokeDasharray={`${unitSegs.reserved} ${100 - unitSegs.reserved}`}
                                    strokeDashoffset={`${-(unitSegs.available + unitSegs.rented + unitSegs.maintenance)}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-gray-800">{unitStats.total}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Total Units</span>
                                </div>
                            </div>
                        </div>

                        {/* Legend matching your Enum Integer Statuses */}
                        <div className="text-xs space-y-2 font-medium">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-gray-600 w-20">Available</span>
                                <span className="font-bold text-gray-900">{unitStats.available}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-gray-600 w-20">Rented</span>
                                <span className="font-bold text-gray-900">{unitStats.rented}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-gray-600 w-20">Maintenance</span>
                                <span className="font-bold text-gray-900">{unitStats.maintenance}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                                <span className="text-gray-600 w-20">Reserved</span>
                                <span className="font-bold text-gray-900">{unitStats.reserved}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Contracts Overview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <FileText size={18} className="text-purple-500" /> Contracts
                        </h2>
                        <button 
                            onClick={() => navigate('/contracts')}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                        >
                            View All →
                        </button>
                    </div>

                    <div className="flex items-center justify-around h-32">
                        <div className="relative w-28 h-28">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {/* Background circle */}
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                {/* Active - Green */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#22c55e" strokeWidth="3"
                                    strokeDasharray={`${contractSegs.active} ${100 - contractSegs.active}`}
                                    strokeDashoffset="0"
                                />
                                {/* Pending - Blue */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#3b82f6" strokeWidth="3"
                                    strokeDasharray={`${contractSegs.pending} ${100 - contractSegs.pending}`}
                                    strokeDashoffset={`${-contractSegs.active}`}
                                />
                                {/* Expired - Amber */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#f59e0b" strokeWidth="3"
                                    strokeDasharray={`${contractSegs.expired} ${100 - contractSegs.expired}`}
                                    strokeDashoffset={`${-(contractSegs.active + contractSegs.pending)}`}
                                />
                                {/* Terminated - Red */}
                                <circle 
                                    cx="18" cy="18" r="15.915" fill="none" 
                                    stroke="#ef4444" strokeWidth="3"
                                    strokeDasharray={`${contractSegs.terminated} ${100 - contractSegs.terminated}`}
                                    strokeDashoffset={`${-(contractSegs.active + contractSegs.pending + contractSegs.expired)}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-gray-800">{contractStats.total}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Total</span>
                                </div>
                            </div>
                        </div>

                        {/* Legend ordered by priority: Active -> Draft -> Expired -> Terminated */}
                        <div className="text-xs space-y-2 font-medium">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-gray-600 w-20">Active</span>
                                <span className="font-bold text-gray-900">{contractStats.active}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-gray-600 w-20">Pending</span>
                                <span className="font-bold text-gray-900">{contractStats.pending}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                <span className="text-gray-600 w-20">Expired</span>
                                <span className="font-bold text-gray-900">{contractStats.expired}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-gray-600 w-20">Terminated</span>
                                <span className="font-bold text-gray-900">{contractStats.terminated}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 3: Expecting payments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Expected in 2 Weeks</p>
                        <p className="text-xl font-black text-gray-900 mt-1">${upcomingExpectedTotal.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{upcomingExpectedCount} upcoming payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/accounting')}
                        className="self-start sm:self-auto px-4 py-2 rounded-lg text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                        View Accounting
                    </button>
                </div>

            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Property Details</h2>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Click a property to preview
                    </span>
                </div>

                {properties.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center">
                        No properties available yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            {properties.map((property) => (
                                <button
                                    key={property.id}
                                    onClick={() => setSelectedPropertyId(property.id)}
                                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                                        selectedPropertyId === property.id
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 hover:bg-white'
                                    }`}
                                >
                                    <p className="font-bold text-sm text-gray-800">{property.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{property.city}</p>
                                </button>
                            ))}
                        </div>

                        <div className="xl:col-span-2 space-y-4">
                            {selectedProperty ? (
                                <>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-lg font-black text-gray-900">{selectedProperty.name}</p>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    {selectedProperty.city}, {selectedProperty.addressRegion}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">
                                                {getPropertyTypeLabel(selectedProperty.propertyType)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {selectedProperty.street} • Building #{selectedProperty.buildingNo}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-gray-200 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-bold text-gray-700">Units Preview</p>
                                                <button
                                                    onClick={() => navigate('/units')}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                                >
                                                    View Units →
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <div className="overflow-x-hidden">
                                                    <div className="flex gap-2">
                                                        {selectedPropertyUnits.slice(0, 3).map((unit, index) => (
                                                            <button
                                                                key={unit.id}
                                                                onClick={() => navigate('/units')}
                                                                className={`min-w-[44%] rounded-lg border border-gray-200 p-2 text-left bg-gray-50 hover:bg-white transition ${
                                                                    index === 2 ? 'opacity-60' : ''
                                                                }`}
                                                            >
                                                                <p className="text-sm font-bold text-gray-800">Unit #{unit.unitNo}</p>
                                                                <p className="text-[11px] text-gray-500 mt-0.5">Floor {unit.floor}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {selectedPropertyUnits.length > 2 && (
                                                    <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent" />
                                                )}
                                                {selectedPropertyUnits.length === 0 && (
                                                    <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500 text-center">
                                                        No units for this property.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-bold text-gray-700">Contracts Preview</p>
                                                <button
                                                    onClick={() => navigate('/contracts')}
                                                    className="text-xs font-bold text-purple-600 hover:text-purple-800"
                                                >
                                                    View Contracts →
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <div className="overflow-x-hidden">
                                                    <div className="flex gap-2">
                                                        {selectedPropertyContracts.slice(0, 3).map((contract, index) => (
                                                            <button
                                                                key={contract.id}
                                                                onClick={() => navigate('/contracts')}
                                                                className={`min-w-[44%] rounded-lg border border-gray-200 p-2 text-left bg-gray-50 hover:bg-white transition ${
                                                                    index === 2 ? 'opacity-60' : ''
                                                                }`}
                                                            >
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    Unit #{selectedPropertyUnits.find((unit) => unit.id === contract.unitId)?.unitNo ?? 'N/A'}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                                    Ends {new Date(contract.endDate).toLocaleDateString()}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {selectedPropertyContracts.length > 2 && (
                                                    <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent" />
                                                )}
                                                {selectedPropertyContracts.length === 0 && (
                                                    <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500 text-center">
                                                        No contracts linked to this property.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center">
                                    Select a property to view details.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

export default DashboardPage;
