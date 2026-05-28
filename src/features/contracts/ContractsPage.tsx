import { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, Search, Calendar, DollarSign, User, Home, X, Loader2, Clock, Download, XCircle, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import { contractService } from '../../services/contractService';
import { unitService } from '../../services/unitService';
import { renterService } from '../../services/renterService';
import type { Contract } from '../../types/contract';
import type { Unit } from '../../types/unit';
import type { Renter } from '../../types/renter';
import CreateContractModal from './CreateContractModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useLocation, useNavigate } from 'react-router-dom';

interface ContractDisplay extends Contract {
    unitNo?: string;
    renterName?: string;
}

interface Filters {
    status: string;
    renterId: string;
    paymentFreq: string;
    startDateFrom: string;
    startDateTo: string;
    endDateFrom: string;
    endDateTo: string;
}

const getPaymentFreqLabel = (freq: number): string => {
    switch (freq) {
        case 1: return 'Monthly';
        case 3: return 'Quarterly';
        case 6: return 'Semi-Annually';
        case 12: return 'Yearly';
        default: return 'Monthly';
    }
};

const ContractsPage = () => {
    usePageTitle('Contracts');
    const location = useLocation();
    const navigate = useNavigate();
    const contractIdFromQuery = useMemo(
        () => new URLSearchParams(location.search).get('contractId')?.trim() ?? '',
        [location.search]
    );
    const [contracts, setContracts] = useState<ContractDisplay[]>([]);
    const [renters, setRenters] = useState<Renter[]>([]);
    const [selectedContract, setSelectedContract] = useState<ContractDisplay | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') ?? '');
    const [isTerminating, setIsTerminating] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        status: '',
        renterId: '',
        paymentFreq: '',
        startDateFrom: '',
        startDateTo: '',
        endDateFrom: '',
        endDateTo: '',
    });

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(v => v !== '').length;
    }, [filters]);

    const clearFilters = () => {
        setFilters({
            status: '',
            renterId: '',
            paymentFreq: '',
            startDateFrom: '',
            startDateTo: '',
            endDateFrom: '',
            endDateTo: '',
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const renterSearch = params.get('search') ?? '';
        const renterNameFilter = params.get('renter')?.trim().toLowerCase() ?? '';
        const matchedRenter = renterNameFilter
            ? renters.find(r => `${r.firstName} ${r.lastName}`.trim().toLowerCase() === renterNameFilter)
            : undefined;

        setSearchTerm(renterSearch);
        setFilters(prev => ({
            ...prev,
            renterId: matchedRenter?.id ?? ''
        }));
    }, [location.search, renters]);

    const handleDownloadPDF = (contract: ContractDisplay) => {
        const renter = renters.find(r => r.id === contract.renterId);
        const renterName = contract.renterName || (renter ? `${renter.firstName} ${renter.lastName}`.trim() : 'N/A');
        const tenantName = renterName || 'N/A';
        const unitLabel = contract.unitNo ? `Unit #${contract.unitNo}` : 'N/A';
        const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : 'N/A';
        const formatMoney = (value?: number) => typeof value === 'number' ? `$${value.toLocaleString()}` : 'N/A';
        const escapeHtml = (value: string) => value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        const statusLabel = getStatusConfig(contract.contractStatus).label;
        const statusBadgeStyle = contract.contractStatus === 2
            ? 'background:#dcfce7;color:#166534;'
            : contract.contractStatus === 1
                ? 'background:#fef3c7;color:#92400e;'
                : contract.contractStatus === 3
                    ? 'background:#fee2e2;color:#991b1b;'
                    : 'background:#f3f4f6;color:#4b5563;';

        const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Contract ${escapeHtml(contract.id)}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; font-family: "Segoe UI", Arial, sans-serif; }
        .header { background: #111827; color: #fff; padding: 24px 28px; border-radius: 16px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 8px 0 0; font-size: 12px; opacity: 0.8; }
        .meta { display: flex; gap: 24px; margin-top: 14px; font-size: 12px; opacity: 0.9; }
        .section { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px 20px; margin-top: 18px; }
        .section h3 { margin: 0 0 12px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b7280; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
        .item .label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #9ca3af; font-weight: 700; margin-bottom: 4px; }
        .item .value { font-size: 14px; font-weight: 600; color: #111827; }
        .badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .signature { margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
        .signature-line { border-bottom: 1px solid #d1d5db; padding-bottom: 6px; font-size: 12px; color: #6b7280; }
        footer { margin-top: 24px; font-size: 11px; color: #6b7280; text-align: center; }
        @media print {
            body { background: #fff; padding: 24px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lease Contract</h1>
        <p>Contract reference ${escapeHtml(contract.id.split('-')[0])}</p>
        <div class="meta">
            <div>Generated ${escapeHtml(formatDate(new Date().toISOString()))}</div>
            <div><span class="badge" style="${statusBadgeStyle}">${escapeHtml(statusLabel)}</span></div>
        </div>
    </div>

    <div class="section">
        <h3>Parties</h3>
        <div class="grid">
            <div class="item">
                <div class="label">Unit</div>
                <div class="value">${escapeHtml(unitLabel)}</div>
            </div>
            <div class="item">
                <div class="label">Tenant Name</div>
                <div class="value">${escapeHtml(tenantName)}</div>
            </div>
            <div class="item">
                <div class="label">Renter Name</div>
                <div class="value">${escapeHtml(renterName)}</div>
            </div>
            <div class="item">
                <div class="label">Tenant ID</div>
                <div class="value">${escapeHtml(contract.tenantId || 'N/A')}</div>
            </div>
            <div class="item">
                <div class="label">Renter Phone</div>
                <div class="value">${escapeHtml(renter?.phoneNumber || 'N/A')}</div>
            </div>
            <div class="item">
                <div class="label">Renter Email</div>
                <div class="value">${escapeHtml(renter?.email || 'N/A')}</div>
            </div>
            <div class="item">
                <div class="label">National ID</div>
                <div class="value">${escapeHtml(renter?.nationalId || 'N/A')}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Contract Terms</h3>
        <div class="grid">
            <div class="item">
                <div class="label">Start Date</div>
                <div class="value">${escapeHtml(formatDate(contract.startDate))}</div>
            </div>
            <div class="item">
                <div class="label">End Date</div>
                <div class="value">${escapeHtml(formatDate(contract.endDate))}</div>
            </div>
            <div class="item">
                <div class="label">Payment Frequency</div>
                <div class="value">${escapeHtml(getPaymentFreqLabel(contract.paymentFreq))}</div>
            </div>
            <div class="item">
                <div class="label">Rent Amount</div>
                <div class="value">${escapeHtml(formatMoney(contract.rentAmount))}</div>
            </div>
            <div class="item">
                <div class="label">Contract Status</div>
                <div class="value">${escapeHtml(statusLabel)}</div>
            </div>
            <div class="item">
                <div class="label">Contract ID</div>
                <div class="value">${escapeHtml(contract.id)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Signatures</h3>
        <div class="signature">
            <div class="signature-line">Landlord Signature</div>
            <div class="signature-line">Tenant Signature</div>
        </div>
    </div>

    <footer>
        Generated by Sakani Contracts on ${escapeHtml(new Date().toLocaleString())}
    </footer>
</body>
</html>`;

        const printWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (!printWindow) {
            alert('Pop-up blocked. Please allow pop-ups to export the PDF.');
            return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
        };
    };
    const getStatusConfig = (statusNum: number) => {
        switch (statusNum) {
            case 1: return { label: 'DRAFT', color: 'bg-ember-100 text-ember-700' };
            case 2: return { label: 'ACTIVE', color: 'bg-green-100 text-green-700' };
            case 3: return { label: 'EXPIRED', color: 'bg-red-100 text-red-700' };
            case 4: return { label: 'TERMINATED', color: 'bg-red-100 text-red-700' };
            default: return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-700' };
        }
    };
    const fetchContracts = async () => {
        setLoading(true);
        try {
            const [contractsData, unitsData, rentersData] = await Promise.all([
                contractService.getAll(),
                unitService.getAll(),
                renterService.getAll()
            ]);
            
            setRenters(rentersData);
            
            // Create lookup maps for units and renters
            const unitsMap = new Map<string, Unit>();
            unitsData.forEach((u: Unit) => {
                const id = u.id || '';
                unitsMap.set(id, u);
            });
            
            const rentersMap = new Map<string, Renter>();
            rentersData.forEach((r: Renter) => {
                const id = r.id || '';
                rentersMap.set(id, r);
            });
            
            // Enrich contracts with unit and renter info
            const enriched: ContractDisplay[] = contractsData.map((c: Contract) => {
                const unit = unitsMap.get(c.unitId);
                const renter = rentersMap.get(c.renterId);
                return {
                    ...c,
                    paymentFreq: c.paymentFreq ?? 1,
                    unitNo: unit?.unitNo || '',
                    renterName: renter ? `${renter.firstName} ${renter.lastName}` : '',
                };
            });
            
            setContracts(enriched);
        } catch (error) {
            console.error("Failed to load contracts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateContract = async (contract: ContractDisplay) => {
        if (!confirm('Are you sure you want to terminate this contract?')) return;
        
        setIsTerminating(true);
        try {
            await contractService.terminate(contract.id);
            await fetchContracts();
            setSelectedContract(null);
        } catch (error) {
            console.error("Failed to terminate contract", error);
        } finally {
            setIsTerminating(false);
        }
    };

    const handleViewContract = () => {
        if (!selectedContract) return;
        navigate(`/accounting/payments?contractId=${encodeURIComponent(selectedContract.id)}`);
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const filteredContracts = useMemo(() => {
        if (contractIdFromQuery) {
            return contracts.filter(c => c.id === contractIdFromQuery);
        }

        return contracts.filter(c => {
            // Text search
            if (searchTerm.trim()) {
                const search = searchTerm.toLowerCase();
                const matchesSearch = 
                    c.renterName?.toLowerCase().includes(search) ||
                    c.unitNo?.toLowerCase().includes(search) ||
                    c.id.toLowerCase().includes(search);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status && c.contractStatus !== Number(filters.status)) {
                return false;
            }

            // Renter filter
            if (filters.renterId && c.renterId !== filters.renterId) {
                return false;
            }

            // Payment frequency filter
            if (filters.paymentFreq && c.paymentFreq !== Number(filters.paymentFreq)) {
                return false;
            }

            // Start date range
            if (filters.startDateFrom) {
                const contractStart = new Date(c.startDate);
                const filterFrom = new Date(filters.startDateFrom);
                if (contractStart < filterFrom) return false;
            }
            if (filters.startDateTo) {
                const contractStart = new Date(c.startDate);
                const filterTo = new Date(filters.startDateTo);
                if (contractStart > filterTo) return false;
            }

            // End date range
            if (filters.endDateFrom) {
                const contractEnd = new Date(c.endDate);
                const filterFrom = new Date(filters.endDateFrom);
                if (contractEnd < filterFrom) return false;
            }
            if (filters.endDateTo) {
                const contractEnd = new Date(c.endDate);
                const filterTo = new Date(filters.endDateTo);
                if (contractEnd > filterTo) return false;
            }

            return true;
        });
    }, [contracts, contractIdFromQuery, searchTerm, filters]);

    useEffect(() => {
        if (!contractIdFromQuery || contracts.length === 0) return;

        const exactContract = contracts.find(c => c.id === contractIdFromQuery);
        if (!exactContract) return;

        setSelectedContract(exactContract);
        window.setTimeout(() => {
            document.getElementById(`contract-row-${contractIdFromQuery}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }, [contractIdFromQuery, contracts]);

    return (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 relative min-h-screen page-fade-in">
            {/* Main List Section */}
            <div className={`transition-all duration-300 ${selectedContract ? 'lg:w-8/12' : 'w-full'} space-y-4 sm:space-y-6 card-fade-in-1`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Lease Contracts</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Track agreements, payments, and durations</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-sm font-semibold text-sm"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">New Contract</span><span className="sm:hidden">New</span>
                    </button>
                </div>

                {/* Search Bar and Filter Toggle */}
                <div className="flex gap-2 sm:gap-3">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by renter name or unit..."
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm text-xs sm:text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border flex items-center gap-1 sm:gap-2 font-semibold transition-all text-xs sm:text-sm ${
                            showFilters || activeFilterCount > 0
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 shadow-sm space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm sm:text-base text-gray-800">Filter Contracts</h3>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                            {/* Status Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="1">Draft</option>
                                    <option value="2">Active</option>
                                    <option value="3">Expired</option>
                                    <option value="4">Terminated</option>
                                </select>
                            </div>

                            {/* Renter Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Renter</label>
                                <select
                                    value={filters.renterId}
                                    onChange={(e) => setFilters({...filters, renterId: e.target.value})}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                >
                                    <option value="">All Renters</option>
                                    {renters.map(r => (
                                        <option key={r.id} value={r.id}>{`${r.firstName} ${r.lastName}`}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Frequency Filter */}
                            <div className="space-y-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Payment Freq</label>
                                <select
                                    value={filters.paymentFreq}
                                    onChange={(e) => setFilters({...filters, paymentFreq: e.target.value})}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                >
                                    <option value="">All Frequencies</option>
                                    <option value="1">Monthly</option>
                                    <option value="3">Quarterly</option>
                                    <option value="6">Semi-Annually</option>
                                    <option value="12">Yearly</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Range Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 pt-1 sm:pt-2">
                            <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Start Date From</label>
                                <input
                                    type="date"
                                    value={filters.startDateFrom}
                                    onChange={(e) => setFilters({...filters, startDateFrom: e.target.value})}
                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Start Date To</label>
                                <input
                                    type="date"
                                    value={filters.startDateTo}
                                    onChange={(e) => setFilters({...filters, startDateTo: e.target.value})}
                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">End Date From</label>
                                <input
                                    type="date"
                                    value={filters.endDateFrom}
                                    onChange={(e) => setFilters({...filters, endDateFrom: e.target.value})}
                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">End Date To</label>
                                <input
                                    type="date"
                                    value={filters.endDateTo}
                                    onChange={(e) => setFilters({...filters, endDateTo: e.target.value})}
                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={40} /></div>
                ) : filteredContracts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-600">No contracts found</h3>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {searchTerm || activeFilterCount > 0 
                                ? 'No contracts match your search or filters' 
                                : 'Create your first contract to get started'}
                        </p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-xs sm:text-sm text-gray-900 font-semibold hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden card-fade-in-2">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Unit</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Renter</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Monthly Rent</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4">End Date</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 cursor-pointer">
                            {filteredContracts.map((contract, index) => (

                                <tr
                                    key={contract.id}
                                    id={`contract-row-${contract.id}`}
                                    onClick={() => setSelectedContract(contract)}
                                    className={`hover:bg-gray-50 transition-colors ${selectedContract?.id === contract.id ? 'bg-gray-50' : ''} ${
                                        index < 3 ? `card-fade-in-${index + 1}` : ''
                                    }`}
                                >
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm text-gray-900">#{contract.unitNo || 'N/A'}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{contract.renterName || 'Renter'}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-blue-600 text-xs sm:text-sm">${contract.rentAmount}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase ${getStatusConfig(contract.contractStatus).color} `}>
                                                {getStatusConfig(contract.contractStatus).label}
                                            </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                        {new Date(contract.endDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Side Details Panel */}
            {selectedContract && (
                <div className="w-full lg:w-4/12 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-fit sticky top-8 animate-in slide-in-from-right duration-300 card-fade-in-3">
                    <div className="bg-gray-600 p-4 sm:p-6 text-white relative">
                        <button onClick={() => setSelectedContract(null)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/50 hover:text-white"><X size={20} /></button>
                        <FileText size={32} className="mb-4 opacity-50" />
                        <h2 className="text-lg sm:text-xl font-bold">Contract Details</h2>
                        <p className="text-[10px] sm:text-xs text-blue-100 opacity-80">Reference: {selectedContract.id.split('-')[0]}</p>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="space-y-3 sm:space-y-4">
                            <DetailItem icon={<Home size={16}/>} label="Unit" value={selectedContract.unitNo ? `Unit #${selectedContract.unitNo}` : 'N/A'} />
                            <DetailItem icon={<User size={16}/>} label="Renter" value={selectedContract.renterName || 'N/A'} />
                            <hr className="border-gray-50" />
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <DetailItem icon={<Calendar size={16}/>} label="Starts" value={new Date(selectedContract.startDate).toLocaleDateString()} />
                                <DetailItem icon={<Calendar size={16}/>} label="Ends" value={new Date(selectedContract.endDate).toLocaleDateString()} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <DetailItem icon={<DollarSign size={16}/>} label="Rent Amount" value={`$${selectedContract.rentAmount}`} />
                                <DetailItem icon={<Clock size={16}/>} label="Payment Freq" value={getPaymentFreqLabel(selectedContract.paymentFreq)} />
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-3">
                            <button
                                onClick={handleViewContract}
                                className="w-full py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowRight size={16} /> View Payments
                            </button>
                            <button 
                                onClick={() => handleDownloadPDF(selectedContract)}
                                className="w-full py-2 sm:py-3 bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Export PDF
                            </button>
                            {(selectedContract.contractStatus === 1 || selectedContract.contractStatus === 2) && (
                                <button 
                                    onClick={() => handleTerminateContract(selectedContract)}
                                    disabled={isTerminating}
                                    className="w-full py-2 sm:py-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTerminating ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                    {isTerminating ? 'Terminating...' : 'Terminate Contract'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <CreateContractModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContractCreated={fetchContracts}
            />
        </div>
    );
};

const DetailItem = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-black text-gray-400 tracking-widest">{label}</p>
            <p className="text-xs sm:text-sm text-gray-800 font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default ContractsPage;
