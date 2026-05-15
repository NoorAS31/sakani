import React, { createContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import type { ToastMessage, ToastType } from '../components/common/Toast';

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newToast: ToastMessage = { id, message, type, duration };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};