import { Form, Head, router, useHttp } from '@inertiajs/react';
import {
    ArrowRight,
    RefreshCw,
    AlertTriangle,
    AlertCircle,
    Key,
    Smartphone,
    ScanLine,
    Phone,
    LogOut,
    Power,
    ExternalLink,
    Wifi,
    WifiOff,
    Server,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import WahaController from '@/actions/App/Http/Controllers/Settings/WahaController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/waha';

interface ProfileDetails {
    id: string;
    phone: string;
    name: string | null;
    avatar: string | null;
}

interface Props {
    waha_session: string;
    waha_url: string;
    waha_api_key: string;
    waha_status: string;
    waha_qr_code: string | null;
    waha_profile: ProfileDetails | null;
    waha_webhook_url: string;
    webhook_url: string;
}

type WahaStatus =
    | 'WORKING'
    | 'CONNECTED'
    | 'SCAN_QR_CODE'
    | 'STOPPED'
    | 'FAILED'
    | 'UNREACHABLE'
    | 'ERROR'
    | 'NOT_CONFIGURED';

interface StatusVisual {
    label: string;
    ringColor: string;
    ringTrack: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    description: string;
}

const statusVisuals: Record<WahaStatus, StatusVisual> = {
    WORKING: {
        label: 'Terhubung & Aktif',
        ringColor: 'stroke-emerald-500',
        ringTrack: 'stroke-emerald-500/15',
        icon: Wifi,
        iconBg: 'bg-emerald-500',
        iconColor: 'text-white',
        description: 'Sesi WhatsApp berjalan normal dan siap digunakan.',
    },
    CONNECTED: {
        label: 'Terhubung & Aktif',
        ringColor: 'stroke-emerald-500',
        ringTrack: 'stroke-emerald-500/15',
        icon: Wifi,
        iconBg: 'bg-emerald-500',
        iconColor: 'text-white',
        description: 'Sesi WhatsApp berjalan normal dan siap digunakan.',
    },
    SCAN_QR_CODE: {
        label: 'Menunggu Pindai',
        ringColor: 'stroke-amber-500',
        ringTrack: 'stroke-amber-500/15',
        icon: ScanLine,
        iconBg: 'bg-amber-500',
        iconColor: 'text-white',
        description:
            'Pindai kode QR atau gunakan kode pairing untuk menghubungkan perangkat.',
    },
    STOPPED: {
        label: 'Sesi Berhenti',
        ringColor: 'stroke-zinc-400',
        ringTrack: 'stroke-zinc-400/15',
        icon: Power,
        iconBg: 'bg-zinc-400',
        iconColor: 'text-white',
        description:
            'Sesi WhatsApp tidak berjalan. Mulai ulang sesi untuk terhubung kembali.',
    },
    FAILED: {
        label: 'Gagal Terhubung',
        ringColor: 'stroke-rose-500',
        ringTrack: 'stroke-rose-500/15',
        icon: AlertCircle,
        iconBg: 'bg-rose-500',
        iconColor: 'text-white',
        description: 'Sesi gagal terhubung. Periksa server dan coba restart.',
    },
    UNREACHABLE: {
        label: 'Server Offline',
        ringColor: 'stroke-rose-500',
        ringTrack: 'stroke-rose-500/15',
        icon: WifiOff,
        iconBg: 'bg-rose-500',
        iconColor: 'text-white',
        description:
            'Server WAHA tidak dapat dijangkau. Pastikan server aktif.',
    },
    ERROR: {
        label: 'Error Koneksi',
        ringColor: 'stroke-rose-500',
        ringTrack: 'stroke-rose-500/15',
        icon: AlertTriangle,
        iconBg: 'bg-rose-500',
        iconColor: 'text-white',
        description:
            'Terjadi kesalahan koneksi. Periksa kredensial dan URL API.',
    },
    NOT_CONFIGURED: {
        label: 'Belum Dikonfigurasi',
        ringColor: 'stroke-zinc-400',
        ringTrack: 'stroke-zinc-400/10',
        icon: Server,
        iconBg: 'bg-zinc-400',
        iconColor: 'text-white',
        description: 'Masukkan URL API dan nama sesi untuk memulai.',
    },
};

function StatusRing({
    visual,
    animated,
}: {
    visual: StatusVisual;
    animated: boolean;
}) {
    const RingIcon = visual.icon;
    const radius = 44;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                className={cn(
                    'size-28 -rotate-90 drop-shadow-sm',
                    animated && 'animate-spin',
                )}
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    strokeWidth="6"
                    className={visual.ringTrack}
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                    className={cn(
                        visual.ringColor,
                        'transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    )}
                />
            </svg>
            <div
                className={cn(
                    'absolute flex size-16 items-center justify-center rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    visual.iconBg,
                )}
            >
                <RingIcon className={cn('size-7', visual.iconColor)} />
            </div>
        </div>
    );
}

function StatusIndicator({ status }: { status: string }) {
    const s =
        status === 'WORKING' || status === 'CONNECTED'
            ? 'WORKING'
            : (status as WahaStatus);
    const visual = statusVisuals[s] || statusVisuals.NOT_CONFIGURED;
    const isAnimated = status === 'SCAN_QR_CODE' || status === 'STOPPED';

    return (
        <div className="flex flex-col items-center gap-3 py-2">
            <StatusRing visual={visual} animated={isAnimated} />
            <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-foreground">
                    {visual.label}
                </p>
                <p className="max-w-[220px] text-[11px] leading-relaxed text-muted-foreground">
                    {visual.description}
                </p>
            </div>
        </div>
    );
}

export default function WahaSettings({
    waha_session,
    waha_url,
    waha_api_key,
    waha_status,
    waha_qr_code,
    waha_profile,
    waha_webhook_url,
    webhook_url,
}: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'qr' | 'pairing'>('qr');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [pairingError, setPairingError] = useState<string | null>(null);

    const pairingForm = useHttp({
        phone_number: '',
    });

    const restartForm = useHttp({});

    const handleRefreshStatus = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['waha_status', 'waha_profile', 'waha_qr_code'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleRequestPairingCode = (e: React.FormEvent) => {
        e.preventDefault();
        setPairingError(null);
        setPairingCode(null);

        pairingForm.post(WahaController.requestPairingCode.url(), {
            onSuccess: (response: any) => {
                if (response && response.code) {
                    setPairingCode(response.code);
                } else {
                    setPairingError(
                        'Gagal mendapatkan kode dari respons server.',
                    );
                }
            },
            onError: (errs: any) => {
                setPairingError(
                    errs.message ||
                        errs.phone_number ||
                        'Terjadi kesalahan sistem.',
                );
            },
        });
    };

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        setIsRefreshing(true);
        setIsLoggingOut(true);
        router.post(
            WahaController.logout.url(),
            {},
            {
                onFinish: () => {
                    setIsRefreshing(false);
                    setIsLoggingOut(false);
                    setIsLogoutModalOpen(false);
                },
            },
        );
    };

    const [isRestarting, setIsRestarting] = useState(false);

    const handleRestartSession = () => {
        setIsRestarting(true);
        restartForm.post(WahaController.restartSession.url(), {
            onSuccess: () => {
                setIsRestarting(false);
                router.reload({
                    only: ['waha_status', 'waha_profile', 'waha_qr_code'],
                });
            },
            onError: (errs: any) => {
                setIsRestarting(false);
                alert(errs.message || 'Gagal menyalakan sesi WhatsApp.');
            },
        });
    };

    useEffect(() => {
        if (
            waha_profile ||
            waha_status === 'WORKING' ||
            waha_status === 'CONNECTED' ||
            !waha_url
        ) {
            return;
        }

        const interval = setInterval(() => {
            router.reload({
                only: ['waha_status', 'waha_profile', 'waha_qr_code'],
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [waha_profile, waha_status, waha_url]);

    const isConnected =
        waha_status === 'WORKING' || waha_status === 'CONNECTED';
    const needsAuth = waha_status === 'SCAN_QR_CODE' || !!waha_qr_code;
    const isStopped = waha_status === 'STOPPED' || waha_status === 'FAILED';
    const isLoading =
        !waha_profile &&
        !needsAuth &&
        !isStopped &&
        waha_status !== 'NOT_CONFIGURED' &&
        waha_status !== 'UNREACHABLE' &&
        waha_status !== 'ERROR' &&
        !!waha_url;
    const isUnreachable =
        (waha_status === 'UNREACHABLE' || waha_status === 'ERROR') &&
        !waha_profile;

    return (
        <>
            <Head title="WAHA Connection" />

            <div className="space-y-10">
                <Heading
                    variant="small"
                    title="WAHA Connection"
                    description="Configure and manage your WhatsApp HTTP API connection"
                />

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* LEFT: Configuration Form (4/12) */}
                    <div className="space-y-6 lg:col-span-5">
                        <div className="space-y-1">
                            <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                Configuration
                            </span>
                            <div className="mt-1 h-px bg-border/40" />
                        </div>

                        <Form
                            {...WahaController.update.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="waha_session"
                                            className="text-xs font-medium"
                                        >
                                            Session Name
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="waha_session"
                                                className="h-9 rounded-[calc(0.75rem-4px)] border-0 bg-background text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={waha_session}
                                                name="waha_session"
                                                required
                                                placeholder="default"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.waha_session}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="waha_url"
                                            className="text-xs font-medium"
                                        >
                                            API URL
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="waha_url"
                                                type="url"
                                                className="h-9 rounded-[calc(0.75rem-4px)] border-0 bg-background text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={waha_url}
                                                name="waha_url"
                                                required
                                                placeholder="http://localhost:3000"
                                            />
                                        </div>
                                        <InputError message={errors.waha_url} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="waha_api_key"
                                            className="text-xs font-medium"
                                        >
                                            API Key
                                            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                                                opsional
                                            </span>
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="waha_api_key"
                                                type="password"
                                                className="h-9 rounded-[calc(0.75rem-4px)] border-0 bg-background text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={waha_api_key}
                                                name="waha_api_key"
                                                placeholder="Opsional"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.waha_api_key}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="waha_webhook_url"
                                            className="text-xs font-medium"
                                        >
                                            Webhook URL
                                            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                                                opsional
                                            </span>
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="waha_webhook_url"
                                                type="url"
                                                className="h-9 rounded-[calc(0.75rem-4px)] border-0 bg-background text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={waha_webhook_url}
                                                name="waha_webhook_url"
                                                placeholder={webhook_url}
                                            />
                                        </div>
                                        <p className="pl-0.5 text-[10px] text-muted-foreground">
                                            Biarkan kosong jika pakai URL
                                            default:{' '}
                                            <span className="font-mono text-[9px] break-all">
                                                {webhook_url}
                                            </span>
                                        </p>
                                        <InputError
                                            message={errors.waha_webhook_url}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <Button
                                            disabled={processing}
                                            className="group rounded-full px-5 py-2 text-xs font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                        >
                                            Simpan
                                            <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                                                <ArrowRight className="size-3" />
                                            </span>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        <div className="group rounded-xl border border-border/30 bg-black/[0.01] p-3 dark:bg-white/[0.01]">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                                    <ExternalLink className="size-3 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-semibold text-foreground">
                                        Apa itu WAHA?
                                    </p>
                                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                                        WhatsApp HTTP API yang memungkinkan
                                        aplikasi Anda mengirim & menerima pesan
                                        melalui REST API.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3 dark:border-amber-500/10">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
                                    <ExternalLink className="size-3 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <p className="text-[10px] font-semibold text-foreground">
                                        Webhook WAHA (Manual)
                                    </p>
                                    <p className="font-mono text-[10px] break-all text-muted-foreground select-all">
                                        {webhook_url}
                                    </p>
                                    <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-2.5 py-2">
                                        <p className="mb-1 text-[9px] font-medium text-amber-600/80 dark:text-amber-400/80">
                                            Cara konfigurasi manual:
                                        </p>
                                        <ol className="list-inside list-decimal space-y-0.5 text-[9px] text-muted-foreground">
                                            <li>
                                                Buka file konfigurasi WAHA
                                                server (
                                                <span className="font-mono text-amber-600 dark:text-amber-400">
                                                    docker-compose.yml
                                                </span>{' '}
                                                atau{' '}
                                                <span className="font-mono text-amber-600 dark:text-amber-400">
                                                    .env
                                                </span>
                                                )
                                            </li>
                                            <li>
                                                Tambah environment variable
                                                berikut:
                                            </li>
                                        </ol>
                                        <pre className="mt-1.5 rounded border border-border/40 bg-background px-2 py-1.5 font-mono text-[9px] text-foreground">
                                            {`WAHA__WEBHOOK__URLS__0=${webhook_url}
WAHA__WEBHOOK__EVENTS__0=message`}
                                        </pre>
                                        <p className="mt-1.5 text-[9px] text-muted-foreground">
                                            Restart WAHA server setelah mengubah
                                            konfigurasi.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(
                                                        WahaController.testWebhook.url(),
                                                        { method: 'POST' },
                                                    );
                                                    const data =
                                                        await res.json();
                                                    const checks =
                                                        data.checks || [];
                                                    const summary = checks
                                                        .map(
                                                            (c) =>
                                                                (c.status
                                                                    ? '✅'
                                                                    : '❌') +
                                                                ' ' +
                                                                c.name +
                                                                ': ' +
                                                                c.value,
                                                        )
                                                        .join('\n');
                                                    alert(
                                                        (data.success
                                                            ? '✅ '
                                                            : '❌ ') +
                                                            data.message +
                                                            '\n\nHTTP: ' +
                                                            data.http_status +
                                                            (data.http_reachable
                                                                ? ' (reachable)'
                                                                : ' (not reachable)') +
                                                            '\nAPP_URL: ' +
                                                            data.app_url +
                                                            '\nURL: ' +
                                                            data.webhook_url +
                                                            '\n\n— Check —\n' +
                                                            summary,
                                                    );
                                                } catch {
                                                    alert(
                                                        '❌ Gagal tes webhook.',
                                                    );
                                                }
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-600 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-500/20 active:scale-[0.97] dark:text-amber-400"
                                        >
                                            Test Webhook
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const phone = prompt(
                                                    'Masukkan nomor tujuan (contoh: 62812xxx):',
                                                );
                                                if (!phone) return;
                                                fetch(
                                                    WahaController.sendTestMessage.url(),
                                                    {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type':
                                                                'application/json',
                                                        },
                                                        body: JSON.stringify({
                                                            phone_number: phone,
                                                        }),
                                                    },
                                                )
                                                    .then((r) => r.json())
                                                    .then((data) => {
                                                        alert(
                                                            (data.success
                                                                ? '✅ '
                                                                : '❌ ') +
                                                                data.message,
                                                        );
                                                    })
                                                    .catch(() => {
                                                        alert(
                                                            '❌ Gagal mengirim pesan test.',
                                                        );
                                                    });
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/20 active:scale-[0.97]"
                                        >
                                            Kirim WA Test
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground/70">
                                        Atur custom URL di field{' '}
                                        <span className="font-medium text-foreground">
                                            Webhook URL
                                        </span>{' '}
                                        pada form di atas jika pakai
                                        tunnel/ngrok.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Status Dashboard (8/12) */}
                    <div className="space-y-6 border-t border-border/40 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:border-border/40 lg:pt-0 lg:pl-10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                Connection Status
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleRefreshStatus}
                                disabled={isRefreshing}
                                className="size-7 rounded-full border border-border/40 bg-background shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent active:scale-90"
                            >
                                <RefreshCw
                                    className={cn(
                                        'size-3 text-muted-foreground',
                                        isRefreshing &&
                                            'animate-spin text-primary',
                                    )}
                                />
                            </Button>
                        </div>

                        {/* === STATE: Connected === */}
                        {isConnected && waha_profile && (
                            <div className="animate-fade-in space-y-6">
                                <StatusIndicator status={waha_status} />

                                <div className="rounded-xl border border-border/30 bg-gradient-to-br from-emerald-500/[0.03] to-transparent p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            {waha_profile.avatar ? (
                                                <img
                                                    src={waha_profile.avatar}
                                                    alt="Avatar"
                                                    className="size-14 rounded-xl border border-border/60 object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex size-14 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-lg font-semibold text-primary">
                                                    {waha_profile.name
                                                        ? waha_profile.name
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : 'W'}
                                                </div>
                                            )}
                                            <span className="absolute -top-1 -right-1 block size-4 rounded-full border-[2.5px] border-background bg-emerald-500 shadow-sm" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h3 className="truncate text-sm font-semibold text-foreground">
                                                {waha_profile.name ||
                                                    'Akun WhatsApp'}
                                            </h3>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                +{waha_profile.phone}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-medium text-emerald-500">
                                                    Sesi Aktif
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connection Metadata */}
                                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border/20 bg-black/[0.02] p-3 dark:bg-white/[0.02]">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Session
                                            </p>
                                            <p className="truncate font-mono text-[11px] text-foreground">
                                                {waha_session}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Server
                                            </p>
                                            <p className="truncate font-mono text-[11px] text-foreground">
                                                {waha_url
                                                    ? new URL(waha_url).hostname
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="group h-auto rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                        >
                                            <LogOut className="mr-1.5 size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-0.5" />
                                            {isLoggingOut
                                                ? 'Memproses...'
                                                : 'Putuskan Koneksi'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === STATE: Needs Auth (QR / Pairing) === */}
                        {needsAuth && !waha_profile && (
                            <div className="animate-fade-in space-y-5">
                                <StatusIndicator status={waha_status} />

                                {/* Tab Selector */}
                                <div className="flex rounded-xl border border-border/20 bg-muted/65 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('qr')}
                                        className={cn(
                                            'flex flex-1 items-center justify-center gap-1.5 rounded-[calc(0.75rem-2px)] py-2 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                            activeTab === 'qr'
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <ScanLine className="size-3.5" />
                                        Pindai QR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('pairing')}
                                        className={cn(
                                            'flex flex-1 items-center justify-center gap-1.5 rounded-[calc(0.75rem-2px)] py-2 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                            activeTab === 'pairing'
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <Phone className="size-3.5" />
                                        Kode Pairing
                                    </button>
                                </div>

                                {/* QR Tab */}
                                {activeTab === 'qr' && (
                                    <div className="animate-fade-in space-y-4">
                                        {waha_qr_code ? (
                                            <div className="flex justify-center">
                                                <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm dark:bg-white">
                                                    <img
                                                        src={waha_qr_code}
                                                        alt="WhatsApp QR Code"
                                                        className="size-44 object-contain"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                                                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted/50">
                                                    <ScanLine className="size-5 text-muted-foreground/60" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Memuat QR Code...
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Smartphone className="size-3.5 text-muted-foreground" />
                                                Cara Menghubungkan
                                            </h4>
                                            <ol className="list-inside list-decimal space-y-1 pl-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                                <li>
                                                    Buka WhatsApp di ponsel
                                                    Anda.
                                                </li>
                                                <li>
                                                    Ketuk{' '}
                                                    <span className="font-medium text-foreground">
                                                        Menu
                                                    </span>{' '}
                                                    atau{' '}
                                                    <span className="font-medium text-foreground">
                                                        Pengaturan
                                                    </span>
                                                    .
                                                </li>
                                                <li>
                                                    Pilih{' '}
                                                    <span className="font-medium text-foreground">
                                                        Perangkat Tertaut
                                                    </span>
                                                    .
                                                </li>
                                                <li>Pindai kode QR di atas.</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {/* Pairing Tab */}
                                {activeTab === 'pairing' && (
                                    <div className="animate-fade-in space-y-4">
                                        <form
                                            onSubmit={handleRequestPairingCode}
                                            className="space-y-3"
                                        >
                                            <div className="grid gap-1.5">
                                                <Label
                                                    htmlFor="phone_number"
                                                    className="text-xs font-medium"
                                                >
                                                    Nomor Telepon
                                                </Label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                                        <Input
                                                            id="phone_number"
                                                            className="h-9 rounded-[calc(0.75rem-4px)] border-0 bg-background text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                            value={
                                                                pairingForm.data
                                                                    .phone_number
                                                            }
                                                            onChange={(e) =>
                                                                pairingForm.setData(
                                                                    'phone_number',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            required
                                                            placeholder="6281234567890"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            pairingForm.processing
                                                        }
                                                        className="group h-[46px] rounded-xl px-4 text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                                    >
                                                        {pairingForm.processing
                                                            ? 'Meminta...'
                                                            : 'Minta Kode'}
                                                    </Button>
                                                </div>
                                                <span className="pl-0.5 text-[10px] text-muted-foreground">
                                                    Gunakan kode negara tanpa
                                                    spasi (contoh: 62812xxxxxx)
                                                </span>
                                            </div>
                                        </form>

                                        {pairingCode && (
                                            <div className="animate-fade-in-scale space-y-3 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-transparent p-5 text-center">
                                                <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Key className="size-3 text-primary" />
                                                    Kode Pairing
                                                </p>
                                                <p className="font-mono text-3xl font-extrabold tracking-[0.15em] text-primary select-all">
                                                    {pairingCode}
                                                </p>
                                                <p className="mx-auto max-w-xs text-[11px] leading-normal text-muted-foreground">
                                                    Masukkan kode ke WhatsApp
                                                    ketika notifikasi tautkan
                                                    perangkat muncul.
                                                </p>
                                            </div>
                                        )}

                                        {pairingError && (
                                            <div className="animate-fade-in rounded-xl border border-rose-500/15 bg-rose-500/[0.04] p-3 text-[11px] leading-relaxed text-rose-500">
                                                {pairingError}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Phone className="size-3.5 text-muted-foreground" />
                                                Cara Menautkan lewat Nomor HP
                                            </h4>
                                            <ol className="list-inside list-decimal space-y-1 pl-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                                <li>
                                                    Masukkan nomor WA dan klik{' '}
                                                    <span className="font-medium text-foreground">
                                                        Minta Kode
                                                    </span>
                                                    .
                                                </li>
                                                <li>
                                                    Buka notifikasi WhatsApp di
                                                    ponsel Anda.
                                                </li>
                                                <li>
                                                    Masukkan 8 karakter kode
                                                    pairing.
                                                </li>
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === STATE: Stopped / Failed === */}
                        {isStopped && !waha_profile && (
                            <div className="animate-fade-in space-y-5">
                                <StatusIndicator status={waha_status} />
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        onClick={handleRestartSession}
                                        disabled={isRestarting}
                                        className="group rounded-full px-6 py-2 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                    >
                                        <Power className="mr-1.5 size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110" />
                                        {isRestarting
                                            ? 'Memulai...'
                                            : 'Restart Sesi'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* === STATE: Loading === */}
                        {isLoading && (
                            <div className="animate-fade-in space-y-5">
                                <StatusIndicator status={waha_status} />
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <RefreshCw className="size-3.5 animate-spin" />
                                    Memeriksa status sesi...
                                </div>
                            </div>
                        )}

                        {/* === STATE: Not Configured === */}
                        {waha_status === 'NOT_CONFIGURED' && (
                            <div className="animate-fade-in space-y-5">
                                <StatusIndicator status={waha_status} />
                                <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3">
                                    <p className="text-[11px] leading-relaxed text-amber-500/90">
                                        Pastikan server WAHA Anda aktif sebelum
                                        menyimpan pengaturan.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* === STATE: Unreachable / Error === */}
                        {isUnreachable && (
                            <div className="animate-fade-in space-y-5">
                                <StatusIndicator status={waha_status} />
                                <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.04] p-3">
                                    <p className="text-[11px] leading-relaxed text-rose-500/80">
                                        Periksa URL API dan API Key. Pastikan
                                        server WAHA berjalan dan dapat diakses.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={isLogoutModalOpen}
                onOpenChange={setIsLogoutModalOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10">
                            <LogOut className="size-5 text-rose-500" />
                        </div>
                        <DialogTitle className="text-center">
                            Putuskan Koneksi WhatsApp?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Sesi akan dikeluarkan dari server. Anda harus
                            memindai QR Code atau meminta kode pairing baru
                            untuk terhubung kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row justify-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(false)}
                            disabled={isLoggingOut}
                            className="rounded-full px-5 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmLogout}
                            disabled={isLoggingOut}
                            className="rounded-full px-5 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                        >
                            {isLoggingOut ? 'Memproses...' : 'Ya, Putuskan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

WahaSettings.layout = {
    breadcrumbs: [{ title: 'WAHA Connection', href: edit() }],
};
