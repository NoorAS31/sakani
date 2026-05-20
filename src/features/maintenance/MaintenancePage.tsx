import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Wrench } from 'lucide-react';
import axios from 'axios';
import { maintenanceService } from '../../services/maintenanceService';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { TicketResponseDto } from '../../types/maintenance';
import CreateTicketModal from './CreateTicketModal';

// خريطة تحويل الرقم القادم من الباك إيند إلى النص المتوقع في الفرونت إيند
const statusMap: Record<number, 'Open' | 'InProgress' | 'Resolved' | 'Closed'> = {
    1: 'Open',
    2: 'InProgress',
    3: 'Resolved',
    4: 'Closed'
};

const MaintenancePage = () => {
    usePageTitle('Maintenance');
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchTickets = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await maintenanceService.getMyTickets({ signal });
            if (!signal?.aborted) {
                // ترتيب التذاكر: الأحدث أولاً
                const sorted = [...data].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setTickets(sorted);
            }
        } catch (error) {
            if (signal?.aborted) return;
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setTickets([]);
                return;
            }
            if ((error as { name?: string })?.name === 'CanceledError') return;

            console.error('Failed to load maintenance tickets', error);
            setTickets([]);
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        fetchTickets(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchTickets]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setIsLoading(true);
        fetchTickets();
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const statusConfig = (status: 'Open' | 'InProgress' | 'Resolved' | 'Closed') => {
        switch (status) {
            case 'Open':
                return 'bg-amber-50 text-amber-700';
            case 'InProgress':
                return 'bg-blue-50 text-blue-700';
            case 'Resolved':
                return 'bg-emerald-50 text-emerald-700';
            case 'Closed':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const statusLabel = (status: 'Open' | 'InProgress' | 'Resolved' | 'Closed') =>
        status === 'InProgress' ? 'In Progress' : status;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-2"
            >
                ← Back to Dashboard
            </button>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Maintenance Requests</h1>
                    <p className="text-sm text-gray-500">Track and manage your property maintenance tickets.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    New Request
                </button>
            </header>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                            <Wrench size={22} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">No requests yet</h2>
                        <p className="text-sm text-gray-500 mt-1">You haven't submitted any maintenance requests.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Subject</th>
                                <th className="px-6 py-4 font-semibold">Unit No</th>
                                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {tickets.map((ticket) => {
                                // نمسك رقم الحالة الراجع من قاعدة البيانات ونحوله لنص
                                const statusNumber = ticket.status as unknown as number;
                                const currentStatusText = statusMap[statusNumber] || 'Open';

                                return (
                                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {ticket.unitNo}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatDate(ticket.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${statusConfig(currentStatusText)}`}>
                                                {statusLabel(currentStatusText)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/maintenance/${ticket.id}`)} // التوجيه الصحيح والديناميكي لصفحة التفاصيل
                                                className="text-blue-600 font-semibold text-xs hover:text-blue-800"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default MaintenancePage;