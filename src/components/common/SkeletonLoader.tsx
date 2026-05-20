import React from 'react';

interface SkeletonLoaderProps {
    count?: number;
    height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3, height = 'h-20' }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse`}
                />
            ))}
        </div>
    );
};

export default SkeletonLoader;
