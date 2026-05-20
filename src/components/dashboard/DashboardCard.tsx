import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    footerLink?: string;
}

const DashboardCard = ({ title, children, footerLink }: CardProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-5 flex-1">
                <h3 className="text-gray-700 font-bold text-sm mb-4 uppercase tracking-wider">{title}</h3>
                {children}
            </div>
            {footerLink && (
                <div className="px-5 py-3 border-t border-gray-50 text-right">
                    <button className="text-gray-600 text-xs font-semibold hover:underline">
                        {footerLink}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardCard;