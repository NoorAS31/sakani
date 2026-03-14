import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import TenantsPage from "./features/tenants/tenantsPage.tsx";
import UnitsPage from "./features/units/unitsPage.tsx";


function App() {
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false); // This triggers the redirect to /login
    };
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!(localStorage.getItem('token')|| sessionStorage.getItem('token'));
    });

    return (
        <BrowserRouter>
            <Routes>
                {/* If logged in, redirect away from /login to /dashboard */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
                />


                {/* Protected Area: Only shows if isAuthenticated is true */}
                {isAuthenticated ? (
                    <Route path="/" element={<DashboardLayout onLogout={handleLogout} />}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="tenants" element={<TenantsPage />} />
                        <Route path="units" element={<UnitsPage />} />
                        {/* Future routes like /rentals or /maintenance go here */}
                    </Route>
                ) : (
                    // If not logged in, any path sends you to /login
                    <Route path="*" element={<Navigate to="/login" />} />
                )}

            </Routes>
        </BrowserRouter>
    );
}

export default App;