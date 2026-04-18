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

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!storage.getToken());

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
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="tenants" element={<TenantsPage />} />
                        <Route path="property" element={<PropertiesPage />} />
                        <Route path="units" element={<UnitsPage />} />
                        <Route path="renters" element={<RentersPage />} />
                        <Route path="contracts" element={<ContractsPage/>} />
                        <Route path="accounting" element={<AccountingPage />} />
                        <Route path="accounting/payments" element={<PaymentsPage />} />
                        <Route path="expenses" element={<ExpensesPage />} />
                        <Route path="tasks" element={<TasksPage />} />
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
