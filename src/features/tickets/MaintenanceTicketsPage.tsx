import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Clock, CheckCircle2, AlertTriangle, ImageIcon, ArrowRight, Filter, Search } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { MaintenanceTicketService } from '../../services/maintenanceTicketService';
import { unitService } from '../../services/unitService';
import { storage } from '../../utils/storage';
import type { MaintenanceTicket, MaintenanceTicketStatusType } from '../../types/maintenanceTicket';
import { MaintenanceTicketStatus } from '../../types/maintenanceTicket';
import type { Unit } from '../../types/unit';
import ImageGalleryModal from '../../components/common/ImageGalleryModal';

const MaintenanceTicketsPage = () => {
    usePageTitle('Maintenance Tickets');
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<number | null>(null);
    const isSuperAdmin = storage.isSuperAdmin();

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            const [unitData, ticketData] = await Promise.all([
                unitService.getAll(),
                MaintenanceTicketService.getAll()
            ]);
            setUnits(unitData);
            setTickets(ticketData);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setUnits([]);
                setTickets([]);
            } else {
                console.error('Failed to load tickets:', err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const getStatusConfig = (status: MaintenanceTicketStatusType | string) => {
        switch (Number(status)) {
            case MaintenanceTicketStatus.Open:
                return { 
                    label: 'Open', 
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-950',
                    badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
                    icon: AlertCircle,
                    iconColor: 'text-red-600 dark:text-red-400'
                };
            case MaintenanceTicketStatus.InProgress:
                return { 
                    label: 'In Progress', 
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-950',
                    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
                    icon: Clock,
                    iconColor: 'text-blue-600 dark:text-blue-400'
                };
            case MaintenanceTicketStatus.Resolved:
                return { 
                    label: 'Resolved', 
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-50 dark:bg-green-950',
                    badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
                    icon: CheckCircle2,
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case MaintenanceTicketStatus.Closed:
                return { 
                    label: 'Closed', 
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-50 dark:bg-gray-900',
                    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
                    icon: CheckCircle2,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
            default:
                return { 
                    label: 'Unknown', 
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-50 dark:bg-gray-900',
                    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
                    icon: AlertTriangle,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    const unitNameById = units.reduce<Record<string, string>>((acc, unit) => {
        acc[unit.id] = `Unit #${unit.unitNo}`;
        return acc;
    }, {});

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === null || Number(ticket.status) === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 page-fade-in">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 card-fade-in-1">
                    <div>
                        <h1 className="text-xl sm:text-4xl font-bold text-gray-900 dark:text-white">Maintenance Tickets</h1>
                        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage and track all maintenance requests</p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => navigate('/maintenance-tickets/create')}
                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white text-xs sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus size={16} />
                            New Ticket
                        </button>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm card-fade-in-2">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-base bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                            <select
                                value={filterStatus ?? ''}
                                onChange={(e) => setFilterStatus(e.target.value === '' ? null : Number(e.target.value))}
                                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-base bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 text-gray-900 dark:text-white"
                            >
                                <option value="">All Status</option>
                                <option value={MaintenanceTicketStatus.Open}>Open</option>
                                <option value={MaintenanceTicketStatus.InProgress}>In Progress</option>
                                <option value={MaintenanceTicketStatus.Resolved}>Resolved</option>
                                <option value={MaintenanceTicketStatus.Closed}>Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 card-fade-in-3">
                        <AlertCircle className="mx-auto mb-3 sm:mb-4 text-gray-400" size={40} />
                        <p className="text-sm sm:text-lg font-medium text-gray-600 dark:text-gray-400">No maintenance tickets found</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your filters or create a new ticket</p>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3 card-fade-in-3">
                        {filteredTickets.map((ticket) => {
                            const statusConfig = getStatusConfig(ticket.status);
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => {
                                        if (ticket.images && ticket.images.length > 0) {
                                            setSelectedTicket(ticket);
                                            setShowImageModal(true);
                                        } else {
                                            navigate(`/maintenance-tickets/${ticket.id}`);
                                        }
                                    }}
                                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-2 sm:gap-4">
                                        {/* Status Icon & Badge */}
                                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
                                            <StatusIcon size={20} className={statusConfig.iconColor} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                                                <div className="flex-1">
                                                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                                        {ticket.subject}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                                                        {ticket.description}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusConfig.badge}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    {ticket.images && ticket.images.length > 0 && (
                                                        <div className="bg-gray-100 dark:bg-gray-700 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                            <ImageIcon size={12} className="text-gray-600 dark:text-gray-400" />
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{ticket.images.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between gap-2 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-lg font-medium text-xs sm:text-sm">
                                                        {unitNameById[ticket.unitId] || ticket.unitNo || ticket.unitId}
                                                    </span>
                                                    <span className="text-xs">
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {ticket.images && ticket.images.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/maintenance-tickets/${ticket.id}`);
                                                            }}
                                                            className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 transition-colors"
                                                        >
                                                            Details
                                                        </button>
                                                    )}
                                                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedTicket && (
                    <ImageGalleryModal
                        isOpen={showImageModal}
                        images={selectedTicket.images}
                        title={selectedTicket.subject}
                        onClose={() => {
                            setShowImageModal(false);
                            setSelectedTicket(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MaintenanceTicketsPage;
