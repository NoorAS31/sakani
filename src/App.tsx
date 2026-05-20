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
    const isRenter = storage.isRenter();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);
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
                                            <Route index element={<Navigate to="/dashboard" />} />
                                            <Route path="dashboard" element={isRenter ? <RenterDashboard /> : <DashboardPage />} />
                                            <Route path="tenants" element={isRenter ? <Navigate to="/dashboard" /> : <TenantsPage />} />
                                            <Route path="property" element={isRenter ? <Navigate to="/dashboard" /> : <PropertiesPage />} />
                                            <Route path="units" element={isRenter ? <Navigate to="/dashboard" /> : <UnitsPage />} />
                                            <Route path="renters" element={isRenter ? <Navigate to="/dashboard" /> : <RentersPage />} />
                                            <Route path="contracts" element={isRenter ? <MyContractPage /> : <ContractsPage />} />
                                            <Route path="accounting" element={isRenter ? <Navigate to="/dashboard" /> : <AccountingPage />} />
                                            <Route path="accounting/payments" element={isRenter ? <PaymentsPageForRenter /> : <PaymentsPage />} />
                                            <Route path="expenses" element={isRenter ? <Navigate to="/dashboard" /> : <ExpensesPage />} />
                                            <Route path="maintenance" element={isRenter ? <MaintenancePage /> : <Navigate to="/dashboard" />} />
                                            <Route path="maintenance/:id" element={isRenter ? <MaintenanceTicketDetailPage canEdit={false} isRenter={true} /> : <Navigate to="/dashboard" />} />
                                            <Route path="maintenance-ticket/:id" element={isRenter ? <MaintenanceTicketDetailPage canEdit={false} isRenter={true} /> : <Navigate to="/dashboard" />} />
                                            <Route path="maintenance-tickets" element={isRenter ? <Navigate to="/dashboard" /> : <MaintenanceTicketsPage />} />
                                            <Route path="maintenance-tickets/create" element={isRenter ? <Navigate to="/dashboard" /> : <CreateMaintenanceTicketPage />} />
                                            <Route path="maintenance-tickets/:id" element={isRenter ? <Navigate to="/dashboard" /> : <MaintenanceTicketDetailPage canEdit={false} />} />
                                            <Route path="settings" element={<SettingsPage />} />
                                            <Route path="account" element={<AccountPage />} />
                                        </Route>
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
                            <Route path="*" element={<Navigate to="/login" />} />
                        </Routes>
                    )}
                </FadeRoutes>
            )}
        </BrowserRouter>
    );
}
export default App;