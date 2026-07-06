import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useWhatsappEcho } from '@/hooks/use-whatsapp-echo';
import { qr as qrRoute, logout as logoutRoute, restart as restartRoute } from '@/routes/whatsapp/sessions';
import type { Auth } from '@/types';
import { LogOut, RefreshCw, QrCode, Smartphone } from 'lucide-react';

type Session = {
    name: string;
    status: string;
    phone_number: string | null;
    qr_code: string | null;
};

type PageProps = {
    auth: Auth;
    sessions: Session[];
};

const statusConfig: Record<string, { label: string; class: string }> = {
    WORKING: { label: 'Connected', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    SCAN_QR_CODE: { label: 'Scan QR', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    STARTING: { label: 'Starting', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    STOPPED: { label: 'Stopped', class: 'bg-red-500/20 text-red-300 border-red-500/30' },
    FAILED: { label: 'Failed', class: 'bg-red-500/20 text-red-300 border-red-500/30' },
    DISCONNECTED: { label: 'Disconnected', class: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

function SessionCard({
    session,
    onConnect,
    onLogout,
    onRestart,
}: {
    session: Session;
    onConnect: () => void;
    onLogout: () => void;
    onRestart: () => void;
}) {
    const cfg = statusConfig[session.status] ?? { label: session.status, class: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    const isWorking = session.status === 'WORKING';
    const isIdle = session.status === 'STOPPED' || session.status === 'DISCONNECTED' || session.status === 'FAILED';

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-950/70 to-slate-900/70 p-1 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-500/10 hover:border-indigo-400/30">
            <div className="rounded-lg bg-white/5 p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-white/90">{session.name}</h3>
                        {session.phone_number && (
                            <p className="text-sm text-white/50 mt-0.5">{session.phone_number}</p>
                        )}
                    </div>
                    <Badge variant="outline" className={`border ${cfg.class}`}>{cfg.label}</Badge>
                </div>

                {!isWorking && !isIdle && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-amber-400/70">
                        <Spinner className="h-3 w-3" />
                        <span>Session is starting...</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                    {isWorking && (
                        <Button size="sm" variant="outline" onClick={onRestart}
                            className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10">
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Restart
                        </Button>
                    )}
                    {isWorking && (
                        <Button size="sm" variant="outline" onClick={onLogout}
                            className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20">
                            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
                        </Button>
                    )}
                    {isIdle && (
                        <Button size="sm" variant="outline" onClick={onConnect}
                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
                            <QrCode className="mr-1.5 h-3.5 w-3.5" /> Connect
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function QrModal({
    session,
    open,
    onClose,
}: {
    session: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const [qr, setQr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('SCAN_QR_CODE');
    const [error, setError] = useState<string | null>(null);

    const fetchQr = useCallback(async () => {
        if (!session) return;
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(qrRoute.url(session), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
                setLoading(false);
                return;
            }

            setQr(data.qr);

            const statusRes = await fetch(qrRoute.url(session), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            const statusData = await statusRes.json();
            setQr(statusData.qr);
        } catch {
            setError('Failed to fetch QR code');
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (!open || !session) return;

        fetchQr();

        const interval = setInterval(async () => {
            try {
                const res = await fetch(qrRoute.url(session), {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': (window as any).csrfToken },
                });
                const data = await res.json();

                if (data.qr && data.qr !== qr) {
                    setQr(data.qr);
                }
                setStatus('SCAN_QR_CODE');
            } catch {
                // keep going
            }
        }, 20000);

        return () => clearInterval(interval);
    }, [open, session, fetchQr, qr]);

    const handleClose = () => {
        onClose();
        setQr(null);
        setLoading(false);
        setError(null);
        router.reload({ only: ['sessions'] });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="border-white/20 bg-slate-900/95 backdrop-blur-2xl text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white/90">Scan QR Code</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Scan this QR with WhatsApp on your phone to connect session <strong>{session}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    {loading && <Spinner className="h-8 w-8 text-white/50" />}

                    {error && (
                        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}

                    {qr && !loading && (
                        <img
                            src={`data:image/png;base64,${qr}`}
                            alt="QR Code"
                            className="rounded-lg border border-white/20 bg-white p-2 w-64 h-64"
                        />
                    )}

                    {status === 'SCAN_QR_CODE' && !loading && qr && (
                        <p className="text-xs text-amber-400/70 flex items-center gap-1">
                            <Spinner className="h-3 w-3" />
                            QR auto-refreshes every 20s. Scan to connect.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    loading,
}: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
            <DialogContent className="border-white/20 bg-slate-900/95 backdrop-blur-2xl text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white/90">{title}</DialogTitle>
                    <DialogDescription className="text-white/50">{description}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onCancel}
                        className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}
                        className="bg-red-500/80 hover:bg-red-500 text-white">
                        {loading && <Spinner className="mr-2 h-4 w-4" />}
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard() {
    const { sessions } = usePage<PageProps>().props;

    const [qrSession, setQrSession] = useState<string | null>(null);
    const [qrOpen, setQrOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'logout' | 'restart'; session: string } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useWhatsappEcho(sessions.map((s) => s.name));

    const postAction = (url: string) => {
        setActionLoading(true);
        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Action completed');
                setConfirmAction(null);
                setActionLoading(false);
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] || 'Action failed');
                setActionLoading(false);
            },
            onFinish: () => setActionLoading(false),
        });
    };

    const hasSessions = sessions.length > 0;

    return (
        <>
            <Head title="WhatsApp Gateway" />

            <Heading
                title="WhatsApp Gateway"
                description="Manage your WhatsApp sessions"
            />

            {!hasSessions && (
                <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-950/80 to-slate-900/80 p-1 shadow-lg backdrop-blur-xl">
                    <div className="rounded-lg bg-white/5 p-8 text-center">
                        <Smartphone className="mx-auto h-12 w-12 text-white/20 mb-3" />
                        <p className="text-white/60">No WhatsApp sessions configured.</p>
                        <p className="text-sm text-white/40 mt-1">
                            Configure your WAHA API connection in Settings &gt; WhatsApp Gateway first, then sessions will appear here.
                        </p>
                    </div>
                </div>
            )}

            {hasSessions && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <SessionCard
                            key={session.name}
                            session={session}
                            onConnect={() => {
                                setQrSession(session.name);
                                setQrOpen(true);
                            }}
                            onLogout={() => setConfirmAction({ type: 'logout', session: session.name })}
                            onRestart={() => setConfirmAction({ type: 'restart', session: session.name })}
                        />
                    ))}
                </div>
            )}

            <QrModal
                session={qrSession}
                open={qrOpen}
                onClose={() => {
                    setQrOpen(false);
                    setQrSession(null);
                }}
            />

            <ConfirmDialog
                open={confirmAction !== null}
                title={confirmAction?.type === 'logout' ? 'Logout Session' : 'Restart Session'}
                description={
                    confirmAction?.type === 'logout'
                        ? `This will disconnect WhatsApp for session "${confirmAction?.session}". Your phone will be disconnected. Continue?`
                        : `This will restart session "${confirmAction?.session}". The session will be temporarily unavailable. Continue?`
                }
                onConfirm={() => {
                    if (!confirmAction) return;
                    const url = confirmAction.type === 'logout'
                        ? logoutRoute.url(confirmAction.session)
                        : restartRoute.url(confirmAction.session);
                    postAction(url);
                }}
                onCancel={() => setConfirmAction(null)}
                loading={actionLoading}
            />
        </>
    );
}
