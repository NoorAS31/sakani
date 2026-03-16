import { useState } from 'react';
import { ChevronDown, ChevronRight, Home, Plus, Layers, Maximize2 } from 'lucide-react';
import CreateUnitModal from './CreateUnitModal';
import {storage} from "../../utils/storage.ts";

const UnitsPage = () => {
    const [expandedProperties, setExpandedProperties] = useState<string[]>(['prop_1']);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

    const toggle = (id: string) => {
        setExpandedProperties(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Units Portfolio</h1>

            {/* Property Grouping Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                    onClick={() => toggle('prop_1')}
                    className="flex items-center justify-between p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3 font-semibold text-gray-700">
                        {expandedProperties.includes('prop_1') ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                        <span>Al-Yasmeen Tower</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsUnitModalOpen(true); }}
                        className="bg-gray-600 text-white p-1.5 rounded-md hover:bg-gray-700 shadow-sm"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {expandedProperties.includes('prop_1') && (
                    <div className="divide-y divide-gray-100 animate-in slide-in-from-top-2 duration-200">
                        {/* Unit Entry */}
                        <div className="flex items-center justify-between p-4 ml-8 hover:bg-blue-50/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <Home size={18} className="text-gray-400" />
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">Unit #101</div>
                                    <div className="flex gap-3 text-[10px] text-gray-400 uppercase tracking-tighter">
                                        <span className="flex items-center gap-1"><Layers size={10}/> 2nd Floor</span>
                                        <span className="flex items-center gap-1"><Maximize2 size={10}/> 120 sqm</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-900">$1,200</p>
                                    <p className="text-[10px] text-gray-400">Monthly Rent</p>
                                </div>
                                <span className="px-2 py-1 rounded text-[10px] font-black bg-green-100 text-green-700">AVAILABLE</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreateUnitModal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                tenantName={ storage.getTenantName() || null} />
        </div>
    );
};

export default UnitsPage;