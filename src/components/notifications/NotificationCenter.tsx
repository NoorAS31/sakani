import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { notificationService } from '../../services/notificationService';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const notifications = await notificationService.getNotifications(true);
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleUpdateUnreadCount = (count: number) => {
    setUnreadCount(count);
  };

  return (
    <>
      {/* Floating Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30 group"
      >
        <div className="relative">
          <Bell size={24} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </button>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={handleUpdateUnreadCount}
      />
    </>
  );
};
