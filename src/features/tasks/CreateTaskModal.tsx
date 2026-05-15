import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { storage } from '../../utils/storage';
import { taskService } from '../../services/TicketService.ts';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void; // To refresh the list after saving
}

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        propertyId: '',
        unitId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tId = storage.getTenantID();
        const uId = storage.getUserId();

        if (!tId || !uId) return;

        setIsSubmitting(true);

        // This is the taskPayload we discussed!
        const taskPayload = {
            ...formData,
            status: 'PENDING' as const, // Strict string type from your interface
            tenantId: tId,
            createdBy: uId,
            createdAt: new Date().toISOString(),
        };

        try {
            await taskService.create(taskPayload);
            onTaskCreated(); // Refresh the parent table
            onClose();
        } catch (err) {
            console.error("Task creation failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Wrench className="text-blue-600" size={20} />
                        <h2 className="text-xl font-bold">New Maintenance Request</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Issue Title</label>
                        <input
                            name="title" required placeholder="e.g. Broken AC in Bedroom"
                            onChange={handleChange}
                            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                            name="description" rows={3} placeholder="Provide more details..."
                            onChange={handleChange}
                            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Priority</label>
                            <select name="priority" onChange={handleChange} className="w-full border rounded-xl px-3 py-2 bg-white">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent 🔥</option>
                            </select>
                        </div>
                        {/* Status is hidden from the form because it defaults to PENDING */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Initial Status</label>
                            <div className="px-3 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-200">
                                PENDING
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-500 font-medium">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;