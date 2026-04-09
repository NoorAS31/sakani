import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - fixed at the left */}
            <Sidebar onLogout={onLogout}/>

            {/* Main Content Area */}
            <div className="flex-1 h-full overflow-y-auto">
                {/* Top Header can go here */}
                <main className="p-8">
                    {/* <Outlet /> is where DashboardPage will be injected */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
