import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../components/dashboard/DashboardCard.tsx';
import { accountingService } from '../../services/accountingService.ts';
import { contractService } from '../../services/contractService.ts';
import { maintenanceService } from '../../services/maintenanceService.ts';
import { usePageTitle } from '../../hooks/usePageTitle.ts';
import type { PaymentHistoryResponseDto } from '../../types/accounting.ts';
import type { MyContractDetailsDto } from '../../types/contract.ts';
import type { TicketResponseDto } from '../../types/maintenance.ts';

const RenterDashboard = () => {
    usePageTitle('Dashboard');
    const navigate = useNavigate();
    const [contract, setContract] = useState<MyContractDetailsDto | null>(null);
    const [nextPayment, setNextPayment] = useState<PaymentHistoryResponseDto | null>(null);
    const [requests, setRequests] = useState<TicketResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const openCount = requests.filter((request) => Number(request.status) === 1 || Number(request.status) === 2).length;
    const lastRequestDate = requests.reduce<string | null>((latest, request) => {
        if (!latest) return request.createdAt;
        return new Date(request.createdAt) > new Date(latest) ? request.createdAt : latest;
    }, null);

    useEffect(() => {
        const controller = new AbortController();

        const isNotFound = (error: unknown) => {
            const status = (error as { response?: { status?: number } })?.response?.status;
            return status === 404;
        };

        const isCanceled = (error: unknown) => {
            const code = (error as { code?: string })?.code;
            const name = (error as { name?: string })?.name;
            return code === 'ERR_CANCELED' || name === 'CanceledError';
        };

        const loadDashboard = async () => {
            const contractPromise = contractService
                .getMyActiveContract({ signal: controller.signal })
                .catch((error) => {
                    if (controller.signal.aborted || isCanceled(error)) return null;
                    if (isNotFound(error)) return null;
                    console.error('Failed to load active contract', error);
                    return null;
                });

            const paymentsPromise = accountingService
                .getMyPaymentHistory('Upcoming', { signal: controller.signal })
                .catch((error) => {
                    if (controller.signal.aborted || isCanceled(error)) return [];
                    if (isNotFound(error)) return [];
                    console.error('Failed to load upcoming payments', error);
                    return [];
                });

            const requestsPromise = maintenanceService
                .getMyTickets({ signal: controller.signal })
                .catch((error) => {
                    if (controller.signal.aborted || isCanceled(error)) return [];
                    if (isNotFound(error)) return [];
                    console.error('Failed to load maintenance requests', error);
                    return [];
                });

            const [contractData, paymentsData, ticketsData] = await Promise.all([
                contractPromise,
                paymentsPromise,
                requestsPromise
            ]);

            if (!controller.signal.aborted) {
                setContract(contractData);
                setNextPayment(paymentsData[0] ?? null);
                setRequests(ticketsData);
                setIsLoading(false);
            }
        };

        loadDashboard();

        return () => {
            controller.abort();
        };
    }, []);

    const statusClasses = (status: TicketResponseDto['status']) => {
        if (status === 'Open') return 'bg-amber-50 text-amber-700';
        if (status === 'InProgress') return 'bg-blue-50 text-blue-700';
        if (status === 'Resolved') return 'bg-emerald-50 text-emerald-700';
        return 'bg-green-50 text-green-700';
    };

    const statusLabel = (status: TicketResponseDto['status']) => (status === 'InProgress' ? 'In Progress' : status);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US');

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Renter Dashboard</h1>
                <p className="text-gray-500 text-sm">Your contract, payments, and maintenance at a glance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Contract">
                    <div className="space-y-2">
                        <p className="text-2xl font-black text-gray-900">
                            {contract ? 'Active' : 'No active contract found'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {contract ? `Ends ${formatDate(contract.endDate)}` : 'No contract data available'}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/contracts')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            View contract →
                        </button>
                    </div>
                </DashboardCard>

                <DashboardCard title="Next Payment">
                    <div className="space-y-2">
                        <p className="text-2xl font-black text-gray-900">
                            {nextPayment ? formatCurrency(nextPayment.amount) : 'No upcoming payments'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {nextPayment ? `Due ${formatDate(nextPayment.dueDate)}` : 'No payment data available'}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/accounting/payments')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            View payments →
                        </button>
                    </div>
                </DashboardCard>

                <DashboardCard title="Maintenance">
                    <div className="space-y-2">
                        <p className="text-2xl font-black text-gray-900">{openCount} Open</p>
                        <p className="text-sm text-gray-500">
                            {lastRequestDate ? `Last request ${formatDate(lastRequestDate)}` : 'No requests yet'}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/maintenance')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            View requests →
                        </button>
                    </div>
                </DashboardCard>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Recent Maintenance Requests</h2>
                </div>

                {requests.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No maintenance requests yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-3">Unit No</th>
                                    <th className="text-left px-4 py-3">Subject</th>
                                    <th className="text-left px-4 py-3">Date</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.slice(0, 5).map((request) => (
                                    <tr key={request.id} className="border-t border-gray-100">
                                        <td className="px-4 py-3 text-gray-700">{request.unitNo}</td>
                                        <td className="px-4 py-3 text-gray-700">{request.subject}</td>
                                        <td className="px-4 py-3 text-gray-700">{formatDate(request.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(request.status)}`}
                                            >
                                                {statusLabel(request.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/maintenance/${request.id}`)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {requests.length > 0 && (
                    <div className="flex justify-end border-t border-gray-100 px-5 py-4">
                        <button
                            type="button"
                            onClick={() => navigate('/maintenance')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            View All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RenterDashboard;
