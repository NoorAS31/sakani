import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

type ConsoleErrorEntry = {
    id: string;
    message: string;
};

const formatConsoleValue = (value: unknown): string => {
    if (value instanceof Error) return value.message || value.name;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return String(value);
};

const formatConsoleArgs = (args: unknown[]): string => args.map(formatConsoleValue).join(' ');

export const ConsoleErrorBanner = () => {
    const [errors, setErrors] = useState<ConsoleErrorEntry[]>([]);
    const nextIdRef = useRef(0);

    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args: unknown[]) => {
            originalConsoleError(...args);
            const message = formatConsoleArgs(args).trim();
            if (!message) return;
            const id = `${Date.now()}-${nextIdRef.current++}`;
            setErrors((prev) => [...prev, { id, message }]);
        };

        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    const removeError = (id: string) => {
        setErrors((prev) => prev.filter((error) => error.id !== id));
    };

    const clearAllErrors = () => {
        setErrors([]);
    };

    if (errors.length === 0) return null;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4">
            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-700 p-4 rounded-lg border-l-4 border-l-red-500">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Errors</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">
                            {errors.map((error) => (
                                <li key={error.id} className="break-words flex items-start justify-between gap-2">
                                    <span className="flex-1">{error.message}</span>
                                    <button
                                        onClick={() => removeError(error.id)}
                                        className="flex-shrink-0 p-0.5 hover:bg-red-200 dark:hover:bg-red-700 rounded transition-colors"
                                        aria-label="Remove error"
                                    >
                                        <X size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button
                        onClick={clearAllErrors}
                        className="flex-shrink-0 p-1 hover:bg-red-200 dark:hover:bg-red-700 rounded transition-colors"
                        aria-label="Close errors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
