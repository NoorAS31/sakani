import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, FileText, Loader2, MapPin, Pencil, Wrench, X } from 'lucide-react';
import { maintenanceService } from '../../services/maintenanceService';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { TicketImageDto, TicketResponseDto } from '../../types/maintenance';

interface TicketDetailsApiDto {
    id: string;
    unitNo: string;
    subject: string;
    description: string;
    status: number | TicketResponseDto['status'];
    createdAt: string;
    images: TicketImageDto[];
}

const TicketDetailsPage = () => {
    usePageTitle('Maintenance Ticket');
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<TicketDetailsApiDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const statusMap = useMemo(
        () => ({
            0: 'Open',
            1: 'InProgress',
            2: 'Resolved',
            3: 'Closed'
        }),
        []
    );

    useEffect(() => {
        if (!id) {
            setErrorMessage('Ticket not found.');
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadTicket = async () => {
            try {
                const data = await maintenanceService.getTicketById(id, { signal: controller.signal });
                if (!controller.signal.aborted) {
                    setTicket(data as TicketDetailsApiDto);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                const status = (error as { response?: { status?: number } })?.response?.status;
                if (status === 404) {
                    setErrorMessage('No ticket found for this request.');
                    setTicket(null);
                    return;
                }
                setErrorMessage('Unable to load this ticket right now.');
                setTicket(null);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadTicket();

        return () => controller.abort();
    }, [id]);

    const openEditModal = () => {
        if (!ticket) return;
        setEditSubject(ticket.subject);
        setEditDescription(ticket.description);
        setEditError(null);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditError(null);
    };

    const handleUpdate = async () => {
        if (!ticket || !id) return;
        setEditError(null);
        setIsUpdating(true);
        try {
            await maintenanceService.updateTicket(id, {
                id,
                subject: editSubject.trim(),
                description: editDescription.trim()
            });
            setTicket((prev) => prev ? { ...prev, subject: editSubject.trim(), description: editDescription.trim() } : prev);
            closeEditModal();
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setEditError(message || 'Failed to update the ticket. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

    const statusLabel = (status: TicketDetailsApiDto['status']) => {
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    if (errorMessage || !ticket) {
        return (
            <div className="p-6 space-y-4">
                <button
                    type="button"
                    onClick={() => navigate('/maintenance')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                    ← Back to Requests
                </button>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
                        <FileText size={22} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Ticket not available</h2>
                    <p className="text-sm text-gray-500 mt-1">{errorMessage || 'No details found.'}</p>
                </div>
            </div>
        );
    }

    const resolvedStatus = statusLabel(ticket.status);

    return (
        <div className="p-6 space-y-6">
            <button
                type="button"
                onClick={() => navigate('/maintenance')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
                ← Back to Requests
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Wrench size={14} />
                        Ticket Details
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            Unit {ticket.unitNo}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(ticket.createdAt)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(resolvedStatus)}`}>
                            {resolvedStatus === 'InProgress' ? 'In Progress' : resolvedStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <FileText size={14} />
                    Description
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Wrench size={14} />
                    Images
                </div>
                {ticket.images && ticket.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ticket.images.map((image) => (
                            <div key={image.id} className="rounded-xl border border-gray-200 overflow-hidden">
                                <img
                                    src={image.imageUrl}
                                    alt="Maintenance"
                                    className="w-full h-80 object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No images provided.</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-2">
                <button
                    type="button"
                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md active:scale-95 active:bg-gray-100"
                >
                    <X size={15} className="transition-transform duration-200 group-hover:rotate-90" />
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={openEditModal}
                    className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 active:scale-95 active:bg-blue-800"
                >
                    <Pencil size={15} className="transition-transform duration-200 group-hover:-rotate-12" />
                    Edit
                </button>
            </div>

            {/* Edit Modal */}
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
                                    onChange={(e) => setEditSubject(e.target.value)}
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
                                    onChange={(e) => setEditDescription(e.target.value)}
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
        </div>
    );
};

export default TicketDetailsPage;