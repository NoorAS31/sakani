import {startTransition, useEffect, useState} from 'react';
import type {ReactNode} from 'react'
import { useLocation } from 'react-router-dom';

type RouteLocation = ReturnType<typeof useLocation>;

type FadeRoutesProps = {
    children: (location: RouteLocation) => ReactNode;
    durationMs?: number;
    className?: string;
};

const FadeRoutes = ({ children, durationMs = 150, className = '' }: FadeRoutesProps) => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            startTransition(() => {
                setTransitionStage('fadeOut');
            });
        }
    }, [location.pathname, displayLocation.pathname]);

    useEffect(() => {
        if (transitionStage !== 'fadeOut') return;

        const timeout = setTimeout(() => {
            setDisplayLocation(location);
            setTransitionStage('fadeIn');
        }, durationMs);

        return () => clearTimeout(timeout);
    }, [transitionStage, durationMs, location]);

    return (
        <div
            className={`transition-opacity ease-in-out ${
                transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
            } ${className}`.trim()}
            style={{ transitionDuration: `${durationMs}ms` }}
        >
            {children(displayLocation)}
        </div>
    );
};

export default FadeRoutes;
