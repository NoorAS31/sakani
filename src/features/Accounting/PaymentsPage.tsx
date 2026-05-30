import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Loader2,
    CheckCircle,
    Clock,
    AlertTriangle,
    X,
    Filter,
    User
} from 'lucide-react';
import { contractService } from '../../services/contractService';
import { renterService } from '../../services/renterService';
import type { Contract, ContractDetails, Payment } from '../../types/contract';
import type { Renter } from '../../types/renter';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useLocation } from 'react-router-dom';

const PaymentsPage = () => {
    usePageTitle('Payments');
    const location = useLocation();
    const contractIdFromQuery = useMemo(
        () => new URLSearchParams(location.search).get('contractId') ?? '',
        [location.search]
    );
    
    // Data states
    const [renters, setRenters] = useState<Renter[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractDetails, setContractDetails] = useState<Record<string, ContractDetails>>({});
    
    // UI states
    const [expandedRenters, setExpandedRenters] = useState<string[]>([]);
    const [expandedContracts, setExpandedContracts] = useState<string[]>([]);
    const [loadingContracts, setLoadingContracts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoFocusedContractId, setAutoFocusedContractId] = useState('');
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRenterFilter, setSelectedRenterFilter] = useState<string>('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
    const [dateFromFilter, setDateFromFilter] = useState<string>('');
    const [dateToFilter, setDateToFilter] = useState<string>('');

    useEffect(() => {
        Promise.all([renterService.getAll(), contractService.getAll()])
            .then(([rentersData, contractsData]) => {
                setRenters(rentersData);
                setContracts(contractsData);
            })
            .catch(err => {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setRenters([]);
                    setContracts([]);
                } else {
                    console.error('Failed to load data:', err);
                    setRenters([]);
                    setContracts([]);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!contractIdFromQuery || autoFocusedContractId === contractIdFromQuery || contracts.length === 0) return;

        const contract = contracts.find(c => c.id === contractIdFromQuery);
        if (!contract) return;

        // Expand the renter
        if (!expandedRenters.includes(contract.renterId)) {
            setExpandedRenters(prev => [contract.renterId, ...prev]);
        }

        // Expand the contract
        setExpandedContracts(prev => prev.includes(contractIdFromQuery) ? prev : [contractIdFromQuery, ...prev]);

        if (!contractDetails[contractIdFromQuery]) {
            setLoadingContracts(prev => [...prev, contractIdFromQuery]);
            contractService.getById(contractIdFromQuery)
                .then(details => {
                    setContractDetails(prev => ({ ...prev, [contractIdFromQuery]: details }));
                })
                .catch(err => {
                    console.error("Failed to fetch contract details:", err);
                })
                .finally(() => {
                    setLoadingContracts(prev => prev.filter(id => id !== contractIdFromQuery));
                });
        }

        window.setTimeout(() => {
            document.getElementById(`payment-contract-${contractIdFromQuery}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);

        setAutoFocusedContractId(contractIdFromQuery);
    }, [contractIdFromQuery, autoFocusedContractId, contracts, contractDetails, expandedRenters]);

    const toggleRenter = (renterId: string) => {
        setExpandedRenters(prev =>
            prev.includes(renterId) ? prev.filter(id => id !== renterId) : [...prev, renterId]
        );
    };

    const toggleContract = async (contractId: string) => {
        const isExpanded = expandedContracts.includes(contractId);

        if (isExpanded) {
            setExpandedContracts(prev => prev.filter(id => id !== contractId));
        } else {
            setExpandedContracts(prev => [...prev, contractId]);

            if (!contractDetails[contractId]) {
                try {
                    setLoadingContracts(prev => [...prev, contractId]);
                    const details = await contractService.getById(contractId);
                    setContractDetails(prev => ({ ...prev, [contractId]: details }));
                } catch (err) {
                    console.error("Failed to fetch contract details:", err);
                } finally {
                    setLoadingContracts(prev => prev.filter(id => id !== contractId));
                }
            }
        }
    };

    // Filter logic
    const filteredRenters = useMemo(() => {
        let result = renters.filter(renter => {
            const renterContracts = contracts.filter(c => c.renterId === renter.id);
            return renterContracts.length > 0;
        });

        if (selectedRenterFilter) {
            result = result.filter(r => r.id === selectedRenterFilter);
        }

        return result;
    }, [renters, contracts, selectedRenterFilter]);

    const getContractsForRenter = (renterId: string) => {
        return contracts.filter(c => c.renterId === renterId);
    };

    const getFilteredPayments = (payments: Payment[]): Payment[] => {
        return payments.filter(payment => {
            if (paymentStatusFilter) {
                const status = parseInt(paymentStatusFilter);
                if (payment.paymentStatus !== status) return false;
            }

            if (dateFromFilter) {
                if (new Date(payment.dueDate) < new Date(dateFromFilter)) return false;
            }

            if (dateToFilter) {
                if (new Date(payment.dueDate) > new Date(dateToFilter)) return false;
            }

            return true;
        });
    };

    const getContractStatusConfig = (statusNum: number) => {
        switch (statusNum) {
            case 1: return { label: 'DRAFT', color: 'bg-gray-100 text-gray-700' };
            case 2: return { label: 'ACTIVE', color: 'bg-green-100 text-green-700' };
            case 3: return { label: 'EXPIRED', color: 'bg-amber-100 text-amber-700' };
            case 4: return { label: 'TERMINATED', color: 'bg-red-100 text-red-700' };
            default: return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const getPaymentStatusConfig = (statusNum: number) => {
        switch (statusNum) {
            case 1: return { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock };
            case 2: return { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle };
            case 3: return { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
            default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: Clock };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    const hasActiveFilters = selectedRenterFilter || paymentStatusFilter || dateFromFilter || dateToFilter;

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 page-fade-in">
            <div className="card-fade-in-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Contract Payments</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage payment schedules for all contracts</p>
            </div>

            {/* Filter Section */}
            <div className="card-fade-in-2">
                <button
                   onClick={() => setShowFilters(!showFilters)}
                   className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                   <Filter size={16} />
                   Filters {hasActiveFilters && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">Active</span>}
                </button>

                {showFilters && (
                   <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                           {/* Renter Filter */}
                           <div>
                               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renter</label>
                               <select
                                   value={selectedRenterFilter}
                                   onChange={(e) => setSelectedRenterFilter(e.target.value)}
                                   className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                               >
                                   <option value="">All Renters</option>
                                   {renters.map(renter => (
                                       <option key={renter.id} value={renter.id}>
                                           {renter.firstName} {renter.lastName}
                                       </option>
                                   ))}
                               </select>
                           </div>

                           {/* Payment Status Filter */}
                           <div>
                               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                               <select
                                   value={paymentStatusFilter}
                                   onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                   className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                               >
                                   <option value="">All Statuses</option>
                                   <option value="1">Pending</option>
                                   <option value="2">Paid</option>
                                   <option value="3">Overdue</option>
                               </select>
                           </div>

                           {/* Date From Filter */}
                           <div>
                               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                               <input
                                   type="date"
                                   value={dateFromFilter}
                                   onChange={(e) => setDateFromFilter(e.target.value)}
                                   className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                               />
                           </div>

                           {/* Date To Filter */}
                           <div>
                               <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                               <input
                                   type="date"
                                   value={dateToFilter}
                                   onChange={(e) => setDateToFilter(e.target.value)}
                                   className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                               />
                           </div>
                       </div>

                       {hasActiveFilters && (
                           <button
                               onClick={() => {
                                   setSelectedRenterFilter('');
                                   setPaymentStatusFilter('');
                                   setDateFromFilter('');
                                   setDateToFilter('');
                               }}
                               className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                           >
                               <X size={14} />
                               Clear Filters
                           </button>
                       )}
                   </div>
                )}
            </div>

            {/* Renters List */}
            {filteredRenters.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center card-fade-in-3">
                   <FileText size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                   <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400">
                       {hasActiveFilters ? 'No payments found matching the selected filters' : 'No renters with contracts found'}
                   </p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3 card-fade-in-3">
                   {filteredRenters.map(renter => {
                       const renterContracts = getContractsForRenter(renter.id);
                       const isRenterExpanded = expandedRenters.includes(renter.id);

                       return (
                           <div key={renter.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                               {/* Renter Header */}
                               <div
                                   onClick={() => toggleRenter(renter.id)}
                                   className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                               >
                                   <div className="flex items-center gap-2 sm:gap-3">
                                       {isRenterExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                       <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                           <User size={16} className="text-blue-600 dark:text-blue-400" />
                                       </div>
                                       <div>
                                           <div className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                                               {renter.firstName} {renter.lastName}
                                           </div>
                                           <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                               {renterContracts.length} contract{renterContracts.length !== 1 ? 's' : ''}
                                           </div>
                                       </div>
                                   </div>
                               </div>

                               {/* Contracts List */}
                               {isRenterExpanded && (
                                   <div className="divide-y divide-gray-100 dark:divide-gray-700 animate-in slide-in-from-top-2 duration-200">
                                       {renterContracts.map(contract => {
                                           const statusConfig = getContractStatusConfig(contract.contractStatus);
                                           const details = contractDetails[contract.id];
                                           const isContractExpanded = expandedContracts.includes(contract.id);
                                           const isContractLoading = loadingContracts.includes(contract.id);

                                           return (
                                               <div key={contract.id} id={`payment-contract-${contract.id}`} className="border-l-2 border-l-gray-100 dark:border-l-gray-700">
                                                   {/* Contract Header */}
                                                   <div
                                                       onClick={() => toggleContract(contract.id)}
                                                       className="flex items-center justify-between p-3 sm:p-4 ml-6 sm:ml-8 bg-gray-25 dark:bg-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                                   >
                                                       <div className="flex items-center gap-2 sm:gap-3">
                                                           {isContractExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                           <FileText size={14} className="text-gray-400" />
                                                           <div>
                                                               <div className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                                                                   Contract {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                                               </div>
                                                               <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                                                   {formatCurrency(contract.rentAmount)} per month
                                                               </div>
                                                           </div>
                                                       </div>
                                                       <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black whitespace-nowrap ${statusConfig.color}`}>
                                                           {statusConfig.label}
                                                       </span>
                                                   </div>

                                                   {/* Payments List */}
                                                   {isContractExpanded && (
                                                       <div className="divide-y divide-gray-100 dark:divide-gray-700 animate-in slide-in-from-top-2 duration-200">
                                                           {isContractLoading ? (
                                                               <div className="p-3 sm:p-4 flex justify-center text-gray-400">
                                                                   <Loader2 className="animate-spin" size={20} />
                                                               </div>
                                                           ) : (() => {
                                                               const filteredPayments = details?.payments ? getFilteredPayments(details.payments) : [];
                                                               return filteredPayments.length === 0 ? (
                                                                   <div className="p-4 sm:p-6 ml-6 sm:ml-8 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                                                                       {details?.payments?.length === 0 ? 'No payments found for this contract' : 'No payments matching filters'}
                                                                   </div>
                                                               ) : (
                                                                   filteredPayments.map((payment: Payment) => {
                                                                       const paymentStatus = getPaymentStatusConfig(payment.paymentStatus);
                                                                       const StatusIcon = paymentStatus.icon;

                                                                       return (
                                                                           <div key={payment.id} className="flex items-center justify-between p-3 sm:p-4 ml-12 sm:ml-16 hover:bg-blue-50 dark:hover:bg-blue-900/10 group transition-colors">
                                                                               <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                                                                   <div className={`p-2 rounded-lg flex-shrink-0 ${paymentStatus.color}`}>
                                                                                       <StatusIcon size={14} />
                                                                                   </div>
                                                                                   <div className="min-w-0">
                                                                                       <div className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                                                                                           Due: {formatDate(payment.dueDate)}
                                                                                       </div>
                                                                                       {payment.paymentDate && (
                                                                                           <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                                                                               Paid: {formatDate(payment.paymentDate)}
                                                                                           </div>
                                                                                       )}
                                                                                   </div>
                                                                               </div>

                                                                               <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                                                                                   <div className="text-right">
                                                                                       <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                                                                                   </div>

                                                                                   <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black whitespace-nowrap ${paymentStatus.color}`}>
                                                                                       {paymentStatus.label}
                                                                                   </span>
                                                                               </div>
                                                                           </div>
                                                                       );
                                                                   })
                                                               );
                                                           })()}
                                                       </div>
                                                   )}
                                               </div>
                                           );
                                       })}
                                   </div>
                               )}
                           </div>
                       );
                   })}
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
