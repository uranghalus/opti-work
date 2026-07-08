import { Link } from '@inertiajs/react';
import { Bell, Check, CheckCheck, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'baru saja';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' menit lalu';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' jam lalu';
    return Math.floor(seconds / 86400) + ' hari lalu';
}

export function NotificationBell() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 cursor-pointer text-muted-foreground hover:text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-bold text-primary-foreground animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/50 p-0 shadow-lg">
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                        >
                            <CheckCheck className="size-3" />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="mb-2 size-8 opacity-50" />
                            <p className="text-sm">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    'flex cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-accent/50',
                                    !notification.read_at && 'bg-primary/5'
                                )}
                                onClick={() => {
                                    if (!notification.read_at) {
                                        markAsRead(notification.id);
                                    }
                                    if (notification.data.url) {
                                        router.visit(notification.data.url);
                                    }
                                    setOpen(false);
                                }}
                            >
                                <div className={cn(
                                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                                    notification.type.includes('created') ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                )}>
                                    {notification.type.includes('created') ? (
                                        <FileText className="size-4" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {notification.data.title}
                                        </p>
                                        {!notification.read_at && (
                                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                        {notification.data.message}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                                        {timeAgo(notification.created_at)}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="border-t border-border/50 px-4 py-2">
                        <Link
                            href="/notifications"
                            className="block text-center text-xs font-medium text-primary hover:text-primary/80"
                            onClick={() => setOpen(false)}
                        >
                            Lihat semua notifikasi
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
