import type {UserToken} from "../../types";

export const authService = {
    setToken: (token: string) => localStorage.setItem('token', token),
    getToken: () => localStorage.getItem('token'),
    logout: () => localStorage.removeItem('token'),

    getUserData: (): UserToken | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        // You would use jwt-decode here
        return JSON.parse(atob(token.split('.')[1]));
    }
};