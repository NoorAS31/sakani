import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { MaintenanceTicketService } from '../../services/maintenanceTicketService';
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
            await MaintenanceTicketService.create({
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex justify-center items-center">
                <Loader2 className="animate-spin text-gray-600 dark:text-gray-400" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/maintenance-tickets')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Tickets
                </button>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-800 p-8 text-white">
                        <h1 className="text-4xl font-bold mb-2">Create Ticket</h1>
                        <p className="text-gray-300">Report a new maintenance issue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Unit Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.unitId}
                                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 transition-all"
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

                        {/* Subject Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief title of the maintenance issue"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                                required
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Provide detailed description of the issue"
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all"
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/maintenance-tickets')}
                                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMaintenanceTicketPage;
