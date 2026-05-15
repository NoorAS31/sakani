import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Eye, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToast } from '../../hooks/useToast';
import { maintenanceTicketService } from '../../services/maintenanceTicketService';
import { unitService } from '../../services/unitService';
import { storage } from '../../utils/storage';
import type { MaintenanceTicket } from '../../types/maintenanceTicket';
import { MaintenanceTicketStatus } from '../../types/maintenanceTicket';
import type { Unit } from '../../types/unit';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const MaintenanceTicketsPage = () => {
    usePageTitle('Maintenance Tickets');
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const isSuperAdmin = storage.isSuperAdmin();

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            const [unitData, ticketData] = await Promise.all([
                unitService.getAll(),
                maintenanceTicketService.getAll()
            ]);
            setUnits(unitData);
            setTickets(ticketData);
        } catch (err) {
            console.error('Failed to load tickets:', err);
            showToast('Failed to load maintenance tickets', 'error', 5000);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleStatusUpdate = async (ticketId: string, newStatus: MaintenanceTicketStatus) => {
        try {
            await maintenanceTicketService.updateStatus({
                ticketId,
                newStatus
            });
            showToast('Ticket status updated successfully', 'success', 3000);
            loadTickets();
        } catch (err) {
            console.error('Failed to update ticket status:', err);
            showToast('Failed to update ticket status', 'error', 5000);
        }
    };

    const getStatusConfig = (status: MaintenanceTicketStatus | string) => {
        switch (Number(status)) {
            case MaintenanceTicketStatus.Open:
                return { 
                    label: 'Open', 
                    color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
                    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
                    icon: AlertCircle,
                    iconColor: 'text-blue-600 dark:text-blue-400'
                };
            case MaintenanceTicketStatus.InProgress:
                return { 
                    label: 'In Progress', 
                    color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
                    badge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
                    icon: Clock,
                    iconColor: 'text-amber-600 dark:text-amber-400'
                };
            case MaintenanceTicketStatus.Resolved:
                return { 
                    label: 'Resolved', 
                    color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
                    badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
                    icon: CheckCircle2,
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case MaintenanceTicketStatus.Closed:
                return { 
                    label: 'Closed', 
                    color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
                    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
                    icon: CheckCircle2,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
            default:
                return { 
                    label: 'Unknown', 
                    color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
                    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
                    icon: AlertTriangle,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    const getTicketsByStatus = (status: MaintenanceTicketStatus) => {
        return tickets.filter(ticket => Number(ticket.status) === status);
    };

    const unitNameById = units.reduce<Record<string, string>>((acc, unit) => {
        acc[unit.id] = `Unit #${unit.unitNo}`;
        return acc;
    }, {});

    const kanbanColumns = [
        { status: MaintenanceTicketStatus.Open, label: 'Open' },
        { status: MaintenanceTicketStatus.InProgress, label: 'In Progress' },
        { status: MaintenanceTicketStatus.Resolved, label: 'Resolved' },
        { status: MaintenanceTicketStatus.Closed, label: 'Closed' }
    ];

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Maintenance Tickets</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage maintenance requests</p>
                </div>
                <SkeletonLoader count={4} height="h-96" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Tickets</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track and manage maintenance requests</p>
                </div>

                {isSuperAdmin && (
                    <button
                        type="button"
                        onClick={() => navigate('/maintenance-tickets/create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white text-sm font-bold hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus size={18} />
                        Create Ticket
                    </button>
                )}
            </div>

            {tickets.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <AlertCircle className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No maintenance tickets found</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Create your first ticket to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {kanbanColumns.map(column => {
                        const columnTickets = getTicketsByStatus(column.status);
                        const statusConfig = getStatusConfig(column.status);
                        const IconComponent = statusConfig.icon;

                        return (
                            <div
                                key={column.status}
                                className={`flex flex-col rounded-2xl border-2 ${statusConfig.color} min-h-[500px] shadow-sm overflow-hidden transition-all hover:shadow-md dark:shadow-xl`}
                            >
                                {/* Column Header */}
                                <div className={`px-4 py-4 border-b-2 ${statusConfig.color} bg-white/50 dark:bg-white/5 backdrop-blur-sm`}>
                                    <div className="flex items-center gap-3">
                                        <IconComponent size={20} className={statusConfig.iconColor} />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {column.label}
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusConfig.badge}`}>
                                                    {columnTickets.length}
                                                </span>
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/30 dark:bg-white/5">
                                    {columnTickets.length === 0 ? (
                                        <div className="text-center text-gray-400 dark:text-gray-600 text-sm py-12 flex items-center justify-center h-full">
                                            <div>
                                                <div className="text-3xl mb-2">–</div>
                                                <p>No tickets</p>
                                            </div>
                                        </div>
                                    ) : (
                                        columnTickets.map(ticket => (
                                            <div
                                                key={ticket.id}
                                                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all cursor-grab active:cursor-grabbing hover:-translate-y-1"
                                            >
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 hover:line-clamp-none transition-all">
                                                        {ticket.subject}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {ticket.description}
                                                    </p>
                                                    
                                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                                                                {unitNameById[ticket.unitId] || ticket.unitNo || ticket.unitId}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/maintenance-tickets/${ticket.id}`)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                                title="View details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>

                                                        {column.status !== MaintenanceTicketStatus.Closed && (
                                                            <div className="flex gap-2 pt-2">
                                                                {column.status === MaintenanceTicketStatus.Open && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusUpdate(ticket.id, MaintenanceTicketStatus.InProgress)}
                                                                        className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 font-semibold transition-colors"
                                                                    >
                                                                        Start
                                                                    </button>
                                                                )}
                                                                {column.status === MaintenanceTicketStatus.InProgress && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusUpdate(ticket.id, MaintenanceTicketStatus.Resolved)}
                                                                        className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 font-semibold transition-colors"
                                                                    >
                                                                        Resolve
                                                                    </button>
                                                                )}
                                                                {column.status === MaintenanceTicketStatus.Resolved && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusUpdate(ticket.id, MaintenanceTicketStatus.Closed)}
                                                                        className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
                                                                    >
                                                                        Close
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MaintenanceTicketsPage;
