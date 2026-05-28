import { useEffect, useState } from 'react';
import { Plus, MapPin, Edit3, Trash2, Eye } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import CreatePropertyModal from './CreatePropertyModal';
import UpdatePropertyModal from './UpdatePropertyModal'; // Import the Edit Modal
import type { Property } from '../../types/property';
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal.tsx"
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';


const PropertiesPage = () => {
    usePageTitle('Properties');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const confirmDelete = async () => {
        if (!propertyToDelete) return;

        try {
            setIsDeleting(true);
            await propertyService.delete(propertyToDelete.id);
            await loadProperties(); // Refresh list
            setPropertyToDelete(null); // Close modal
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const loadProperties = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getAll();
            setProperties(data);
        } catch (err) {
            console.error("Failed to load properties:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);


    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-fade-in-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Real Estate Portfolio</h1>
                    <p className="text-xs sm:text-sm text-gray-500">Manage your buildings and properties</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gray-800 hover:bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-semibold whitespace-nowrap text-sm"
                >
                    <Plus size={18} /> Add Property
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-4 w-48 rounded-2xl border border-gray-100 shadow-sm card-fade-in-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Buildings</p>
                <p className="text-2xl font-black text-gray-800">{properties.length}</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 italic">Fetching your properties...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 card-fade-in-3">
                    {properties.map((property, index) => (
                        <div key={property.id} className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                            index < 3 ? `card-fade-in-${index + 1}` : ''
                        }`}>

                            <div className="p-4 sm:p-5">
                                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">{property.name}</h3>
                                <div className="flex flex-col gap-1 text-gray-500 text-xs sm:text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        <span>{property.city}, {property.street}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 ">{property.propertyType}</span>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate(`/units?propertyId=${property.id}`)}
                                        className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                                        <Eye size={16} /> View Units
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedProperty(property)} // Trigger Edit Modal
                                            className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs sm:text-sm font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Edit3 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={()=>setPropertyToDelete(property)}
                                            className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreatePropertyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPropertyCreated={loadProperties}
            />

            {selectedProperty && (
                <UpdatePropertyModal
                    property={selectedProperty}
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onPropertyUpdated={loadProperties}
                />
            )}
            <DeleteConfirmationModal
                isOpen={!!propertyToDelete}
                onClose={() => setPropertyToDelete(null)}
                onConfirm={confirmDelete}
                title={propertyToDelete?.name || ""}
                isSubmitting={isDeleting}
            />
        </div>
    );
};

export default PropertiesPage;