import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type Notification = {
    id: number;
    type: string;
    data: {
        title: string;
        message: string;
        url?: string;
        work_order_id?: number;
        no_work_order?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/notifications');
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: number) => {
        try {
            await fetch(`/notifications/${id}/read`, { method: 'POST' });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await fetch('/notifications/read-all', { method: 'POST' });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    }, []);

    // Listen for real-time notifications via Reverb
    useEffect(() => {
        let echo: any;

        const initEcho = async () => {
            try {
                const mod = await import('@/echo');
                echo = mod.default;

                // Get employee ID from page props
                const pageProps = (window as any).__INERTIA_PAGE_PROPS__;
                const employeeId = pageProps?.auth?.user?.employee?.id_employee;

                if (!employeeId) return;

                echo
                    .private(`notifications.${employeeId}`)
                    .listen('.NotificationCreated', (e: any) => {
                        setNotifications((prev) => [e, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                    });
            } catch {
                // Echo not available
            }
        };

        initEcho();

        return () => {
            if (echo) {
                try {
                    echo.leaveAllChannels();
                } catch {
                    // ignore
                }
            }
        };
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    };
}
