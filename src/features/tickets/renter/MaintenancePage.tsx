import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wrench, Search, Filter, Clock, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { MaintenanceTicketService } from '../../../services/maintenanceTicketService';
import type { MaintenanceTicket, MaintenanceTicketStatusType } from '../../../types/maintenanceTicket';
import { MaintenanceTicketStatus } from '../../../types/maintenanceTicket';
import CreateTicketModal from './CreateTicketModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';


const MaintenancePage = () => {
    usePageTitle('Maintenance');
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [closeTicketModal, setCloseTicketModal] = useState<{ isOpen: boolean; ticketId: string | null }>({ isOpen: false, ticketId: null });
    const [isClosing, setIsClosing] = useState(false);

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            const data = await MaintenanceTicketService.getMy();
            setTickets(data);
        } catch (err) {
            console.error('Failed to load tickets:', err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        loadTickets();
    };

    const handleCloseTicket = async () => {
        if (!closeTicketModal.ticketId) return;
        
        setIsClosing(true);
        try {
            await MaintenanceTicketService.cancel(closeTicketModal.ticketId);
            setCloseTicketModal({ isOpen: false, ticketId: null });
            await loadTickets();
        } catch (err) {
            console.error('Failed to close ticket:', err);
        } finally {
            setIsClosing(false);
        }
    };

    const getStatusConfig = (status: MaintenanceTicketStatusType | string | number) => {
        switch (Number(status)) {
            case MaintenanceTicketStatus.Open:
                return {
                    label: 'Open',
                    icon: AlertCircle,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    badge: 'bg-amber-100 text-amber-800'
                };
            case MaintenanceTicketStatus.InProgress:
                return {
                    label: 'In Progress',
                    icon: Clock,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    badge: 'bg-blue-100 text-blue-800'
                };
            case MaintenanceTicketStatus.Resolved:
                return {
                    label: 'Resolved',
                    icon: CheckCircle2,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    badge: 'bg-emerald-100 text-emerald-800'
                };
            case MaintenanceTicketStatus.Closed:
                return {
                    label: 'Closed',
                    icon: CheckCircle2,
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    badge: 'bg-gray-100 text-gray-800'
                };
            default:
                return {
                    label: 'Unknown',
                    icon: AlertTriangle,
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    badge: 'bg-gray-100 text-gray-800'
                };
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || Number(ticket.status) === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });


    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-fade-in">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 card-fade-in-1">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Track and manage your maintenance tickets</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    New Request
                </button>
            </header>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 card-fade-in-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={filterStatus ?? ''}
                        onChange={(e) => setFilterStatus(e.target.value ? Number(e.target.value) : null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">All Status</option>
                        <option value={MaintenanceTicketStatus.Open}>Open</option>
                        <option value={MaintenanceTicketStatus.InProgress}>In Progress</option>
                        <option value={MaintenanceTicketStatus.Resolved}>Resolved</option>
                        <option value={MaintenanceTicketStatus.Closed}>Closed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                    <div className="flex justify-center items-center h-[60vh] card-fade-in-3">
                        <Wrench className="animate-spin text-gray-400" size={48} />
                    </div>
                ) : filteredTickets.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-12 text-center dark:bg-gray-900 dark:border-gray-800 card-fade-in-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 dark:bg-gray-800">
                        <Wrench size={22} />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">No requests found</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {tickets.length === 0 ? "You haven't submitted any maintenance requests yet." : "No tickets match your search filters."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 card-fade-in-3">
                    {filteredTickets.map((ticket) => {
                        const statusConfig = getStatusConfig(ticket.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div
                                key={ticket.id}
                                className="group bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                            >
                                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/maintenance-ticket/${ticket.id}`)}>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors dark:text-white">{ticket.subject}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${statusConfig.badge}`}>
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <span>Unit #{ticket.unitNo}</span>
                                    <span>•</span>
                                    <span>{formatDate(ticket.createdAt)}</span>
                                    {ticket.images && ticket.images.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                📷 {ticket.images.length} {ticket.images.length === 1 ? 'image' : 'images'}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                    <div className="flex items-center text-blue-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all dark:text-blue-400 cursor-pointer" onClick={() => navigate(`/maintenance-ticket/${ticket.id}`)}>
                                        View Details
                                        <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {Number(ticket.status) === MaintenanceTicketStatus.Open && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCloseTicketModal({ isOpen: true, ticketId: ticket.id });
                                            }}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            Close Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateTicketModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <DeleteConfirmationModal
                isOpen={closeTicketModal.isOpen}
                onClose={() => setCloseTicketModal({ isOpen: false, ticketId: null })}
                onConfirm={handleCloseTicket}
                title="Close Maintenance Ticket"
                description="Are you sure you want to close this maintenance ticket? This action cannot be undone."
                confirmText="Close Ticket"
                cancelText="Cancel"
                isSubmitting={isClosing}
            />
        </div>
    );
};
export default MaintenancePage;