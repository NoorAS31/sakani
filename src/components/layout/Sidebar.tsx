import {
    LayoutDashboard,
    Building2,
    Sun,
    Moon,
    Calculator,
    CheckSquare,
    Settings,
    UserCircle,
    LogOut,
    Users,
    MapPin,
    FileChartColumn,
    ReceiptText,
    Wrench,
    FileText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { storage } from "../../utils/storage.ts";
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
    const { theme, toggleTheme } = useTheme();
    const isRenter = storage.isRenter();

    const menuItems = isRenter
        ? [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'My Contract', icon: <FileText size={20} />, path: '/contracts' },
            { name: 'Payments', icon: <ReceiptText size={20} />, path: '/accounting/payments' },
            { name: 'Maintenance', icon: <Wrench size={20} />, path: '/maintenance' }
        ]
        : [
            ...(storage.isSuperAdmin()
                ? [{ name: 'Tenants', icon: <Users size={20} />, path: '/tenants' }]
                : []),
            ...(storage.isTenant()
                ? [
                    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                    { name: 'Property', icon: <Building2 size={20} />, path: '/property' },
                    { name: 'Units', icon: <MapPin size={20} />, path: '/units' },
                    { name: 'Renter', icon: <UserCircle size={20} />, path: '/renters' },
                    { name: 'Contracts', icon: <FileChartColumn size={20} />, path: '/contracts' },
                    { name: 'Accounting', icon: <Calculator size={20} />, path: '/accounting' },
                    { name: 'Expenses', icon: <ReceiptText size={20} />, path: '/expenses' },
                    { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
                    { name: 'Maintenance', icon: <Wrench size={20} />, path: '/maintenance-tickets' },
                ]
                : []),
        ];

    return (
        <div className="w-2/12 bg-gray-800 h-screen flex-shrink-0 sticky top-0 flex flex-col text-slate-300 shadow-xl">
            {/* Logo Section */}
            <div className="p-4 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-20 h-8">
                        <img
                            src="assets/Sakani.png"
                            alt="Sakani"
                        />
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all
                            ${isActive
                            ? 'bg-slate-700/50 text-white border-l-4 border-gray-400'
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                        `}
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="px-3 pb-6 space-y-1 border-t border-slate-700 pt-4">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2 text-sm rounded-md transition-all hover:bg-slate-800 text-slate-300"
                >
                    <span className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        Theme
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700/50 text-slate-200 uppercase">
                        {theme}
                    </span>
                </button>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all
                        ${isActive
                        ? 'bg-slate-700/50 text-white border-l-4 border-gray-400'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                    `}
                >
                    <Settings size={20} />
                    Settings
                </NavLink>
                <NavLink
                    to="/account"
                    className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all
                        ${isActive
                        ? 'bg-slate-700/50 text-white border-l-4 border-gray-400'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                    `}
                >
                    <UserCircle size={20} />
                    Account
                </NavLink>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors mt-2"
                >
                    <LogOut size={20} />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;