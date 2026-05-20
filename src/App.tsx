import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import TenantsPage from "./features/tenants/tenantsPage.tsx";
import UnitsPage from "./features/units/unitsPage.tsx";
import PropertiesPage from "./features/properties/PropertiesPage.tsx";
import {storage} from "./utils/storage.ts";
import TasksPage from './features/tasks/TasksPage';
import RentersPage from "./features/renters/RenterPage.tsx";
import ContractsPage from "./features/contracts/ContractsPage.tsx";
import AccountingPage from "./features/Accounting/AccountingPage.tsx";
import PaymentsPage from "./features/Accounting/PaymentsPage.tsx";
import ExpensesPage from './features/expenses/ExpensesPage.tsx';
import SettingsPage from './features/settings/SettingsPage.tsx';
import AccountPage from './features/account/AccountPage.tsx';
import RenterDashboard from './features/maintenance/RenterDashboard';
import TicketDetailsPage from './features/maintenance/TicketDetailsPage';
import MyContractPage from './features/contracts/MyContractPage';
import MaintenancePage from './features/maintenance/MaintenancePage';
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!storage.getToken());
    const isRenter = storage.isRenter();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);
    };

    // Use a unique key that changes when authentication status changes.
    // This forces the entire DashboardLayout (and Sidebar) to unmount/remount
    // ensuring they read the FRESH localStorage data.
    const layoutKey = isAuthenticated ? `authenticated-${storage.getUserId()}` : 'guest';

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
                />

                {isAuthenticated ? (
                    <Route path="/" element={<DashboardLayout key={layoutKey} onLogout={handleLogout} />}>
                        <Route index element={<Navigate to="/dashboard" />} />

                        {/* لوحة التحكم */}
                        <Route path="dashboard" element={isRenter ? <RenterDashboard /> : <DashboardPage />} />

                        {/* مسارات المالك (Tenant) - محمية الآن من المستأجر */}
                        <Route path="tenants" element={isRenter ? <Navigate to="/dashboard" /> : <TenantsPage />} />
                        <Route path="property" element={isRenter ? <Navigate to="/dashboard" /> : <PropertiesPage />} />
                        <Route path="units" element={isRenter ? <Navigate to="/dashboard" /> : <UnitsPage />} />
                        <Route path="renters" element={isRenter ? <Navigate to="/dashboard" /> : <RentersPage />} />

                        {/* العقود - مقسمة حسب الصلاحية */}
                        <Route path="contracts" element={isRenter ? <MyContractPage /> : <ContractsPage />} />

                        {/* الحسابات والمصاريف والمهام - محمية من المستأجر باستثناء صفحة الدفعات المخصصة له */}
                        <Route path="accounting" element={isRenter ? <Navigate to="/dashboard" /> : <AccountingPage />} />
                        <Route path="accounting/payments" element={<PaymentsPage />} /> {/* مشتركة أو مخصصة حسب البرمجة */}
                        <Route path="expenses" element={isRenter ? <Navigate to="/dashboard" /> : <ExpensesPage />} />
                        <Route path="tasks" element={isRenter ? <Navigate to="/dashboard" /> : <TasksPage />} />

                        {/* الصيانة للمستأجر */}
                        <Route path="maintenance" element={isRenter ? <MaintenancePage /> : <Navigate to="/dashboard" />} />
                        <Route path="maintenance/:id" element={isRenter ? <TicketDetailsPage /> : <Navigate to="/dashboard" />} />

                        {/* الإعدادات والحساب الشخصي - متاحة للجميع */}
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="account" element={<AccountPage />} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}
export default App;
