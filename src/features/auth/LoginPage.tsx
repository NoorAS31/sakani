import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {authService} from "../../services/authService.ts";
import {tenantService} from "../../services/tenantService.ts";
import {storage} from "../../utils/storage.ts";
import { Eye, EyeOff, Moon, Sun, Lock, Mail } from "lucide-react";
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext.tsx';
import {Logo} from "../../components/brand/Logo.tsx";

const LOADING_BARRIER_MS = 1000;

const normalizeRole = (role: string | null | undefined): string => (role ?? '').trim().toLowerCase();

const isTenantRole = (role: string | null | undefined): boolean => normalizeRole(role) === 'tenant';

const isSuperAdminRole = (role: string | null | undefined): boolean => {
    const normalized = normalizeRole(role);
    return normalized === 'superadmin' || normalized === 'super admin';
};

const isTenantStatusActive = (status: string | undefined): boolean => {
    if (typeof status !== 'string') return false;
    return status.trim().toLowerCase() === 'active';
};

const formatTenantStatus = (status: string | undefined): string => {
    if (typeof status === 'string') {
        const value = status.trim();
        if (!value) return 'Unknown';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    return 'Unknown';
};

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
    usePageTitle('Login');
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState <string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCredentials(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setErrorStatus(null);

        console.log("Authenticating...", credentials.email);

        try {
            const data = await authService.login(credentials);
            authService.handleLoginSuccess(data, rememberMe);
            const authenticatedRole = data.role ?? storage.getRole();

            if (isTenantRole(authenticatedRole)) {
                const tenant = await tenantService.getMe();
                if (!isTenantStatusActive(tenant.status)) {
                    const tenantName = tenant.name || storage.getTenantName() || 'Tenant';
                    const tenantStatus = formatTenantStatus(tenant.status);
                    throw new Error(`TENANT_STATUS:${tenantName} is ${tenantStatus}`);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, LOADING_BARRIER_MS));

            console.log("Logged in successfully!");
            const homePath = isSuperAdminRole(authenticatedRole) ? '/tenants' : '/dashboard';
            navigate(homePath, { replace: true });
            onLogin();

        } catch (err) {
            const status = axios.isAxiosError(err) ? err.response?.status ?? null : null;
            setErrorStatus(status);
            if (status !== 404) {
                storage.clearLoginData();
                const message = err instanceof Error ? err.message : '';
                if (message.startsWith('TENANT_STATUS:')) {
                    setError(message.replace('TENANT_STATUS:', ''));
                } else {
                    setError("Invalid credentials. Please check your email and password.");
                }
                console.error("Login Error:", err);
            }
        } finally {
            setIsLoading(false);

        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            {/* Animated Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                <div className="absolute inset-0 opacity-30 dark:opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gray-400 dark:bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-gray-500 dark:bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-400 dark:bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>
            </div>

            <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="absolute top-6 right-6 inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-slate-800/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-white/30 dark:hover:bg-slate-700/40 transition-all duration-300 border border-white/20 dark:border-slate-700/30 z-20"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Login Card */}
            <div className="relative w-full max-w-md z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-slate-700 dark:to-slate-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 animate-fade-in">
                    
                    {/* Logo/Title */}
                    <div className="mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-full h-16 rounded-xl flex items-center justify-center ">
                                <Logo
                                    className="w-full h-full"
                                />
                            </div>
                        </div>

                        <p className="text-center text-slate-600 dark:text-slate-400 text-sm animate-slide-down animation-delay-100">
                            Property Management Solution
                        </p>
                    </div>

                    {/* Error Message */}
                    {errorStatus !== 404 && error && (
                        <div className="mb-6 animate-shake">
                            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-700 p-4 rounded-lg border-l-4 border-l-red-500">
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="relative group animate-slide-down animation-delay-200">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-gray-600 dark:group-focus-within:text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-100"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative group animate-slide-down animation-delay-300">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-gray-600 dark:group-focus-within:text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-100"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 focus:outline-none transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm animate-slide-down animation-delay-400">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-gray-600 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-gray-500 cursor-pointer accent-gray-600 transition-colors"
                                />
                                <span className="ml-2 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
                                    Remember me
                                </span>
                            </label>

                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-down animation-delay-500 hover:shadow-lg hover:shadow-gray-600/50 dark:hover:shadow-gray-700/30 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 animate-slide-down animation-delay-600">
                        <p>Secure login with encrypted connection</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    10%, 30%, 50%, 70%, 90% {
                        transform: translateX(-5px);
                    }
                    20%, 40%, 60%, 80% {
                        transform: translateX(5px);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-slide-down {
                    animation: slide-down 0.5s ease-out forwards;
                    opacity: 0;
                }
                .animation-delay-100 {
                    animation-delay: 0.1s;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                .animation-delay-600 {
                    animation-delay: 0.6s;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
