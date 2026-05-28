import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <main className="p-8">
            <Outlet />
        </main>
    );
};

export default DashboardLayout;
