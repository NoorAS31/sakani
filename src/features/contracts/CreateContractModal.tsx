import React, { useEffect, useState, useMemo, useRef } from 'react';
import { X, Home, User, CreditCard, Save, Loader2, Search, XCircle } from 'lucide-react';
import { unitService } from '../../services/unitService';
import { renterService } from '../../services/renterService';
import { contractService } from '../../services/contractService';
import type { Unit } from '../../types/unit';
import type { Renter } from '../../types/renter';

interface CreateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContractCreated: () => void;
    preselectedRenter?: Renter | null;
    preselectedUnit?: Unit | null;
}

const CreateContractModal = ({ isOpen, onClose, onContractCreated, preselectedRenter, preselectedUnit }: CreateContractModalProps) => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [renters, setRenters] = useState<Renter[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search States - separate display text from actual search query
    const [unitSearch, setUnitSearch] = useState('');
    const [renterSearch, setRenterSearch] = useState('');
    const [showUnitResults, setShowUnitResults] = useState(false);
    const [showRenterResults, setShowRenterResults] = useState(false);
    
    // Track selected items separately from search text
    const [selectedUnitDisplay, setSelectedUnitDisplay] = useState('');
    const [selectedRenterDisplay, setSelectedRenterDisplay] = useState('');
    
    // Refs for click outside detection
    const unitSearchRef = useRef<HTMLDivElement>(null);
    const renterSearchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        rentAmount: 0,
        unitId: '',
        renterId: '',
        contractStatus: 1,
        paymentFreq: 1
    });

    // 1. Load Data
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoadingData(true);
                try {
                    const [allUnits, allRenters] = await Promise.all([
                        unitService.getAll(),
                        renterService.getAll()
                    ]);
                    // Only Vacant units (status 1) - handle both casing from API
                    const vacantUnits = allUnits.filter((u: any) => {
                        const status = u.unitStatus ?? u.UnitStatus;
                        return status === 1;
                    });
                    setUnits(vacantUnits);
                    setRenters(allRenters);
                } catch (error) {
                    console.error("Error loading dependencies:", error);
                } finally {
                    setLoadingData(false);
                }
            };
            loadData();
        }
    }, [isOpen]);
    
    // 1a. Prefill renter when preselectedRenter is provided
    useEffect(() => {
        if (isOpen && preselectedRenter) {
            const renterId = preselectedRenter.id || '';
            const fullName = `${preselectedRenter.firstName} ${preselectedRenter.lastName}`;
            setFormData(prev => ({ ...prev, renterId }));
            setRenterSearch(fullName);
            setSelectedRenterDisplay(fullName);
        }
    }, [isOpen, preselectedRenter]);
    
    // 1a2. Prefill unit when preselectedUnit is provided
    useEffect(() => {
        if (isOpen && preselectedUnit) {
            const unitId = preselectedUnit.id || (preselectedUnit as any).Id || '';
            const unitNo = preselectedUnit.unitNo || (preselectedUnit as any).UnitNo || '';
            const rentPrice = preselectedUnit.rentPrice ?? (preselectedUnit as any).RentPrice ?? 0;
            const displayText = `#${unitNo}`;
            setFormData(prev => ({ ...prev, unitId, rentAmount: rentPrice }));
            setUnitSearch(displayText);
            setSelectedUnitDisplay(displayText);
        }
    }, [isOpen, preselectedUnit]);
    
    // 1b. Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                rentAmount: 0,
                unitId: '',
                renterId: '',
                contractStatus: 1,
                paymentFreq: 1
            });
            setUnitSearch('');
            setRenterSearch('');
            setSelectedUnitDisplay('');
            setSelectedRenterDisplay('');
        }
    }, [isOpen]);
    
    // 1c. Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (unitSearchRef.current && !unitSearchRef.current.contains(event.target as Node)) {
                setShowUnitResults(false);
            }
            if (renterSearchRef.current && !renterSearchRef.current.contains(event.target as Node)) {
                setShowRenterResults(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 2. Search Logic - filter against actual search text, not display text
    const filteredUnits = useMemo(() => {
        // If a unit is selected and input shows selection, show all units when dropdown opens
        if (formData.unitId && selectedUnitDisplay && unitSearch === selectedUnitDisplay) {
            return units;
        }
        if (!unitSearch.trim()) return units;
        const searchLower = unitSearch.toLowerCase();
        return units.filter((u: Unit) => {
            const unitNo = (u.unitNo || '').toString().toLowerCase();
            const rentPrice = String(u.rentPrice ?? '');
            return unitNo.includes(searchLower) || rentPrice.includes(unitSearch);
        });
    }, [units, unitSearch, formData.unitId, selectedUnitDisplay]);

    const filteredRenters = useMemo(() => {
        // If a renter is selected and input shows selection, show all renters when dropdown opens
        if (formData.renterId && selectedRenterDisplay && renterSearch === selectedRenterDisplay) {
            return renters;
        }
        if (!renterSearch.trim()) return renters;
        const searchLower = renterSearch.toLowerCase();
        return renters.filter((r: Renter) => {
            const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
            const nationalId = (r.nationalId || '').toLowerCase();
            return fullName.includes(searchLower) || nationalId.includes(searchLower);
        });
    }, [renters, renterSearch, formData.renterId, selectedRenterDisplay]);

    // 3. Financial Math (Total Amount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.unitId || !formData.renterId) return alert("Select a Unit and Renter");

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            await contractService.create(submitData);
            onContractCreated();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Creation failed. Check if end date is after start date.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gray-600 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-500 rounded-lg shadow-lg shadow-gray-500/20"><CreditCard size={28} /></div>
                        <div>
                            <h2 className="text-2xl font-bold">New Lease Contract</h2>
                            <p className="text-sm text-gray-400">Search and bind renter to unit</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {loadingData ? (
                        <div className="flex flex-col items-center py-12 text-gray-400 gap-4"><Loader2 className="animate-spin" size={40} /></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Unit Search */}
                                <div className="relative" ref={unitSearchRef}>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Home size={14}/> Find Unit
                                        {formData.unitId && <span className="text-green-600 text-[10px]">✓ Selected</span>}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search or browse units..."
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none font-medium"
                                            value={unitSearch}
                                            onFocus={() => setShowUnitResults(true)}
                                            onChange={(e) => setUnitSearch(e.target.value)}
                                        />
                                        {unitSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUnitSearch('');
                                                    setSelectedUnitDisplay('');
                                                    setFormData({...formData, unitId: '', rentAmount: 0});
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                    {showUnitResults && (
                                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                            {filteredUnits.length > 0 ? (
                                                <>
                                                    <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 border-b">
                                                        {filteredUnits.length} Available Unit{filteredUnits.length !== 1 ? 's' : ''}
                                                    </div>
                                                    {filteredUnits.map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                const displayText = `Unit #${u.unitNo}`;
                                                                setFormData({...formData, unitId: u.id, rentAmount: u.rentPrice});
                                                                setUnitSearch(displayText);
                                                                setSelectedUnitDisplay(displayText);
                                                                setShowUnitResults(false);
                                                            }}
                                                            className={`p-3 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${formData.unitId === u.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold">Unit #{u.unitNo}</span>
                                                                <span className="text-blue-600 font-bold">${u.rentPrice}/mo</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-400">
                                                    No units found matching "{unitSearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Renter Search */}
                                <div className="relative" ref={renterSearchRef}>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <User size={14}/> Find Renter
                                        {formData.renterId && <span className="text-green-600 text-[10px]">✓ Selected</span>}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search or browse renters..."
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none font-medium"
                                            value={renterSearch}
                                            onFocus={() => setShowRenterResults(true)}
                                            onChange={(e) => setRenterSearch(e.target.value)}
                                        />
                                        {renterSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRenterSearch('');
                                                    setSelectedRenterDisplay('');
                                                    setFormData({...formData, renterId: ''});
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                    {showRenterResults && (
                                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                            {filteredRenters.length > 0 ? (
                                                <>
                                                    <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 border-b">
                                                        {filteredRenters.length} Renter{filteredRenters.length !== 1 ? 's' : ''} Found
                                                    </div>
                                                    {filteredRenters.map(r => (
                                                        <div
                                                            key={r.id}
                                                            onClick={() => {
                                                                const displayText = `${r.firstName} ${r.lastName}`;
                                                                setFormData({...formData, renterId: r.id});
                                                                setRenterSearch(displayText);
                                                                setSelectedRenterDisplay(displayText);
                                                                setShowRenterResults(false);
                                                            }}
                                                            className={`p-3 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${formData.renterId === r.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <div className="font-bold">{`${r.firstName} ${r.lastName}`}</div>
                                                            <div className="text-xs text-gray-500 mt-1">ID: {r.nationalId}</div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-400">
                                                    No renters found matching "{renterSearch}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dates and Payment Frequency */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-gray-900" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">End Date</label>
                                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-gray-900" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Freq</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                                        value={formData.paymentFreq}
                                        onChange={(e) => setFormData({...formData, paymentFreq: Number(e.target.value)})}
                                    >
                                        <option value={1}>Monthly</option>
                                        <option value={3}>Quarterly</option>
                                        <option value={6}>Semi-Annually</option>
                                        <option value={12}>Yearly</option>
                                    </select>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="p-6 bg-gray-500 rounded-lg text-white space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 text-xl font-bold uppercase tracking-wider"> Total Amount</span>
                                    <div className="flex font-xl items-center gap-2">
                                        <span className="text-gray-400">$</span>
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-gray-700 text-right focus:border-blue-500 outline-none font-bold"
                                            value={formData.rentAmount}
                                            onChange={(e) => setFormData({...formData, rentAmount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition-colors">Discard</button>
                                <button type="submit" disabled={isSubmitting || !formData.unitId || !formData.renterId} className="flex-[2] bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} Finalize Contract
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateContractModal;