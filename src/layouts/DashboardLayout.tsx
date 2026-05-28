import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <main className="w-full p-4 md:p-8">
            <Outlet />
        </main>
    );
};

export default DashboardLayout;
