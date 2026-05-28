import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized (< md breakpoint = < 768px)
 */
export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
};
