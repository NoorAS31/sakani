import {
    LayoutDashboard,
    Building2,
    Sun,
    Moon,
    Calculator,
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
import {Logo} from '../brand/Logo';

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
                    { name: 'Maintenance', icon: <Wrench size={20} />, path: '/maintenance-tickets' },
                ]
                : []),
        ];

    const isDark = theme === 'dark';

    return (
        <div className={`w-2/12 h-screen flex-shrink-0 sticky top-0 flex flex-col shadow-xl transition-colors ${
            isDark ? 'bg-gray-800 text-slate-300' : 'bg-white text-slate-700'
        }`}>
            {/* Logo Section */}
            <div className="p-4 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-1/2 h-12">
                        <Logo
                            className="w-full h-full"
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
                            w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all border
                            ${isActive
                            ? isDark
                                ? 'bg-slate-700/50 text-white border-gray-400'
                                : 'bg-black text-white border-black'
                            : isDark
                                ? 'hover:bg-slate-800 hover:text-white text-slate-400 border-slate-700'
                                : 'hover:bg-gray-50 text-black border-gray-300 bg-white'}
                        `}
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className={`px-3 pb-6 space-y-1 transition-colors ${
                isDark ? 'border-t border-slate-700' : 'border-t border-gray-200'
            } pt-4`}>
                <button
                    type="button"
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm rounded-md transition-all border ${
                        isDark
                        ? 'hover:bg-slate-800 text-slate-300 border-slate-700'
                        : 'hover:bg-gray-50 text-black border-gray-300 bg-white'
                    }`}
                >
                    <span className="flex items-center gap-3">
                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                        Theme
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase transition-colors ${
                        isDark
                        ? 'bg-slate-700/50 text-slate-200'
                        : 'bg-black text-white'
                    }`}>
                        {theme}
                    </span>
                </button>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all border
                        ${isActive
                        ? isDark
                            ? 'bg-slate-700/50 text-white border-gray-400'
                            : 'bg-black text-white border-black'
                        : isDark
                            ? 'hover:bg-slate-800 hover:text-white text-slate-400 border-slate-700'
                            : 'hover:bg-gray-50 text-black border-gray-300 bg-white'}
                    `}
                >
                    <Settings size={20} />
                    Settings
                </NavLink>
                <NavLink
                    to="/account"
                    className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all border
                        ${isActive
                        ? isDark
                            ? 'bg-slate-700/50 text-white border-gray-400'
                            : 'bg-black text-white border-black'
                        : isDark
                            ? 'hover:bg-slate-800 hover:text-white text-slate-400 border-slate-700'
                            : 'hover:bg-gray-50 text-black border-gray-300 bg-white'}
                    `}
                >
                    <UserCircle size={20} />
                    Account
                </NavLink>
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors mt-2 ${
                        isDark
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                >
                    <LogOut size={20} />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;