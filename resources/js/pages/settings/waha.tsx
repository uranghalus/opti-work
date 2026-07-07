import { Form, Head, router, useHttp } from '@inertiajs/react';
import { ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import WahaController from '@/actions/App/Http/Controllers/Settings/WahaController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/waha';
import { cn } from '@/lib/utils';

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
}

export default function WahaSettings({
    waha_session,
    waha_url,
    waha_api_key,
    waha_status,
    waha_qr_code,
    waha_profile
}: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'qr' | 'pairing'>('qr');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [pairingError, setPairingError] = useState<string | null>(null);

    // Setup useHttp hook for ajax requesting pairing code
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
                    setPairingError('Gagal mendapatkan kode dari respons server.');
                }
            },
            onError: (errs: any) => {
                setPairingError(errs.message || errs.phone_number || 'Terjadi kesalahan sistem.');
            }
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
        router.post(WahaController.logout.url(), {}, {
            onFinish: () => {
                setIsRefreshing(false);
                setIsLoggingOut(false);
                setIsLogoutModalOpen(false);
            }
        });
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
            }
        });
    };

    // Polling status WAHA 3 detik sekali jika belum terhubung
    useEffect(() => {
        if (waha_profile || waha_status === 'WORKING' || waha_status === 'CONNECTED' || !waha_url) {
            return;
        }

        const interval = setInterval(() => {
            router.reload({
                only: ['waha_status', 'waha_profile', 'waha_qr_code'],
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [waha_profile, waha_status, waha_url]);

    // Helper untuk menentukan badge status WAHA
    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'WORKING':
            case 'CONNECTED':
                return {
                    label: 'Terhubung & Aktif',
                    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10',
                    icon: CheckCircle2,
                };
            case 'SCAN_QR_CODE':
                return {
                    label: 'Perlu Pindai QR Code',
                    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/5 dark:border-amber-500/10',
                    icon: AlertTriangle,
                };
            case 'STOPPED':
                return {
                    label: 'Sesi Berhenti',
                    color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20 dark:bg-zinc-500/5 dark:border-zinc-500/10',
                    icon: AlertCircle,
                };
            case 'UNREACHABLE':
                return {
                    label: 'Server Tidak Terjangkau (Offline)',
                    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/5 dark:border-rose-500/10',
                    icon: AlertCircle,
                };
            case 'ERROR':
                return {
                    label: 'Error Koneksi / Kredensial Salah',
                    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/5 dark:border-rose-500/10',
                    icon: AlertCircle,
                };
            case 'NOT_CONFIGURED':
            default:
                return {
                    label: 'Belum Dikonfigurasi',
                    color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20 dark:bg-zinc-500/5 dark:border-zinc-500/10',
                    icon: HelpCircle,
                };
        }
    };

    const statusDetails = getStatusDetails(waha_status);
    const StatusIcon = statusDetails.icon;

    return (
        <>
            <Head title="WAHA Connection settings" />

            <div className="space-y-10">
                <div className="animate-fade-in rounded-2xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        
                        <Heading
                            variant="small"
                            title="WAHA Connection"
                            description="Configure settings to connect with WAHA (WhatsApp HTTP API)"
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                            
                            {/* Kiri: Form Konfigurasi (lg:col-span-7) */}
                            <div className="lg:col-span-7">
                                <Form
                                    {...WahaController.update.form()}
                                    options={{ preserveScroll: true }}
                                    className="space-y-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="waha_session" className="text-sm font-medium">
                                                    Session Name
                                                </Label>
                                                <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                                    <Input
                                                        id="waha_session"
                                                        className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                        defaultValue={waha_session}
                                                        name="waha_session"
                                                        required
                                                        placeholder="e.g. default"
                                                    />
                                                </div>
                                                <InputError message={errors.waha_session} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="waha_url" className="text-sm font-medium">
                                                    API URL
                                                </Label>
                                                <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                                    <Input
                                                        id="waha_url"
                                                        type="url"
                                                        className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                        defaultValue={waha_url}
                                                        name="waha_url"
                                                        required
                                                        placeholder="e.g. http://localhost:3000"
                                                    />
                                                </div>
                                                <InputError message={errors.waha_url} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="waha_api_key" className="text-sm font-medium">
                                                    API Key
                                                </Label>
                                                <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                                    <Input
                                                        id="waha_api_key"
                                                        type="password"
                                                        className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                        defaultValue={waha_api_key}
                                                        name="waha_api_key"
                                                        placeholder="Optional API Key"
                                                    />
                                                </div>
                                                <InputError message={errors.waha_api_key} />
                                            </div>

                                            <div className="flex items-center gap-4 pt-2">
                                                <Button
                                                    disabled={processing}
                                                    className="group rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                                >
                                                    Save Settings
                                                    <span className="ml-2.5 flex size-6 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                                                        <ArrowRight className="size-3.5" />
                                                    </span>
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>

                            {/* Kanan: Panel Status, QR Code, atau Profil (lg:col-span-5) */}
                            <div className="lg:col-span-5 lg:border-l lg:border-border/40 lg:pl-8 border-t border-border/40 pt-6 lg:border-t-0 lg:pt-0 space-y-6">
                                
                                {/* Status Header & Refresh */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Status Koneksi
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-300",
                                            statusDetails.color
                                        )}>
                                            <StatusIcon className="size-3" />
                                            <span>{statusDetails.label}</span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleRefreshStatus}
                                            disabled={isRefreshing}
                                            className="size-7 rounded-full border border-border/40 bg-background shadow-sm hover:bg-accent active:scale-95"
                                        >
                                            <RefreshCw className={cn("size-3 text-muted-foreground", isRefreshing && "animate-spin text-primary")} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Otentikasi Perangkat (QR / Pairing Code) - Hanya tampil jika butuh link */}
                                {(waha_qr_code || waha_status === 'SCAN_QR_CODE') && !waha_profile && (
                                    <div className="space-y-4">
                                        
                                        {/* Tabs Selector */}
                                        <div className="flex rounded-lg bg-muted/65 p-0.5 border border-border/20">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('qr')}
                                                className={cn(
                                                    "flex-1 rounded-md py-1.5 text-xs font-semibold transition-all duration-300",
                                                    activeTab === 'qr'
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Pindai QR Code
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('pairing')}
                                                className={cn(
                                                    "flex-1 rounded-md py-1.5 text-xs font-semibold transition-all duration-300",
                                                    activeTab === 'pairing'
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Kode Pairing (No. HP)
                                            </button>
                                        </div>

                                        {/* Konten Tab 1: Pindai QR Code */}
                                        {activeTab === 'qr' && (
                                            <div className="space-y-4 animate-fade-in">
                                                {waha_qr_code ? (
                                                    <div className="flex justify-center">
                                                        <div className="rounded-xl border border-border bg-white p-3 shadow-sm dark:bg-white">
                                                            <img
                                                                src={waha_qr_code}
                                                                alt="WhatsApp QR Code"
                                                                className="size-44 object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                                                        <HelpCircle className="size-8 text-muted-foreground/60 mb-2" />
                                                        Memuat QR Code...
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-semibold text-foreground">
                                                        Hubungkan dengan WhatsApp
                                                    </h4>
                                                    <ol className="list-decimal list-inside text-[11px] text-muted-foreground space-y-1 pl-0.5 leading-relaxed">
                                                        <li>Buka WhatsApp di ponsel Anda.</li>
                                                        <li>Ketuk <span className="font-medium text-foreground">Menu</span> atau <span className="font-medium text-foreground">Pengaturan</span>.</li>
                                                        <li>Pilih <span className="font-medium text-foreground">Perangkat Tertaut</span>.</li>
                                                        <li>Pindai kode QR di atas.</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* Konten Tab 2: Kode Pairing */}
                                        {activeTab === 'pairing' && (
                                            <div className="space-y-4 animate-fade-in">
                                                
                                                <form onSubmit={handleRequestPairingCode} className="space-y-3">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="phone_number" className="text-xs font-medium">
                                                            Nomor Telepon WhatsApp
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                                                <Input
                                                                    id="phone_number"
                                                                    className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] h-9 text-xs"
                                                                    value={pairingForm.data.phone_number}
                                                                    onChange={e => pairingForm.setData('phone_number', e.target.value)}
                                                                    required
                                                                    placeholder="e.g. 6281234567890"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="submit"
                                                                disabled={pairingForm.processing}
                                                                className="rounded-xl px-4 text-xs font-medium h-[46px]"
                                                            >
                                                                {pairingForm.processing ? 'Meminta...' : 'Minta Kode'}
                                                            </Button>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground pl-0.5">
                                                            * Masukkan nomor dengan kode negara tanpa spasi (misal: 62812xxx)
                                                        </span>
                                                    </div>
                                                </form>

                                                {/* Hasil Kode Pairing */}
                                                {pairingCode && (
                                                    <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-xl text-center animate-fade-in">
                                                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                                            <Key className="size-3 text-primary" />
                                                            Kode Pairing WhatsApp Anda
                                                        </span>
                                                        <div className="text-3xl font-extrabold tracking-widest text-primary font-mono select-all select-none">
                                                            {pairingCode}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground leading-normal">
                                                            Masukkan kode di atas ke aplikasi WhatsApp di ponsel Anda ketika notifikasi tautkan perangkat muncul.
                                                        </p>
                                                    </div>
                                                )}

                                                {pairingError && (
                                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[11px] leading-relaxed">
                                                        {pairingError}
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-semibold text-foreground">
                                                        Cara Menautkan lewat Nomor HP
                                                    </h4>
                                                    <ol className="list-decimal list-inside text-[11px] text-muted-foreground space-y-1 pl-0.5 leading-relaxed">
                                                        <li>Masukkan nomor WA dan klik <span className="font-medium text-foreground">Minta Kode</span>.</li>
                                                        <li>Buka notifikasi WhatsApp di ponsel Anda (atau masuk ke Perangkat Tertaut &gt; Tautkan dengan Nomor Telepon).</li>
                                                        <li>Masukkan 8 karakter kode pairing yang tertera di atas.</li>
                                                    </ol>
                                                </div>

                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* Profil WhatsApp Aktif (WORKING / CONNECTED) */}
                                {waha_profile && (
                                    <div className="animate-fade-in rounded-xl border border-border/40 bg-black/[0.01] p-4 dark:bg-white/[0.01] space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                {waha_profile.avatar ? (
                                                    <img
                                                        src={waha_profile.avatar}
                                                        alt="Profile Avatar"
                                                        className="size-14 rounded-full border border-border/80 object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="size-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                                                        {waha_profile.name ? waha_profile.name.charAt(0).toUpperCase() : 'W'}
                                                    </div>
                                                )}
                                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                                            </div>
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <h4 className="text-sm font-semibold text-foreground truncate">
                                                    {waha_profile.name || "Akun WhatsApp"}
                                                </h4>
                                                <p className="text-xs text-muted-foreground font-mono truncate">
                                                    +{waha_profile.phone}
                                                </p>
                                                <p className="text-[10px] text-emerald-500 font-medium">
                                                    Sesi WhatsApp Aktif
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/40 pt-3 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="text-xs font-semibold rounded-lg px-3 py-1.5 h-auto bg-rose-500 hover:bg-rose-600 text-white"
                                            >
                                                {isLoggingOut ? 'Memproses Keluar...' : 'Putuskan Koneksi (Logout)'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Sesi Berhenti atau Gagal Terhubung */}
                                {(waha_status === 'FAILED' || waha_status === 'STOPPED') && !waha_profile && (
                                    <div className="animate-fade-in rounded-xl border border-border/40 bg-black/[0.01] p-5 dark:bg-white/[0.01] space-y-4 text-center">
                                        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20">
                                            <AlertCircle className="size-5 text-rose-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-semibold text-foreground">
                                                {waha_status === 'FAILED' ? 'Koneksi Sesi Gagal' : 'Sesi WhatsApp Berhenti'}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground leading-normal max-w-xs mx-auto">
                                                Sesi WAHA Anda sedang tidak berjalan atau gagal terhubung. Silakan restart sesi untuk memicu ulang pemindaian QR Code atau pengisian Pairing Code.
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Button
                                                type="button"
                                                onClick={handleRestartSession}
                                                disabled={isRestarting}
                                                className="text-xs font-semibold rounded-lg px-4 py-2 bg-primary hover:bg-primary/95 text-white"
                                            >
                                                {isRestarting ? 'Menghidupkan Sesi...' : 'Restart Sesi'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Panduan/Informasi jika Belum Dikonfigurasi / Gangguan */}
                                {!waha_profile && !waha_qr_code && waha_status !== 'SCAN_QR_CODE' && waha_status !== 'FAILED' && waha_status !== 'STOPPED' && (
                                    <div className="rounded-xl border border-border/40 bg-black/[0.01] p-4 dark:bg-white/[0.01] text-xs text-muted-foreground leading-relaxed">
                                        <p>
                                            Masukkan alamat API URL dan nama Session di formulir sebelah kiri untuk menyambungkan aplikasi dengan WhatsApp HTTP API (WAHA).
                                        </p>
                                        <p className="mt-2 text-[11px] text-amber-500/90">
                                            * Pastikan server WAHA Anda aktif dan dapat diakses.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Logout */}
            <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Putuskan Koneksi WhatsApp?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan mengeluarkan sesi WhatsApp Anda dari server WAHA. Anda harus memindai ulang QR Code atau meminta kode pairing baru untuk terhubung kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(false)}
                            disabled={isLoggingOut}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmLogout}
                            disabled={isLoggingOut}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {isLoggingOut ? 'Memproses Keluar...' : 'Ya, Putuskan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

WahaSettings.layout = {
    breadcrumbs: [
        { title: 'WAHA Connection settings', href: edit() },
    ],
};
