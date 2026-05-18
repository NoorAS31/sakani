import { useEffect, useState } from 'react';
import type {FormEvent} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Upload, Check, Clock, XCircle, Edit2, X } from 'lucide-react';
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
                return { label: 'OPEN', color: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: AlertCircle, textColor: 'text-red-600' };
            case MaintenanceTicketStatus.InProgress:
                return { label: 'IN PROGRESS', color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Clock, textColor: 'text-blue-600' };
            case MaintenanceTicketStatus.Resolved:
                return { label: 'RESOLVED', color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300', badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: Check, textColor: 'text-green-600' };
            case MaintenanceTicketStatus.Closed:
                return { label: 'CLOSED', color: 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', icon: XCircle, textColor: 'text-gray-600' };
            default:
                return { label: 'UNKNOWN', color: 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', icon: AlertCircle, textColor: 'text-gray-600' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex justify-center items-center">
                <Loader2 className="animate-spin text-gray-600 dark:text-gray-400" size={40} />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
                <button
                    onClick={() => navigate('/maintenance-tickets')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 font-semibold"
                >
                    <ArrowLeft size={20} />
                    Back to Tickets
                </button>
                <div className="text-center text-gray-500">Ticket not found</div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(ticket.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/maintenance-tickets')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Tickets
                </button>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Header Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{ticket.subject}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Unit</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Unit #{ticket.unitNo}</p>
                                </div>
                                <div className="h-12 border-l border-gray-200 dark:border-gray-700"></div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Created</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                        </div>

                        {/* Images Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Images</h2>
                            
                            {ticket.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {ticket.images.map(image => (
                                        <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                            <img src={image.imageUrl} alt="Ticket" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mb-6">No images uploaded yet</p>
                            )}

                            <form onSubmit={handleImageUpload} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upload Image</label>
                                <div className="flex gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-600 file:text-gray-800 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-gray-700"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isUploadingImage}
                                        className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <Upload size={18} />
                                        {isUploadingImage ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-4">Status</h3>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${statusConfig.color} mb-4`}>
                                <StatusIcon size={20} />
                                <span className="font-semibold">{statusConfig.label}</span>
                            </div>

                            {!isEditingStatus ? (
                                <button
                                    onClick={() => setIsEditingStatus(true)}
                                    disabled={ticket.status === MaintenanceTicketStatus.Closed}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit2 size={16} />
                                    Change Status
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                                    >
                                        <option value={MaintenanceTicketStatus.Open}>Open</option>
                                        <option value={MaintenanceTicketStatus.InProgress}>In Progress</option>
                                        <option value={MaintenanceTicketStatus.Resolved}>Resolved</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleStatusChange}
                                            disabled={submitting}
                                            className="flex-1 px-3 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditingStatus(false)}
                                            className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Card */}
                        {ticket.status !== MaintenanceTicketStatus.Closed && (
                            <button
                                onClick={handleCancel}
                                disabled={submitting}
                                className="w-full px-4 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Cancel Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceTicketDetailPage;
