import DashboardCard from '../../components/dashboard/DashboardCard';
import {storage} from "../../utils/storage.ts";

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Message */}
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Welcome {storage.getTenantName()}</h1>
            </header>

            {/* 3 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Outstanding Balances (Leasing Logic) */}
                <DashboardCard title="Outstanding Balances - Rentals" footerLink="View all">
                    <div className="mb-4">
                        <span className="text-3xl font-bold">empty$$</span>
                        <span className="ml-2 text-gray-500 text-sm italic">Outstanding balances</span>
                    </div>
                    <ul className="space-y-3">
                        {['Garden Row - $350.00', '100 Main Ave - $275.00', '150 East End - $175.00'].map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 hover:underline cursor-pointer truncate border-b border-gray-50 pb-1">
                                {item}
                            </li>
                        ))}
                    </ul>
                </DashboardCard>

                {/* Card 2: Unit Status */}
                <DashboardCard title="Unit Status" footerLink="View all">
                    <div className="flex items-center justify-around h-32">
                        {/* Simple visual representation of your 'unit' table stats */}
                        <div className="relative w-24 h-24 rounded-full border-[12px] border-gray-100 flex items-center justify-center">
                            <div className="text-center">
                                <span className="block text-xl font-bold">23</span>
                                <span className="text-[10px] text-gray-400 uppercase">Total</span>
                            </div>
                        </div>
                        <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span> Vacant
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-400"></span> Listed
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>  Occupied
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                {/* Card 3: Maintenance Tickets (Using your string status types) */}
                <DashboardCard title="Tasks" footerLink="View all">
                    <div className="flex gap-4 border-b border-gray-100 mb-4 text-xs font-bold uppercase pb-2">
                        <span className="text-gray-600 border-b-2 border-gray-600 pb-2 cursor-pointer">Incoming requests</span>
                        <span className="text-gray-400 cursor-pointer">Assigned to me</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-graye-600">Hole in Bedroom Screen</p>
                            <p className="text-[11px] text-gray-400">1 day ago | Resident request | Status: PENDING</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Leaky faucet in kitchen</p>
                            <p className="text-[11px] text-gray-400">3 days ago | Status: IN_PROGRESS</p>
                        </div>
                    </div>
                </DashboardCard>

            </div>
        </div>
    );
};

export default DashboardPage;