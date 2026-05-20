import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { maintenanceService } from '../../../services/maintenanceService.ts';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void | Promise<void>;
}

const CreateTicketModal = ({ isOpen, onClose, onSuccess }: CreateTicketModalProps) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resetForm = () => {
        setSubject('');
        setDescription('');
        setFiles([]);
        setIsSubmitting(false);
        setUploadStatus('');
        setErrorMessage(null);
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
            return;
        }

        resetForm();
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);
        setUploadStatus('Submitting ticket...');

        try {
            const response = await maintenanceService.createTicket({
                subject: subject.trim(),
                description: description.trim()
            });
            const ticketId = response as unknown as string;

            if (!ticketId) {
                throw new Error('Missing ticketId from response.');
            }

            let uploadFailed = false;

            // رفع الملفات بالتوازي باستخدام Promise.all لسرعة وكفاءة أعلى
            if (files.length > 0) {
                setUploadStatus(`Uploading ${files.length} image(s)...`);
                try {
                    const uploadPromises = files.map((file) =>
                        maintenanceService.uploadTicketImage(ticketId, file)
                    );
                    await Promise.all(uploadPromises);
                } catch (uploadError) {
                    console.error('Failed to upload some ticket images', uploadError);
                    uploadFailed = true;
                }
            }

            if (uploadFailed) {
                window.alert('Ticket created, but some images failed to upload. You can add them later.');
            }

            await Promise.resolve(onSuccess());
            onClose();
            resetForm();
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setErrorMessage(message || 'Unable to create the ticket right now. Please try again.');
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        const validFiles: File[] = [];
        const maxSize = 5 * 1024 * 1024;

        selectedFiles.forEach((file) => {
            const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
            const isValidSize = file.size <= maxSize;

            if (!isValidType) {
                setErrorMessage('Only JPG and PNG images are allowed.');
                return;
            }

            if (!isValidSize) {
                setErrorMessage('Each image must be 5MB or less.');
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            setFiles((prev) => [...prev, ...validFiles]);
        }

        event.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New Maintenance Request</h2>
                        <p className="text-xs text-gray-500">Describe the issue so we can help quickly.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {errorMessage && (
                        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600" htmlFor="ticket-subject">
                            Subject
                        </label>
                        <input
                            id="ticket-subject"
                            type="text"
                            maxLength={100}
                            required
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="e.g., AC not cooling"
                            disabled={isSubmitting}
                        />
                        <p className="text-[11px] text-gray-400">Max 100 characters.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600" htmlFor="ticket-description">
                            Description
                        </label>
                        <textarea
                            id="ticket-description"
                            required
                            rows={4}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Share the details of the issue..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600" htmlFor="ticket-images">
                            Attach Images (optional)
                        </label>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-500">
                            <span>Select JPG/PNG images (max 5MB each)</span>
                            <label
                                className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
                                htmlFor="ticket-images"
                            >
                                Browse
                            </label>
                        </div>
                        <input
                            id="ticket-images"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isSubmitting}
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Selected Images</p>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"
                                    >
                                        <span className="truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-gray-400 hover:text-gray-700"
                                            aria-label="Remove file"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {uploadStatus || 'Submitting...'}
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;