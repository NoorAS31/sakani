import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps extends ToastMessage {
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose(id), duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800',
                    icon: 'text-green-600'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    icon: 'text-red-600'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-600'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    icon: 'text-blue-600'
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className={`w-5 h-5 ${getStyles().icon}`} />;
            case 'error':
                return <AlertCircle className={`w-5 h-5 ${getStyles().icon}`} />;
            case 'warning':
                return <AlertTriangle className={`w-5 h-5 ${getStyles().icon}`} />;
            default:
                return <AlertCircle className={`w-5 h-5 ${getStyles().icon}`} />;
        }
    };

    const styles = getStyles();

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles.bg} ${styles.border} ${styles.text} animate-in slide-in-from-top-2 duration-300`}>
            {getIcon()}
            <span className="flex-1 text-sm font-medium">{message}</span>
            <button
                onClick={() => onClose(id)}
                className="text-inherit hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
