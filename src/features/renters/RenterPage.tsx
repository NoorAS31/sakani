import { useEffect, useState } from 'react';
import {
    User,
    Phone,
    CreditCard,
    Plus,
    Search,
    Loader2,
    MessageSquare,
    X,
    Mail,
    Info,
    Pen,
    ArrowRight,
    UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { renterService } from '../../services/renterService';
import type { Renter } from '../../types/renter';
import CreateRenterModal from "./CreateRenterModal.tsx";
import CreateContractModal from "../contracts/CreateContractModal.tsx";
import AddRenterUserModal from "./AddRenterUserModal.tsx";
import { usePageTitle } from '../../hooks/usePageTitle';

const RentersPage = () => {
    usePageTitle('Renters');
    const navigate = useNavigate();
    const [renters, setRenters] = useState<Renter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);

    const handleRenterCreated = () => {
        renterService.getAll().then(setRenters);
    };
    
    const handleContractCreated = () => {
        setIsContractModalOpen(false);
    };

    const handleRenterUserCreated = () => {
        setIsAddUserModalOpen(false);
        renterService.getAll().then(setRenters);
    };

    useEffect(() => {
        renterService.getAll()
            .then(setRenters)
            .catch(() => setRenters([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredRenters = renters.filter(r => {
        const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            r.nationalId.includes(searchTerm);
    });

    const handleViewContracts = (renter: Renter) => {
        navigate(`/contracts?renter=${encodeURIComponent(`${renter.firstName} ${renter.lastName}`)}`);
    };

    return (
        /* FIX: Ensure this is a flex container so the Sidebar and Grid sit side-by-side */
        <div className="flex flex-row gap-6 relative min-h-screen">

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${selectedRenter ? 'w-8/12' : 'w-full'} space-y-6`}>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Renters Directory</h1>
                        <p className="text-sm text-gray-500">Manage resident profiles and contact information</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            disabled={!selectedRenter || !!selectedRenter?.userId}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-all shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            title={selectedRenter?.userId ? "User account already exists for this renter" : ""}>
                            <UserPlus size={18} /> Add User
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-sm font-semibold">
                            <Plus size={18} /> Add Renter
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or National ID..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={40} /></div>
                ) : (
                    /* Dynamic Grid: Adjusts columns based on whether side panel is open */
                    <div className={`grid grid-cols-1 ${selectedRenter ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                        {filteredRenters.map(renter => (
                            <div key={renter.id}
                                 onClick={() => setSelectedRenter(renter)}
                                 className={`bg-white rounded-3xl transition-all border p-6 cursor-pointer relative group ${
                                     selectedRenter?.id === renter.id
                                         ? 'border-gray-900 ring-2 ring-gray-900/5 shadow-md'
                                         : 'border-gray-100 hover:shadow-md'
                                 }`}>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                            selectedRenter?.id === renter.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-900 group-hover:text-white'
                                        }`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{`${renter.firstName} ${renter.lastName}`}</h3>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <CreditCard size={10} /> {renter.nationalId}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-3 p-2 rounded-xl">
                                        <Phone size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-600">{renter.phoneNumber}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewContracts(renter);
                                        }}
                                        className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight size={16} /> View Contracts
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Side Details Panel */}
            {selectedRenter && (
                <div className="w-4/12 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-[fit-content] sticky top-8 animate-in slide-in-from-right duration-300">
                    {/* Header with Background Accent */}
                    <div className="bg-gray-900 p-6 text-white relative">
                        <button
                            onClick={() => setSelectedRenter(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                                <User size={40} />
                            </div>
                            <h2 className="text-xl font-bold">{`${selectedRenter.firstName} ${selectedRenter.lastName}`}</h2>
                            <p className="text-xs text-gray-400 font-mono">#{selectedRenter.id.split('-')[0]}</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Personal Information Group */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} /> Personal Information
                            </h3>
                            <DetailItem icon={<Pen size ={16}/>} label={"First Name"} value={selectedRenter.firstName}/>
                            <DetailItem icon={<Pen size ={16}/>} label={"Last Name"} value={selectedRenter.lastName}/>
                            <DetailItem icon={<CreditCard size={16}/>} label="National ID" value={selectedRenter.nationalId} />
                            <DetailItem icon={<Mail size={16}/>} label="Email Address" value={selectedRenter.email} />
                            <DetailItem icon={<Phone size={16}/>} label="Phone Number" value={selectedRenter.phoneNumber} />
                        </div>

                        <hr className="border-gray-100" />

                        {/* Bio/Description Group */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={14} /> Notes
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                                {selectedRenter.description || "No additional notes provided for this renter."}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 flex flex-col gap-2">

                            <button
                                onClick={() => setIsContractModalOpen(true)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-gray-200">
                                Create Contract
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CreateRenterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRenterCreated={handleRenterCreated}
            />

            <CreateContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                onContractCreated={handleContractCreated}
                preselectedRenter={selectedRenter}
            />

            <AddRenterUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={handleRenterUserCreated}
                renter={selectedRenter}
            />

        </div>
    );
};

/* Improved DetailItem with optional Icon */
const DetailItem = ({ label, value, icon }: { label: string, value: any, icon?: React.ReactNode }) => (
    <div className="group flex items-start gap-3">
        {icon && <div className="mt-0.5 text-gray-400">{icon}</div>}
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
            <p className="text-sm text-gray-700 font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default RentersPage;
