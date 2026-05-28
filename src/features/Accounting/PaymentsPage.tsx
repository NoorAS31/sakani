import { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Calendar,
    Loader2,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { contractService } from '../../services/contractService';
import type { Contract, ContractDetails, Payment } from '../../types/contract';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useLocation } from 'react-router-dom';

const PaymentsPage = () => {
    usePageTitle('Payments');
    const location = useLocation();
    const contractIdFromQuery = useMemo(
        () => new URLSearchParams(location.search).get('contractId') ?? '',
        [location.search]
    );
    const renterIdFromQuery = useMemo(
        () => new URLSearchParams(location.search).get('renterId') ?? '',
        [location.search]
    );
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractDetails, setContractDetails] = useState<Record<string, ContractDetails>>({});
    const [expandedContracts, setExpandedContracts] = useState<string[]>([]);
    const [loadingContracts, setLoadingContracts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoFocusedContractId, setAutoFocusedContractId] = useState('');
    const filteredContracts = useMemo(() => {
        if (!renterIdFromQuery) return contracts;
        return contracts.filter(contract => contract.renterId === renterIdFromQuery);
    }, [contracts, renterIdFromQuery]);

    useEffect(() => {
        contractService.getAll()
            .then(setContracts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!contractIdFromQuery || autoFocusedContractId === contractIdFromQuery || contracts.length === 0) return;

        const contractExists = contracts.some(contract => contract.id === contractIdFromQuery);
        if (!contractExists) return;

        setExpandedContracts(prev => prev.includes(contractIdFromQuery) ? prev : [contractIdFromQuery, ...prev]);

        if (!contractDetails[contractIdFromQuery]) {
            setLoadingContracts(prev => prev.includes(contractIdFromQuery) ? prev : [...prev, contractIdFromQuery]);
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
    }, [contractIdFromQuery, autoFocusedContractId, contracts, contractDetails]);

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

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 page-fade-in">
            <div className="card-fade-in-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Contract Payments</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage payment schedules for all contracts</p>
            </div>

            {filteredContracts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center card-fade-in-2">
                   <FileText size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                   <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400">
                       {renterIdFromQuery ? 'No contracts found for this renter' : 'No contracts found'}
                   </p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3 card-fade-in-2">
                {filteredContracts.map(contract => {
                    const statusConfig = getContractStatusConfig(contract.contractStatus);
                    const details = contractDetails[contract.id];
                    const isExpanded = expandedContracts.includes(contract.id);
                    const isLoading = loadingContracts.includes(contract.id);

                    return (
                        <div id={`payment-contract-${contract.id}`} key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            {/* Contract Header */}
                            <div
                                onClick={() => toggleContract(contract.id)}
                                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 font-semibold text-gray-700 dark:text-gray-300">
                                    {isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                                    <FileText size={16} className="text-gray-400" />
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">Contract</div>
                                        <div className="flex gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-tighter">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={9}/>
                                                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(contract.rentAmount)}</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">Total Rent</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>
                            </div>

                            {/* Payments List */}
                            {isExpanded && (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700 animate-in slide-in-from-top-2 duration-200">
                                    {isLoading ? (
                                        <div className="p-3 sm:p-4 flex justify-center text-gray-400">
                                            <Loader2 className="animate-spin" size={20} />
                                        </div>
                                    ) : details?.payments?.length === 0 ? (
                                        <div className="p-4 sm:p-6 ml-6 sm:ml-8 mr-3 sm:mr-4 my-2 text-center text-xs sm:text-base text-gray-400 dark:text-gray-500">
                                            No payments found for this contract
                                        </div>
                                    ) : (
                                        details?.payments?.map((payment: Payment) => {
                                            const paymentStatus = getPaymentStatusConfig(payment.paymentStatus);
                                            const StatusIcon = paymentStatus.icon;

                                            return (
                                                <div key={payment.id} className="flex items-center justify-between p-3 sm:p-4 ml-6 sm:ml-8 hover:bg-blue-50 dark:hover:bg-blue-900/10 group transition-colors">
                                                    <div className="flex items-center gap-2 sm:gap-4">
                                                        <div className={`p-2 rounded-lg ${paymentStatus.color}`}>
                                                            <StatusIcon size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                                                                Payment Due: {formatDate(payment.dueDate)}
                                                            </div>
                                                            <div className="flex gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                                                {payment.paymentDate && (
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle size={9}/>
                                                                        Paid on {formatDate(payment.paymentDate)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 sm:gap-6">
                                                        <div className="text-right">
                                                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                                                            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">Amount</p>
                                                        </div>

                                                        <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-black whitespace-nowrap ${paymentStatus.color}`}>
                                                            {paymentStatus.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
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
