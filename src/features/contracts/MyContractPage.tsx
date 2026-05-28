import { useEffect, useState } from 'react';
import { Calendar, DollarSign, FileText, Home, Loader2 } from 'lucide-react';
import axios from 'axios';
import { contractService } from '../../services/contractService';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { MyContractDetailsDto } from '../../types/contract';

const MyContractPage = () => {
    usePageTitle('My Contract');
    const [contract, setContract] = useState<MyContractDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const loadContract = async () => {
            try {
                const data = await contractService.getMyActiveContract({ signal: controller.signal });
                if (!controller.signal.aborted) {
                    setContract(data);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setContract(null);
                    return;
                }
                if ((error as { name?: string })?.name === 'CanceledError') {
                    return;
                }
                console.error('Failed to load active contract', error);
                setContract(null);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadContract();

        return () => {
            controller.abort();
        };
    }, []);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const statusBadge = () => {
        switch (contract?.contractStatus) {
            case 2:
                return 'bg-green-100 text-green-700';
            case 3:
                return 'bg-amber-100 text-amber-700';
            case 4:
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const statusLabel = () => {
        switch (contract?.contractStatus) {
            case 1:
                return 'Draft';
            case 2:
                return 'Active';
            case 3:
                return 'Expired';
            case 4:
                return 'Terminated';
            default:
                return 'Unknown';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="p-4 sm:p-6 page-fade-in">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                        <FileText size={22} />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">No active contract found</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">No active contract found for your account.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-fade-in">
            <header className="flex flex-col gap-1 sm:gap-2 card-fade-in-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Contract</h1>
                <p className="text-xs sm:text-sm text-gray-500">View your current rental agreement details.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 card-fade-in-2">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Home size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Property Details</p>
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">{contract.propertyName}</h2>
                            </div>
                        </div>
                        <span className={`text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${statusBadge()}`}>
                            {statusLabel()}
                        </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">Unit No</div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">{contract.unitNo}</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Financials</p>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Rent Amount</h2>
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900">{formatCurrency(contract.rentAmount)}</div>
                    <p className="text-[9px] sm:text-xs text-gray-400 mt-1">Per payment cycle</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Timeline</p>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Contract Dates</h2>
                        </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>Start Date</span>
                            <span className="font-semibold text-gray-800">{formatDate(contract.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>End Date</span>
                            <span className="font-semibold text-gray-800">{formatDate(contract.endDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyContractPage;

