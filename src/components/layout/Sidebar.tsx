import {
    LayoutDashboard,
    Building2,
    FileText,
    Calculator,
    Wrench,
    CheckSquare,
    Settings,
    UserCircle
} from 'lucide-react';
import {NavLink} from 'react-router-dom';

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Rentals', icon: <Building2 size={20} />, path: '/rentals' },
        { name: 'Contracts', icon: <FileText size={20} />, path: '/contracts' },
        { name: 'Accounting', icon: <Calculator size={20} />, path: '/accounting' },
        { name: 'Maintenance', icon: <Wrench size={20} />, path: '/maintenance' },
        { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    ];

    const bottomItems = [
        { name: 'Settings', icon: <Settings size={20} /> },
        { name: 'Account', icon: <UserCircle size={20} /> },
    ];

    return (
        <div className="w-2/12 bg-gray-800 min-h-screen flex flex-col text-slate-300 shadow-xl">
            {/* Logo Section */}
            <div className="p-4  mb-2">
                <div className="flex items-center gap-2">
                   <div className={"w-20 h-8"}>
                       <img
                       src={"assets/Sakani.png"}
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
                {bottomItems.map((item) => (
                    <button key={item.name} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:text-white transition-colors">
                        {item.icon}
                        {item.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;