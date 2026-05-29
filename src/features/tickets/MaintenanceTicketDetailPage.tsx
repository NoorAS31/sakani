import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, FileText, Loader2, MapPin, Pencil, Wrench, X, Check } from 'lucide-react';
import axios from 'axios';
import { usePageTitle } from '../../hooks/usePageTitle';
import { MaintenanceTicketService } from '../../services/maintenanceTicketService';
import type { MaintenanceTicket } from '../../types/maintenanceTicket';
import { MaintenanceTicketStatus } from '../../types/maintenanceTicket';

interface MaintenanceTicketDetailPageProps {
    canEdit?: boolean;
    isRenter?: boolean;
    onClose?: () => void;
}

const MaintenanceTicketDetailPage = ({ canEdit = true, isRenter = false, onClose }: MaintenanceTicketDetailPageProps) => {
    usePageTitle('Ticket Details');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [isMarkingResolved, setIsMarkingResolved] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [isImageClosing, setIsImageClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        window.setTimeout(() => {
            if (onClose) {
                onClose();
            } else {
                navigate(isRenter ? '/maintenance' : '/maintenance-tickets');
            }
        }, 220);
    }, [navigate, onClose, isRenter]);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditError(null);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isEditModalOpen) {
                    closeEditModal();
                    return;
                }
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeEditModal, handleClose, isEditModalOpen]);

    useEffect(() => {
        if (!id) return;

        const fetchTicket = isRenter 
            ? MaintenanceTicketService.getRenterById(id)
            : MaintenanceTicketService.getById(id);

        fetchTicket
            .then((data) => {
                setTicket(data);
            })
            .catch((err) => {
                const status = axios.isAxiosError(err) ? err.response?.status ?? null : null;
                setErrorStatus(status);
                if (status !== 404) {
                    console.error('Failed to load ticket:', err);
                    setError('Failed to load ticket');
                }
            })
            .finally(() => setLoading(false));
    }, [id, isRenter]);

    const statusMap = useMemo(
        () => ({
            [MaintenanceTicketStatus.Open]: 'Open',
            [MaintenanceTicketStatus.InProgress]: 'InProgress',
            [MaintenanceTicketStatus.Resolved]: 'Resolved',
            [MaintenanceTicketStatus.Closed]: 'Closed'
        }),
        []
    );

    const openEditModal = () => {
        if (!ticket) return;
        setEditSubject(ticket.subject);
        setEditDescription(ticket.description);
        setEditError(null);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!ticket || !id) return;
        setEditError(null);
        setIsUpdating(true);
        try {
            await MaintenanceTicketService.update(id, {
                id,
                subject: editSubject.trim(),
                description: editDescription.trim()
            });
            setTicket((prev) => prev ? { ...prev, subject: editSubject.trim(), description: editDescription.trim() } : prev);
            closeEditModal();
        } catch (updateError) {
            setEditError(updateError instanceof Error ? updateError.message : 'Failed to update the ticket. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkAsResolved = async () => {
        if (!ticket || !id) return;
        setResolveError(null);
        setIsMarkingResolved(true);
        try {
            await MaintenanceTicketService.updateStatus({
                ticketId: id,
                newStatus: MaintenanceTicketStatus.Resolved
            });
            setTicket((prev) => prev ? { ...prev, status: MaintenanceTicketStatus.Resolved } : prev);
        } catch (err) {
            setResolveError(err instanceof Error ? err.message : 'Failed to mark as resolved. Please try again.');
        } finally {
            setIsMarkingResolved(false);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

    const statusLabel = (status: MaintenanceTicket['status']) => {
        if (typeof status === 'number') {
            return statusMap[status as keyof typeof statusMap] ?? 'Open';
        }
        return status;
    };

    const statusClasses = (status: string) => {
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
                <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h1>
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
                            <Loader2 className="animate-spin text-gray-400" size={48} />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-400 mb-4">
                                <FileText size={22} />
                            </div>
                            <h2 className="text-lg font-bold text-red-800">Ticket not available</h2>
                            {errorStatus !== 404 && <p className="text-sm text-red-600 mt-1">{error}</p>}
                        </div>
                    )}

                    {!loading && !ticket && !error && (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">Ticket not found</div>
                    )}

                    {!loading && ticket && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4 transition-all duration-300 ${
                                isClosing 
                                    ? 'animate-out fade-out zoom-out-95 duration-200' 
                                    : 'animate-in fade-in zoom-in-95 duration-300'
                            }`}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Wrench size={14} />
                                        Ticket Details
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{ticket.subject}</h2>
                                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin size={14} />
                                            Unit {ticket.unitNo}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(ticket.createdAt)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(statusLabel(ticket.status))}`}>
                                            {statusLabel(ticket.status) === 'InProgress' ? 'In Progress' : statusLabel(ticket.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-3 transition-all duration-300 ${
                                isClosing 
                                    ? 'animate-out fade-out zoom-out-95 duration-200' 
                                    : 'animate-in fade-in zoom-in-95 duration-300 [animation-delay:100ms]'
                            }`}>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <FileText size={14} />
                                    Description
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-4 transition-all duration-300 ${
                                isClosing 
                                    ? 'animate-out fade-out zoom-out-95 duration-200' 
                                    : 'animate-in fade-in zoom-in-95 duration-300 [animation-delay:200ms]'
                            }`}>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Wrench size={14} />
                                    Images
                                </div>
                                {ticket.images && ticket.images.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {ticket.images.map((image) => (
                                            <div key={image.id} className="rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedImageUrl(image.imageUrl)}>
                                                <img
                                                    src={image.imageUrl}
                                                    alt="Maintenance"
                                                    className="w-full h-48 sm:h-80 object-cover hover:opacity-90 transition-opacity"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs sm:text-sm text-gray-500">No images provided.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pb-2">
                                {resolveError && (
                                    <div className="text-xs text-red-600 mr-auto mt-2">{resolveError}</div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md active:scale-95 active:bg-gray-100"
                                >
                                    <X size={15} className="transition-transform duration-200 group-hover:rotate-90" />
                                    Cancel
                                </button>
                                {canEdit ? (
                                    <button
                                        type="button"
                                        onClick={openEditModal}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 active:scale-95 active:bg-blue-800"
                                    >
                                        <Pencil size={15} className="transition-transform duration-200 group-hover:-rotate-12" />
                                        Edit
                                    </button>
                                ) : (
                                    !isRenter && ticket && ticket.status !== MaintenanceTicketStatus.Resolved && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAsResolved}
                                            disabled={isMarkingResolved}
                                            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200 active:scale-95 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isMarkingResolved ? (
                                                <>
                                                    <Loader2 size={15} className="animate-spin" />
                                                    Resolving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={15} />
                                                    Mark as Resolved
                                                </>
                                            )}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Edit Request</h2>
                                <p className="text-xs text-gray-500">Update the subject or description of your request.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={isUpdating}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {editError && (
                                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                                    {editError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600" htmlFor="edit-subject">
                                    Subject
                                </label>
                                <input
                                    id="edit-subject"
                                    type="text"
                                    maxLength={200}
                                    required
                                    value={editSubject}
                                    onChange={(event) => setEditSubject(event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    disabled={isUpdating}
                                />
                                <p className="text-[11px] text-gray-400">{editSubject.length}/200 characters.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600" htmlFor="edit-description">
                                    Description
                                </label>
                                <textarea
                                    id="edit-description"
                                    rows={5}
                                    maxLength={2000}
                                    required
                                    value={editDescription}
                                    onChange={(event) => setEditDescription(event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    disabled={isUpdating}
                                />
                                <p className="text-[11px] text-gray-400">{editDescription.length}/2000 characters.</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={isUpdating}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdate}
                                    disabled={isUpdating || editSubject.trim().length === 0 || editDescription.trim().length === 0}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedImageUrl && (
                <div 
                    className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 ${
                        isImageClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-300'
                    }`}
                    onClick={() => {
                        setIsImageClosing(true);
                        setTimeout(() => {
                            setSelectedImageUrl(null);
                            setIsImageClosing(false);
                        }, 200);
                    }}
                >
                    <img
                        src={selectedImageUrl}
                        alt="Full view"
                        className={`max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl ${
                            isImageClosing ? 'animate-out zoom-out-95 duration-200' : 'animate-in zoom-in-95 duration-300'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default MaintenanceTicketDetailPage;
