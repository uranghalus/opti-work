import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Auth } from '@/types';

type Log = {
    id: number;
    worker_id: string | null;
    hod_id: number | null;
    phone_number: string | null;
    message: string | null;
    status: string;
    retry_count: number;
    created_at: string;
};

type PageProps = {
    auth: Auth;
    logs: {
        data: Log[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status?: string };
};

const statusBadge: Record<string, { label: string; class: string }> = {
    SENT: { label: 'Sent', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    PENDING: { label: 'Pending', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    FAILED: { label: 'Failed', class: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export default function NotificationLogs() {
    const { logs, filters } = usePage<PageProps>().props;
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [retrying, setRetrying] = useState<number | null>(null);

    const handleFilter = (value: string) => {
        setStatusFilter(value);
        router.get('/whatsapp/notification-logs', { status: value || undefined }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRetry = (id: number) => {
        setRetrying(id);
        router.post(`/whatsapp/notification-logs/${id}/retry`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Notification resent');
                setRetrying(null);
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] || 'Retry failed');
                setRetrying(null);
            },
            onFinish: () => setRetrying(null),
        });
    };

    return (
        <>
            <Head title="Notification Logs" />

            <Heading
                title="Notification Logs"
                description="WhatsApp notification delivery history"
            />

            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-950/80 to-slate-900/80 p-1 shadow-lg backdrop-blur-xl">
                <div className="rounded-lg bg-white/5 p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Select value={statusFilter} onValueChange={handleFilter}>
                            <SelectTrigger className="w-40 border-white/20 bg-white/5 text-white/80">
                                <SelectValue placeholder="All status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="SENT">Sent</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-white/40">{logs.total} total entries</span>
                    </div>

                    <div className="space-y-2">
                        <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                            <div>ID</div>
                            <div>Phone</div>
                            <div>Status</div>
                            <div>Retry</div>
                            <div>Date</div>
                            <div>Action</div>
                        </div>

                        {logs.data.length === 0 && (
                            <div className="text-center text-white/40 py-8">No notification logs found</div>
                        )}

                        {logs.data.map((log) => {
                            const cfg = statusBadge[log.status] ?? { label: log.status, class: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
                            return (
                                <div key={log.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-4 py-3 rounded-lg border border-white/10 bg-white/5 items-center">
                                    <div className="text-white/60 text-xs font-mono">#{log.id}</div>
                                    <div className="text-white/80 text-sm">{log.phone_number}</div>
                                    <div>
                                        <Badge variant="outline" className={`border ${cfg.class}`}>{cfg.label}</Badge>
                                    </div>
                                    <div className="text-white/50 text-sm">{log.retry_count}x</div>
                                    <div className="text-white/50 text-xs">{log.created_at}</div>
                                    <div>
                                        {log.status === 'FAILED' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRetry(log.id)}
                                                disabled={retrying === log.id}
                                                className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-xs h-7"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {logs.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <span className="text-sm text-white/40">
                                Page {logs.current_page} of {logs.last_page}
                            </span>
                            <div className="flex gap-2">
                                {logs.current_page > 1 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.get(`/whatsapp/notification-logs`, { page: logs.current_page - 1, status: statusFilter || undefined }, { preserveScroll: true })}
                                        className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                                    >
                                        Previous
                                    </Button>
                                )}
                                {logs.current_page < logs.last_page && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.get(`/whatsapp/notification-logs`, { page: logs.current_page + 1, status: statusFilter || undefined }, { preserveScroll: true })}
                                        className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
