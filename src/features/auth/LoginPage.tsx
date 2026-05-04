import React, {useState} from 'react';
import {authService} from "./authService.ts";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext.tsx';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
    usePageTitle('Login');
    const { theme, toggleTheme } = useTheme();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState <string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCredentials(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => { // Changed to FormEvent
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        console.log("Authenticating...", credentials.email);

        try {
            const data = await authService.login(credentials);

            authService.handleLoginSuccess(data, rememberMe);

            console.log("Logged in successfully!");
            onLogin();

        } catch (err) {
            setError("Invalid credentials. Please check your email and password.");
            console.error("Login Error:", err);
        } finally {
            setIsLoading(false);

        }
    };
    return (
        <div
            className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-4">
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">

                <p className="justify-center items-center mt-6 text-center text-3xl text-slate-900 dark:text-slate-100">
                   Sakani
                </p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label className="sr-only">Email address</label>
                            <input
                                name="email"
                                type="email"
                                className="rounded relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 placeholder-slate-400 text-slate-900 dark:text-slate-100 rounded-t-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1 relative">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} // Dynamic type
                                    name="password"
                                    required
                                    className="appearance-none block w-full my-3 px-3 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-600 focus:border-slate-500 sm:text-sm pr-10"
                                    placeholder="Password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                />

                                {/* The Toggle Button */}
                                <button
                                    type="button" // Important: set to button so it doesn't submit the form
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 dark:hover:text-slate-100 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-slate-700 focus:ring-slate-500 border-slate-300 dark:border-slate-600 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-slate-700 dark:text-slate-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="https://github.com/xnucy/sakani"
                               className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100" target={"_blank"}>
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${
                                isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-900'
                            }`} >

                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </button>


                </form>
            </div>
        </div>
    );
};

export default LoginPage;
