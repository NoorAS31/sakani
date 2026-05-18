import React, { useState, useEffect } from 'react';
import { X, CheckCheck } from 'lucide-react';
import type { Notification } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../hooks/useToast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications(false);
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead).length;
      onUnreadCountChange(unread);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        onUnreadCountChange(unreadCount - 1);
      } catch (error) {
        showToast('Failed to mark notification as read', 'error');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      onUnreadCountChange(0);
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 0:
        return '📘';
      case 1:
        return '⚠️';
      case 2:
        return '❌';
      case 3:
        return '📋';
      case 4:
        return '🔧';
      case 5:
        return '💳';
      default:
        return '📢';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{
          transformOrigin: 'top right',
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between bg-gray-50 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-gray-200 dark:border-slate-600 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    handleMarkAsRead(
                      notification.id,
                      notification.isRead
                    )
                  }
                  className={`p-4 cursor-pointer transition-colors ${
                    notification.isRead
                      ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      : 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};
