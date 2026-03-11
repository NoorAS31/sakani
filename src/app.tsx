import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Check if a token exists on load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

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
                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<DashboardPage />} />
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