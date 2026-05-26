import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isSubmitting?: boolean;
}

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description,
    confirmText = 'Delete Now',
    cancelText = 'Cancel',
    isSubmitting 
}: DeleteModalProps) => {
    if (!isOpen) return null;

    const defaultDescription = `Are you sure you want to delete <span class="font-semibold text-gray-800">"${title}"</span>?
                        This action cannot be undone and may affect associated units.`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-full text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {description ? description : <span dangerouslySetInnerHTML={{ __html: defaultDescription }} />}
                    </p>
                </div>

                <div className="flex gap-3 p-6 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-white transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-100"
                    >
                        {isSubmitting ? `${confirmText.replace(' Now', '')}...` : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;