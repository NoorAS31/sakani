import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { NotificationCenter } from '../components/notifications/NotificationCenter';

const darkThemeBridgeClasses = [
    'dark:bg-slate-950',
    'dark:text-slate-100',
    'dark:[&_.bg-white]:bg-slate-800',
    'dark:[&_.bg-gray-50]:bg-slate-900/40',
    'dark:[&_.bg-gray-100]:bg-slate-700',
    'dark:[&_.bg-gray-200]:bg-slate-600',
    'dark:[&_.bg-gray-300]:bg-slate-600',
    'dark:[&_.text-gray-900]:text-slate-100',
    'dark:[&_.text-gray-800]:text-slate-100',
    'dark:[&_.text-gray-700]:text-slate-200',
    'dark:[&_.text-gray-600]:text-slate-300',
    'dark:[&_.text-gray-500]:text-slate-400',
    'dark:[&_.text-gray-400]:text-slate-500',
    'dark:[&_.border-gray-50]:border-slate-700',
    'dark:[&_.border-gray-100]:border-slate-700',
    'dark:[&_.border-gray-200]:border-slate-600',
    'dark:[&_.border-gray-300]:border-slate-600',
    'dark:[&_.bg-blue-50]:bg-blue-900/20',
    'dark:[&_.bg-blue-100]:bg-blue-900/30',
    'dark:[&_.text-blue-600]:text-blue-300',
    'dark:[&_.text-blue-700]:text-blue-200',
    'dark:[&_.border-blue-100]:border-blue-700/50',
    'dark:[&_.border-blue-200]:border-blue-700/60',
    'dark:[&_.bg-green-50]:bg-green-900/20',
    'dark:[&_.bg-green-100]:bg-green-900/30',
    'dark:[&_.text-green-600]:text-green-300',
    'dark:[&_.text-green-700]:text-green-200',
    'dark:[&_.border-green-100]:border-green-700/50',
    'dark:[&_.border-green-200]:border-green-700/60',
    'dark:[&_.bg-red-50]:bg-red-900/20',
    'dark:[&_.bg-red-100]:bg-red-900/30',
    'dark:[&_.text-red-500]:text-red-300',
    'dark:[&_.text-red-600]:text-red-300',
    'dark:[&_.text-red-700]:text-red-200',
    'dark:[&_.border-red-100]:border-red-700/50',
    'dark:[&_.border-red-200]:border-red-700/60',
    'dark:[&_.bg-amber-100]:bg-amber-900/30',
    'dark:[&_.text-amber-700]:text-amber-200',
    'dark:[&_.bg-purple-50]:bg-purple-900/20',
    'dark:[&_.text-purple-600]:text-purple-300',
    'dark:[&_.hover\\:bg-gray-50:hover]:bg-slate-700',
    'dark:[&_.hover\\:bg-gray-100:hover]:bg-slate-700',
    'dark:[&_.hover\\:bg-black:hover]:bg-slate-700',
    'dark:[&_.hover\\:text-gray-700:hover]:text-slate-100',
    'dark:[&_.hover\\:text-gray-800:hover]:text-slate-100',
    'dark:[&_input]:bg-slate-800',
    'dark:[&_input]:border-slate-600',
    'dark:[&_input]:text-slate-100',
    'dark:[&_input::placeholder]:text-slate-400',
    'dark:[&_select]:bg-slate-800',
    'dark:[&_select]:border-slate-600',
    'dark:[&_select]:text-slate-100',
    'dark:[&_textarea]:bg-slate-800',
    'dark:[&_textarea]:border-slate-600',
    'dark:[&_textarea]:text-slate-100',
    'dark:[&_textarea::placeholder]:text-slate-400',
    'dark:[&_input:disabled]:bg-slate-700',
    'dark:[&_input:disabled]:text-slate-400',
    'dark:[&_select:disabled]:bg-slate-700',
    'dark:[&_select:disabled]:text-slate-400',
    'dark:[&_textarea:disabled]:bg-slate-700',
    'dark:[&_textarea:disabled]:text-slate-400'
].join(' ');

const DashboardLayout = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <>
            <NotificationCenter />
            <div className={`flex h-screen bg-gray-50 overflow-hidden ${darkThemeBridgeClasses}`}>
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
        </>
    );
};

export default DashboardLayout;
