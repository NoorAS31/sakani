import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import TenantsPage from "./features/tenants/tenantsPage.tsx";
import UnitsPage from "./features/units/unitsPage.tsx";
import PropertiesPage from "./features/properties/PropertiesPage.tsx";
import { storage } from "./utils/storage.ts";
import RentersPage from "./features/renters/RenterPage.tsx";
import ContractsPage from "./features/contracts/ContractsPage.tsx";
import AccountingPage from "./features/Accounting/AccountingPage.tsx";
import PaymentsPage from "./features/Accounting/PaymentsPage.tsx";
import PaymentsPageForRenter from "./features/Accounting/PaymentPageforRenter.tsx";
import ExpensesPage from './features/expenses/ExpensesPage.tsx';
import SettingsPage from './features/settings/SettingsPage.tsx';
import AccountPage from './features/account/AccountPage.tsx';
import RenterDashboard from './features/dashboard/RenterDashboard.tsx';
import MyContractPage from './features/contracts/MyContractPage';
import MaintenancePage from './features/tickets/renter/MaintenancePage.tsx';
import MaintenanceTicketsPage from './features/tickets/MaintenanceTicketsPage.tsx';
import CreateMaintenanceTicketPage from './features/tickets/CreateMaintenanceTicketPage.tsx';
import MaintenanceTicketDetailPage from './features/tickets/MaintenanceTicketDetailPage.tsx';
import FadeRoutes from './components/common/FadeRoutes';
import Sidebar from './components/layout/Sidebar';
import { NotificationCenter } from './components/notifications/NotificationCenter.tsx';
import { DARK_THEME_BRIDGE_CLASSES } from './utils/theme';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!storage.getToken());

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);
    };

    const getAuthenticatedHome = () => {
        const isRenter = storage.isRenter();
        const isSuperAdmin = storage.isSuperAdmin();
        
        if (isRenter) return '/dashboard';
        if (isSuperAdmin) return '/tenants';
        return '/dashboard';
    };

    const layoutKey = isAuthenticated ? `authenticated-${storage.getUserId()}` : 'guest';

    return (
        <BrowserRouter>
            {isAuthenticated && (
                <>
                    <NotificationCenter />
                    <div className={`flex h-screen bg-gray-50 overflow-hidden ${DARK_THEME_BRIDGE_CLASSES}`}>
                        <Sidebar key={layoutKey} onLogout={handleLogout} />
                        <div className="flex-1 h-full overflow-y-auto">
                            <FadeRoutes>
                                {(location) => (
                                    <Routes location={location}>
                                        <Route path="/" element={<DashboardLayout />}>
                                            <Route index element={<Navigate to={getAuthenticatedHome()} replace />} />
                                            <Route path="dashboard" element={storage.isRenter() ? <RenterDashboard /> : <DashboardPage />} />
                                            <Route path="tenants" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <TenantsPage />} />
                                            <Route path="property" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <PropertiesPage />} />
                                            <Route path="units" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <UnitsPage />} />
                                            <Route path="renters" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <RentersPage />} />
                                            <Route path="contracts" element={storage.isRenter() ? <MyContractPage /> : <ContractsPage />} />
                                            <Route path="accounting" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <AccountingPage />} />
                                            <Route path="accounting/payments" element={storage.isRenter() ? <PaymentsPageForRenter /> : <PaymentsPage />} />
                                            <Route path="expenses" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <ExpensesPage />} />
                                            <Route path="maintenance" element={storage.isRenter() ? <MaintenancePage /> : <Navigate to="/dashboard" replace />} />
                                            <Route path="maintenance/:id" element={storage.isRenter() ? <MaintenanceTicketDetailPage canEdit={false} isRenter={true} /> : <Navigate to="/dashboard" replace />} />
                                            <Route path="maintenance-ticket/:id" element={storage.isRenter() ? <MaintenanceTicketDetailPage canEdit={false} isRenter={true} /> : <Navigate to="/dashboard" replace />} />
                                            <Route path="maintenance-tickets" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <MaintenanceTicketsPage />} />
                                            <Route path="maintenance-tickets/create" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <CreateMaintenanceTicketPage />} />
                                            <Route path="maintenance-tickets/:id" element={storage.isRenter() ? <Navigate to="/dashboard" replace /> : <MaintenanceTicketDetailPage canEdit={false} />} />
                                            <Route path="settings" element={<SettingsPage />} />
                                            <Route path="account" element={<AccountPage />} />
                                        </Route>
                                        <Route path="*" element={<Navigate to={getAuthenticatedHome()} replace />} />
                                    </Routes>
                                )}
                            </FadeRoutes>
                        </div>
                    </div>
                </>
            )}
            {!isAuthenticated && (
                <FadeRoutes>
                    {(location) => (
                        <Routes location={location}>
                            <Route
                                path="/login"
                                element={<LoginPage onLogin={() => setIsAuthenticated(true)} />}
                            />
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    )}
                </FadeRoutes>
            )}
        </BrowserRouter>
    );
}
export default App;