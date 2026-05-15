import { useEffect, useState } from 'react';
import type {FormEvent} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Upload, Check, Clock, XCircle } from 'lucide-react';
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
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<number>(1);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        if (!id) return;
        
        maintenanceTicketService.getById(id)
            .then(data => {
                setTicket(data);
                setNewStatus(Number(data.status));
            })
            .catch(err => {
                console.error('Failed to load ticket:', err);
                setError('Failed to load ticket');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusChange = async () => {
        if (!ticket) return;
        setSubmitting(true);
        setError(null);

        try {
            await maintenanceTicketService.updateStatus({
                ticketId: ticket.id,
                newStatus: newStatus as MaintenanceTicketStatus
            });
            setTicket({ ...ticket, status: newStatus });
            setIsEditingStatus(false);
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Failed to update status');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (e: FormEvent<HTMLFormElement>) => {
        if (!ticket) return;
        const formElement = e.currentTarget;
        const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement;
        
        if (!fileInput?.files?.[0]) {
            setError('Please select an image');
            return;
        }

        setIsUploadingImage(true);
        setError(null);

        try {
            await maintenanceTicketService.uploadImage(ticket.id, fileInput.files[0]);
            const updatedTicket = await maintenanceTicketService.getById(ticket.id);
            setTicket(updatedTicket);
            formElement.reset();
        } catch (err) {
            console.error('Failed to upload image:', err);
            setError('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleCancel = async () => {
        if (!ticket || !window.confirm('Are you sure you want to cancel this ticket?')) return;

        setSubmitting(true);
        setError(null);

        try {
            await maintenanceTicketService.cancel(ticket.id);
            setTicket({ ...ticket, status: MaintenanceTicketStatus.Closed });
        } catch (err) {
            console.error('Failed to cancel ticket:', err);
            setError('Failed to cancel ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status: MaintenanceTicketStatus | string | number) => {
        switch (Number(status)) {
            case MaintenanceTicketStatus.Open:
                return { label: 'OPEN', color: 'bg-blue-100 text-blue-700', icon: AlertCircle };
            case MaintenanceTicketStatus.InProgress:
                return { label: 'IN PROGRESS', color: 'bg-amber-100 text-amber-700', icon: Clock };
            case MaintenanceTicketStatus.Resolved:
                return { label: 'RESOLVED', color: 'bg-green-100 text-green-700', icon: Check };
            case MaintenanceTicketStatus.Closed:
                return { label: 'CLOSED', color: 'bg-gray-100 text-gray-700', icon: XCircle };
            default:
                return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6">
                <button
                    onClick={() => navigate('/maintenance-tickets')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
                >
                    <ArrowLeft size={18} />
                    Back to Tickets
                </button>
                <div className="text-center text-gray-500">Ticket not found</div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(ticket.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/maintenance-tickets')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft size={18} />
                Back to Tickets
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Ticket Header */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.subject}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-gray-600">
                                Unit: <span className="font-semibold text-gray-900">Unit #{ticket.unitNo}</span>
                            </span>
                            <span className="text-gray-600">
                                Created: <span className="font-semibold text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Images</h2>
                        
                        {ticket.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {ticket.images.map(image => (
                                    <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                                        <img src={image.imageUrl} alt="Ticket" className="w-full h-48 object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-6">No images uploaded yet</p>
                        )}

                        <form onSubmit={handleImageUpload} className="border-t border-gray-200 pt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isUploadingImage}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Status</h3>
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${statusConfig.color} mb-4`}>
                            <StatusIcon size={18} />
                            <span className="font-semibold">{statusConfig.label}</span>
                        </div>

                        {!isEditingStatus ? (
                            <button
                                onClick={() => setIsEditingStatus(true)}
                                disabled={ticket.status === MaintenanceTicketStatus.Closed}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Change Status
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value={MaintenanceTicketStatus.Open}>Open</option>
                                    <option value={MaintenanceTicketStatus.InProgress}>In Progress</option>
                                    <option value={MaintenanceTicketStatus.Resolved}>Resolved</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={submitting}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingStatus(false)}
                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {ticket.status !== MaintenanceTicketStatus.Closed && (
                        <button
                            onClick={handleCancel}
                            disabled={submitting}
                            className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                            Cancel Ticket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceTicketDetailPage;
