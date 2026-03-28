import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, ArrowRight, Loader2 } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { unitService } from '../../services/unitService';
import type { Property } from '../../types/property';
import type { Unit } from '../../types/unit';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch all properties
                const props = await propertyService.getAll();
                setProperties(props);


                const unitPromises = props.map(p => unitService.getByPropertyId(p.id).catch(() => []));
                const unitsResults = await Promise.all(unitPromises);
                setAllUnits(unitsResults.flat());
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Logic for Card 2: Status Aggregation
    const stats = {
        available: allUnits.filter(u => (u as any).unitStatus === 1 || (u as any).UnitStatus === 1).length,
        rented: allUnits.filter(u => (u as any).unitStatus === 2 || (u as any).UnitStatus === 2).length,
        maintenance: allUnits.filter(u => (u as any).unitStatus === 3 || (u as any).UnitStatus === 3).length,
        reserved: allUnits.filter(u => (u as any).unitStatus === 4 || (u as any).UnitStatus === 4).length,
        total: allUnits.length
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );
    console.log("Current Units in State:", allUnits);
    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Tenant Dashboard</h1>
                <p className="text-gray-500 text-sm">Portfolio Overview & Property Health</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: My Properties (Anchors) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <Building2 size={18} className="text-blue-500" /> My Properties
                        </h2>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                            {properties.length} Total
                        </span>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                        {properties.map(prop => (
                            <button
                                key={prop.id}
                                onClick={() => navigate('/units')} // Navigates to the portfolio page
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-sm text-gray-800">{prop.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{prop.city}</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card 2: Unit Status (Preview Circle) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <Home size={18} className="text-orange-500" /> Unit Occupancy
                        </h2>
                    </div>

                    <div className="flex items-center justify-around h-32">
                        {/* The Visual Circle */}
                        <div className="relative w-28 h-28 rounded-full border-[12px] border-gray-50 flex items-center justify-center shadow-inner">
                            {/* We could use a CSS conic-gradient here for a real chart later */}
                            <div className="text-center">
                                <span className="block text-2xl font-black text-gray-800">{stats.total}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Total Units</span>
                            </div>
                        </div>

                        {/* Legend matching your Enum Integer Statuses */}
                        <div className="text-xs space-y-2 font-medium">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-gray-600 w-20">Available</span>
                                <span className="font-bold text-gray-900">{stats.available}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-gray-600 w-20">Rented</span>
                                <span className="font-bold text-gray-900">{stats.rented}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-gray-600 w-20">Maintenance</span>
                                <span className="font-bold text-gray-900">{stats.maintenance}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                                <span className="text-gray-600 w-20">Reserved</span>
                                <span className="font-bold text-gray-900">{stats.reserved}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;