import  { useState } from 'react';
import { Plus, Building, MapPin, ExternalLink } from 'lucide-react';
import CreatePropertyModal from './CreatePropertyModal.tsx';

const PropertiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
                    <p className="text-sm text-gray-500">Manage buildings and physical locations.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} /> Add Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Property Card Template */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-gray-300 transition-all">
                    <div className="h-3 bg-gray-600"></div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                <Building size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">RESIDENTIAL</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Al-Yasmeen Tower</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} /> <span>Amman, Abdali</span>
                            </div>
                            <p>Street: King Hussein St. | Bldg: 44</p>
                        </div>
                        <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-blue-50 hover:text-gray-600 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                            <ExternalLink size={14} /> View Units
                        </button>
                    </div>
                </div>
            </div>

            <CreatePropertyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PropertiesPage;