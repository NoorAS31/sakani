import { useEffect, useState } from 'react';
import { FileText, Plus, Search, Calendar, DollarSign, User, Home, X, Loader2, Clock, Download, XCircle } from 'lucide-react';
import { contractService } from '../../services/contractService';
import { unitService } from '../../services/unitService';
import { renterService } from '../../services/renterService';
import type { Contract } from '../../types/contract';
import type { Unit } from '../../types/unit';
import type { Renter } from '../../types/renter';
import CreateContractModal from './CreateContractModal';

interface ContractDisplay extends Contract {
    unitNo?: string;
    renterName?: string;
}

const getPaymentFreqLabel = (freq: number): string => {
    switch (freq) {
        case 1: return 'Monthly';
        case 3: return 'Quarterly';
        case 6: return 'Semi-Annually';
        case 12: return 'Yearly';
        default: return 'Monthly';
    }
};

const ContractsPage = () => {
    const [contracts, setContracts] = useState<ContractDisplay[]>([]);
    const [selectedContract, setSelectedContract] = useState<ContractDisplay | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDownloadPDF = (contract: ContractDisplay) => {
        // Generate a simple text-based contract document
        const contractContent = `
LEASE CONTRACT AGREEMENT
========================

Contract Reference: ${contract.id}
Generated: ${new Date().toLocaleDateString()}

PARTIES
-------
Unit: #${contract.unitNo || 'N/A'}
Renter: ${contract.renterName || 'N/A'}

CONTRACT TERMS
--------------
Start Date: ${new Date(contract.startDate).toLocaleDateString()}
End Date: ${new Date(contract.endDate).toLocaleDateString()}
Rent Amount: $${contract.rentAmount}
Payment Frequency: ${getPaymentFreqLabel(contract.paymentFreq)}
Contract Status: ${contract.contractStatus === 1 ? 'Draft' : contract.contractStatus === 2 ? 'Active' : contract.contractStatus === 3 ? 'Expired' : 'Terminated'}

SIGNATURES
----------
Landlord: ______________________ Date: __________

Renter: ________________________ Date: __________
        `;

        // Create blob and download
        const blob = new Blob([contractContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contract.id.split('-')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const [contractsData, unitsData, rentersData] = await Promise.all([
                contractService.getAll(),
                unitService.getAll(),
                renterService.getAll()
            ]);
            
            // Create lookup maps for units and renters
            const unitsMap = new Map<string, Unit>();
            unitsData.forEach((u: Unit) => {
                const id = u.id || '';
                unitsMap.set(id, u);
            });
            
            const rentersMap = new Map<string, Renter>();
            rentersData.forEach((r: Renter) => {
                const id = r.id || '';
                rentersMap.set(id, r);
            });
            
            // Enrich contracts with unit and renter info
            const enriched: ContractDisplay[] = contractsData.map((c: Contract) => {
                const unit = unitsMap.get(c.unitId);
                const renter = rentersMap.get(c.renterId);
                return {
                    id: c.id,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    rentAmount: c.rentAmount,
                    contractStatus: c.contractStatus,
                    paymentFreq: c.paymentFreq ?? 1,
                    unitId: c.unitId,
                    renterId: c.renterId,
                    unitNo: unit?.unitNo || '',
                    renterName: renter?.fullName || '',
                };
            });
            
            setContracts(enriched);
        } catch (error) {
            console.error("Failed to load contracts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const filteredContracts = contracts.filter(c => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            c.renterName?.toLowerCase().includes(search) ||
            c.unitNo?.toLowerCase().includes(search) ||
            c.id.toLowerCase().includes(search)
        );
    });

    return (
        <div className="flex flex-row gap-6 relative min-h-[calc(100vh-100px)]">
            {/* Main List Section */}
            <div className={`transition-all duration-300 ${selectedContract ? 'w-8/12' : 'w-full'} space-y-6`}>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Lease Contracts</h1>
                        <p className="text-sm text-gray-500">Track agreements, payments, and durations</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-sm font-semibold"
                    >
                        <Plus size={18} /> New Contract
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by renter name or unit number..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={40} /></div>
                ) : filteredContracts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-600">No contracts found</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? `No results for "${searchTerm}"` : 'Create your first contract to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Unit</th>
                                <th className="px-6 py-4">Renter</th>
                                <th className="px-6 py-4">Monthly Rent</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">End Date</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 cursor-pointer">
                            {filteredContracts.map((contract) => (
                                <tr
                                    key={contract.id}
                                    onClick={() => setSelectedContract(contract)}
                                    className={`hover:bg-gray-50 transition-colors ${selectedContract?.id === contract.id ? 'bg-gray-50' : ''}`}
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900">#{contract.unitNo || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{contract.renterName || 'Renter'}</td>
                                    <td className="px-6 py-4 font-semibold text-blue-600">${contract.rentAmount}</td>
                                    <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                contract.contractStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {contract.contractStatus === 1 ? 'Active' : 'Pending'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(contract.endDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Side Details Panel */}
            {selectedContract && (
                <div className="w-4/12 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-fit sticky top-8 animate-in slide-in-from-right duration-300">
                    <div className="bg-gray-600 p-6 text-white relative">
                        <button onClick={() => setSelectedContract(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
                        <FileText size={32} className="mb-4 opacity-50" />
                        <h2 className="text-xl font-bold">Contract Details</h2>
                        <p className="text-xs text-blue-100 opacity-80">Reference: {selectedContract.id.split('-')[0]}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <DetailItem icon={<Home size={16}/>} label="Unit" value={selectedContract.unitNo ? `Unit #${selectedContract.unitNo}` : 'N/A'} />
                            <DetailItem icon={<User size={16}/>} label="Renter" value={selectedContract.renterName || 'N/A'} />
                            <hr className="border-gray-50" />
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={<Calendar size={16}/>} label="Starts" value={new Date(selectedContract.startDate).toLocaleDateString()} />
                                <DetailItem icon={<Calendar size={16}/>} label="Ends" value={new Date(selectedContract.endDate).toLocaleDateString()} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={<DollarSign size={16}/>} label="Rent Amount" value={`$${selectedContract.rentAmount}`} />
                                <DetailItem icon={<Clock size={16}/>} label="Payment Freq" value={getPaymentFreqLabel(selectedContract.paymentFreq)} />
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="pt-4 space-y-3">
                            <button 
                                onClick={() => handleDownloadPDF(selectedContract)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Download PDF
                            </button>
                            {(selectedContract.contractStatus === 1 || selectedContract.contractStatus === 2) && (
                                <button 
                                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Terminate Contract
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <CreateContractModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContractCreated={fetchContracts}
            />
        </div>
    );
};

const DetailItem = ({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{label}</p>
            <p className="text-sm text-gray-800 font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default ContractsPage;