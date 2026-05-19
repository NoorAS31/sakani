import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Check, Clock, Loader2, X, XCircle } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { maintenanceTicketService } from '../../services/maintenanceTicketService';
import type { MaintenanceTicket } from '../../types/maintenanceTicket';
import { MaintenanceTicketStatus } from '../../types/maintenanceTicket';

const MaintenanceTicketDetailPage = () => {
    usePageTitle('Ticket Details');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        window.setTimeout(() => {
            navigate('/maintenance-tickets');
        }, 220);
    }, [navigate]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    useEffect(() => {
        if (!id) return;

        maintenanceTicketService.getById(id)
            .then((data) => {
                setTicket(data);
            })
            .catch((err) => {
                console.error('Failed to load ticket:', err);
                setError('Failed to load ticket');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const getStatusConfig = (status: MaintenanceTicketStatus | string | number) => {
        switch (Number(status)) {
            case MaintenanceTicketStatus.Open:
                return { label: 'OPEN', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: AlertCircle };
            case MaintenanceTicketStatus.InProgress:
                return { label: 'IN PROGRESS', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Clock };
            case MaintenanceTicketStatus.Resolved:
                return { label: 'RESOLVED', badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: Check };
            case MaintenanceTicketStatus.Closed:
                return { label: 'CLOSED', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', icon: XCircle };
            default:
                return { label: 'UNKNOWN', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', icon: AlertCircle };
        }
    };

    const statusConfig = ticket ? getStatusConfig(ticket.status) : getStatusConfig(0);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${
                    isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'
                }`}
                onClick={handleClose}
            />

            <div
                className={`relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 ${
                    isClosing
                        ? 'animate-out fade-out zoom-out-95 slide-out-to-bottom-2 duration-200'
                        : 'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300'
                }`}
                role="dialog"
                aria-modal="true"
                aria-label="Ticket details popup"
            >
                <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Details</h1>
                        {!loading && ticket && (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}>
                                    <StatusIcon size={14} />
                                    {statusConfig.label}
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    ID: {ticket.id}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Close ticket details"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto p-6">
                    {loading && (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="animate-spin text-gray-600 dark:text-gray-300" size={36} />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                            <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {!loading && !ticket && !error && (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">Ticket not found</div>
                    )}

                    {!loading && ticket && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-6">
                                <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Subject</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.subject}</p>
                                </section>

                                <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        {ticket.description}
                                    </p>
                                </section>
                            </div>

                            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Images ({ticket.images.length})
                                </p>
                                {ticket.images.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {ticket.images.map((image) => (
                                            <div key={image.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                                <img
                                                    src={image.imageUrl}
                                                    alt={`Ticket image ${image.id}`}
                                                    className="h-56 w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No images attached.</p>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceTicketDetailPage;
