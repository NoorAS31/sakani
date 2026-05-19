import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCheck, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';
import { NotificationType, NotificationTypeLabel } from '../../types/notification';
import { notificationService } from '../../services/notificationService';

type FilterType = 'all' | 'unread' | 'read';

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
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const unreadOnly = filter === 'unread' ? true : filter === 'read' ? false : undefined;
      const data = await notificationService.getNotifications(unreadOnly ?? false);
      const filtered = unreadOnly !== undefined 
        ? data 
        : filter === 'unread' 
          ? data.filter(n => !n.isRead) 
          : filter === 'read' 
            ? data.filter(n => n.isRead) 
            : data;
      setNotifications(filtered);
      const unread = data.filter((n) => !n.isRead).length;
      onUnreadCountChange(unread);
    } catch (err : unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const handleFilterChange = async (newFilter: FilterType) => {
    setFilter(newFilter);
    setShowFilterMenu(false);
    setIsLoading(true);
    try {
      const unreadOnly = newFilter === 'unread' ? true : newFilter === 'read' ? false : false;
      const data = await notificationService.getNotifications(newFilter === 'all' ? false : unreadOnly);
      const filtered = newFilter === 'unread' 
        ? data.filter(n => !n.isRead) 
        : newFilter === 'read' 
          ? data.filter(n => n.isRead) 
          : data;
      setNotifications(filtered);
      const unread = data.filter((n) => !n.isRead).length;
      onUnreadCountChange(unread);
    } catch (err :unknown){
      console.error(err);
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
      } catch (err : unknown) {
        console.error(err);
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
    } catch (err : unknown) {
      console.error(err);
    }
  };

  const getNavigationPath = (notification: Notification): string => {
    const encodedReferenceId = encodeURIComponent(notification.referenceId);

    switch (notification.type) {
      case NotificationType.PaymentOverdue:
        return `/accounting/payments?contractId=${encodedReferenceId}`;
      case NotificationType.MaintenanceEscalation:
        return notification.referenceId
          ? `/maintenance-tickets/${encodedReferenceId}`
          : '/maintenance-tickets';
      case NotificationType.ContractRenewalReminder:
      case NotificationType.ContractOverstayAlert:
        return `/contracts?contractId=${encodedReferenceId}`;
      default:
        return '/dashboard';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await handleMarkAsRead(notification.id, notification.isRead);
    navigate(getNavigationPath(notification));
    onClose();
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
      case NotificationType.PaymentOverdue:
        return '💳';
      case NotificationType.MaintenanceEscalation:
        return '🔧';
      case NotificationType.ContractRenewalReminder:
        return '📋';
      case NotificationType.ContractOverstayAlert:
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (type: number): string => {
    // Red dot for high priority (PaymentOverdue, MaintenanceEscalation)
    if (type === NotificationType.PaymentOverdue || type === NotificationType.MaintenanceEscalation) {
      return 'bg-red-500';
    }
    // Yellow dot for medium priority (others)
    return 'bg-yellow-500';
  };

  const getNotificationLabel = (type: number): string => {
    return NotificationTypeLabel[type as keyof typeof NotificationTypeLabel] || 'Notification';
  };

  return (
    <>
      {/* Click-away area */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <div
        className={`fixed bottom-24 right-8 z-50 flex h-[721px] w-[407px] max-h-[calc(100vh-6rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-out dark:border-slate-700 dark:bg-slate-800 ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{
          transformOrigin: 'bottom right',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-900">
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
          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                </span>
                <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-slate-600">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    All Notifications
                  </button>
                  <button
                    onClick={() => handleFilterChange('unread')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors border-t border-gray-200 dark:border-slate-600 ${
                      filter === 'unread'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Unread Only
                  </button>
                  <button
                    onClick={() => handleFilterChange('read')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors border-t border-gray-200 dark:border-slate-600 ${
                      filter === 'read'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Read Only
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="min-h-0 flex-1 overflow-y-auto">
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
                  onClick={() => {
                    void handleNotificationClick(notification);
                  }}
                  className={`p-4 transition-colors ${
                    notification.isRead
                      ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      : 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  } cursor-pointer`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {notification.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {getNotificationLabel(notification.type)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getPriorityColor(notification.type)}`} />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id, notification.isRead);
                            }}
                            title={notification.isRead ? 'Already read' : 'Mark as read'}
                            className={`p-1.5 rounded transition-colors ${
                              notification.isRead
                                ? 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                                : 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                            }`}
                          >
                            <Check size={30} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
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
