import React, {useState} from 'react';
import {authService} from "./authService.ts";

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState <string | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCredentials(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await authService.login(credentials);
            authService.handleLoginSuccess(data);
            console.log("logged in successfully!");
        onLogin();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }catch (err) {
            setError("Invalid credentials");
        } finally {
            setIsLoading(false);
        }  console.log("Authenticating...", credentials);

        setTimeout(() => {
            setIsLoading(false);
            // This is where the redirect to dashboard happens later
        }, 2000);
    };
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-800 px-4  ">

            <div className="max-w-md  w-full space-y-8 bg-gray-200 p-10 rounded-xl shadow-lg border border-gray-100">

                <a className="justify-center items-center mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Rent Manager
                </a>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to manage your properties
                </p>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label className="sr-only">Email address</label>
                            <input
                                name="email"
                                type="email"

                                className="rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <input
                                name="password"
                                type="password"

                                className="rounded mt-3 relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-white focus:border-gray-600 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="https://github.com/xnucy/sakani"
                               className="font-medium text-gray-600 hover:text-gray-500" target={"_blank"}>
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center bg-gradient-to-br from-gray-500 to-gray-400 hover:bg-black py-3 px-4 text-sm font-medium rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
    ${isLoading} ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} >

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


                    <div className="text-center text-sm">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <a href="#" className="font-medium text-gray-600 hover:text-gray-500">
                                Create new user
                            </a>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;