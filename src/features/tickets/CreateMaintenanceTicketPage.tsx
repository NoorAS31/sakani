import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { maintenanceTicketService } from '../../services/maintenanceTicketService';
import { unitService } from '../../services/unitService';
import type { Unit } from '../../types/unit';

const CreateMaintenanceTicketPage = () => {
    usePageTitle('Create Maintenance Ticket');
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        unitId: '',
        subject: '',
        description: ''
    });

    useEffect(() => {
        unitService.getAll()
            .then(setUnits)
            .catch(err => {
                console.error('Failed to load units:', err);
                setError('Failed to load units');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!formData.unitId || !formData.subject || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await maintenanceTicketService.create({
                unitId: formData.unitId,
                subject: formData.subject,
                description: formData.description
            });
            navigate('/maintenance-tickets');
        } catch (err) {
            console.error('Failed to create ticket:', err);
            setError('Failed to create maintenance ticket');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/maintenance-tickets')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft size={18} />
                Back to Tickets
            </button>

            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Create Maintenance Ticket</h1>
                    <p className="text-blue-100">Report a maintenance issue for a unit</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.unitId}
                            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            required
                        >
                            <option value="">Select a unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    Unit #{unit.unitNo} - Floor {unit.floor}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Brief title of the maintenance issue"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide detailed description of the issue"
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/maintenance-tickets')}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMaintenanceTicketPage;
