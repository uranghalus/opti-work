import { Form, Head } from '@inertiajs/react';
import {
    Barcode,
    CheckCircle2,
    Cpu,
    Globe,
    MessageSquare,
    Phone,
    Plug,
    Power,
    RefreshCw,
    RotateCcw,
    Server,
    Settings2,
    Smartphone,
    Webhook,
    Wifi,
    WifiOff,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import WaGatewayController from '@/actions/App/Http/Controllers/Settings/WaGatewayController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { waGateway as settingsWaGateway } from '@/routes/settings';

type Props = {
    settings: Record<string, string | boolean | number | string[]>;
};

type ConnectionState = {
    state: string;
    status?: string;
};

const webhookEventOptions = [
    { value: 'messages.upsert', label: 'Messages Upsert' },
    { value: 'messages.update', label: 'Messages Update' },
    { value: 'messages.delete', label: 'Messages Delete' },
    { value: 'presences.update', label: 'Presence Update' },
    { value: 'contacts.upsert', label: 'Contacts Upsert' },
    { value: 'chats.upsert', label: 'Chats Upsert' },
    { value: 'chats.update', label: 'Chats Update' },
    { value: 'chats.delete', label: 'Chats Delete' },
    { value: 'connection.update', label: 'Connection Update' },
];

function postJson(url: string) {
    return fetch(url, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } });
}

export default function WaGateway({ settings }: Props) {
    const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState({ state: false, qr: false, test: false });
    const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

    useEffect(() => {
        if (settings.enabled) {
            fetchConnectionState();
        }
    }, [settings.enabled]);

    function showToast(type: string, message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    }

    async function fetchConnectionState() {
        setLoading((prev) => ({ ...prev, state: true }));

        try {
            const response = await postJson(WaGatewayController.connectionState.url());
            const data = await response.json();

            if (data.success) {
                setConnectionState(data.data);
            }
        } catch {
            setConnectionState(null);
        } finally {
            setLoading((prev) => ({ ...prev, state: false }));
        }
    }

    async function handleGetQrCode() {
        setLoading((prev) => ({ ...prev, qr: true }));
        setQrCode(null);

        try {
            const response = await postJson(WaGatewayController.getQrCode.url());
            const data = await response.json();

            if (data.success) {
                setQrCode(data.data?.qrcode || data.data?.base64 || null);
            }
        } catch {
            showToast('error', 'Failed to generate QR Code');
        } finally {
            setLoading((prev) => ({ ...prev, qr: false }));
        }
    }

    async function handleTestConnection() {
        setLoading((prev) => ({ ...prev, test: true }));

        try {
            const response = await postJson(WaGatewayController.testConnection.url());
            const data = await response.json();

            if (data.success) {
                showToast('success', data.message);
                fetchConnectionState();
            }
        } catch {
            showToast('error', 'Connection test failed');
        } finally {
            setLoading((prev) => ({ ...prev, test: false }));
        }
    }

    const isConnected = connectionState?.state === 'open';
    const isConnecting = connectionState?.state === 'connecting';

    function getStatusBadge() {
        if (loading.state) {
            return <Badge variant="secondary"><Skeleton className="h-3 w-16" /></Badge>;
        }

        if (isConnected) {
            return <Badge variant="default" className="gap-1.5 bg-emerald-600 hover:bg-emerald-600"><CheckCircle2 className="size-3" /> Connected</Badge>;
        }

        if (isConnecting) {
            return <Badge variant="secondary" className="gap-1.5 bg-amber-500 text-white hover:bg-amber-500"><RefreshCw className="size-3 animate-spin" /> Connecting</Badge>;
        }

        return <Badge variant="destructive" className="gap-1.5"><XCircle className="size-3" /> Disconnected</Badge>;
    }

    return (
        <>
            <Head title="WhatsApp Gateway" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="WhatsApp Gateway"
                    description="Configure your Evolution API WhatsApp integration"
                />

                {toast && (
                    <div
                        className={cn(
                            'rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm',
                            toast.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
                        )}
                    >
                        {toast.message}
                    </div>
                )}

                <Form
                    action={WaGatewayController.update.url()}
                    method="post"
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-6 shadow-lg md:p-8">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/20 blur-3xl" />
                                </div>
                                <div className="relative flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                            <MessageSquare className="size-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Evolution API</h3>
                                            <p className="text-sm text-white/80">
                                                Manage your WhatsApp gateway connection and configuration
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge()}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Server className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Server Configuration
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Evolution API server connection details
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="api_url" className="text-sm font-medium">API URL</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="api_url"
                                                    name="api_url"
                                                    type="url"
                                                    placeholder="https://evolution-api.example.com"
                                                    defaultValue={String(settings.api_url ?? '')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            {errors?.api_url && <p className="text-xs text-red-500">{errors.api_url}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="api_key" className="text-sm font-medium">Global API Key</Label>
                                            <div className="relative">
                                                <Cpu className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="global_api_key"
                                                    name="global_api_key"
                                                    type="password"
                                                    placeholder="••••••••••••••••"
                                                    defaultValue={String(settings.global_api_key ?? '')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            {errors?.global_api_key && <p className="text-xs text-red-500">{errors.global_api_key}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900">
                                    <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Smartphone className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Instance Configuration
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    WhatsApp instance name and authentication
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="instance_name" className="text-sm font-medium">Instance Name</Label>
                                            <div className="relative">
                                                <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="instance_name"
                                                    name="instance_name"
                                                    type="text"
                                                    placeholder="optiwork-wa"
                                                    defaultValue={String(settings.instance_name ?? 'optiwork-wa')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            {errors?.instance_name && <p className="text-xs text-red-500">{errors.instance_name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="instance_token" className="text-sm font-medium">Instance Token</Label>
                                            <div className="relative">
                                                <Cpu className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="instance_token"
                                                    name="instance_token"
                                                    type="password"
                                                    placeholder="••••••••••••••••"
                                                    defaultValue={String(settings.instance_token ?? '')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            {errors?.instance_token && <p className="text-xs text-red-500">{errors.instance_token}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sender_number" className="text-sm font-medium">Sender Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="sender_number"
                                                    name="sender_number"
                                                    type="text"
                                                    placeholder="6281234567890"
                                                    defaultValue={String(settings.sender_number ?? '')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Number must include country code without + sign</p>
                                            {errors?.sender_number && <p className="text-xs text-red-500">{errors.sender_number}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Webhook className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Webhook Configuration
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Incoming event webhook settings
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="webhook_url" className="text-sm font-medium">Webhook URL</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="webhook_url"
                                                    name="webhook_url"
                                                    type="url"
                                                    placeholder="https://your-app.com/api/wa-webhook"
                                                    defaultValue={String(settings.webhook_url ?? '')}
                                                    className="pl-9"
                                                />
                                            </div>
                                            {errors?.webhook_url && <p className="text-xs text-red-500">{errors.webhook_url}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-medium">Webhook Events</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {webhookEventOptions.map((event) => (
                                                    <label
                                                        key={event.value}
                                                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                                                    >
                                                        <input type="hidden" name={`webhook_events[${event.value}]`} value="0" />
                                                        <Checkbox
                                                            name={`webhook_events[${event.value}]`}
                                                            value={event.value}
                                                            defaultChecked={Array.isArray(settings.webhook_events) && settings.webhook_events.includes(event.value)}
                                                        />
                                                        {event.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900">
                                    <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Settings2 className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Advanced Settings
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Additional configuration options
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="app_name" className="text-sm font-medium">App Name</Label>
                                            <Input
                                                id="app_name"
                                                name="app_name"
                                                type="text"
                                                placeholder="Optiwork"
                                                defaultValue={String(settings.app_name ?? 'Optiwork')}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="max_retries" className="text-sm font-medium">Max Retries</Label>
                                            <Select name="max_retries" defaultValue={String(settings.max_retries ?? '3')}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select max retries" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[0, 1, 2, 3, 4, 5].map((n) => (
                                                        <SelectItem key={n} value={String(n)}>
                                                            {n} {n === 0 ? '(No retries)' : n === 1 ? 'retry' : 'retries'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Separator />
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <Plug className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <Label className="text-sm font-medium">Auto-start Instance</Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Automatically start instance on server boot
                                                        </p>
                                                    </div>
                                                </div>
                                                <input type="hidden" name="autostart_instance" value="0" />
                                                <Checkbox
                                                    name="autostart_instance"
                                                    defaultChecked={settings.autostart_instance === true || settings.autostart_instance === '1'}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <Label className="text-sm font-medium">Mark as Read</Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Automatically mark incoming messages as read
                                                        </p>
                                                    </div>
                                                </div>
                                                <input type="hidden" name="mark_read" value="0" />
                                                <Checkbox
                                                    name="mark_read"
                                                    defaultChecked={settings.mark_read === true || settings.mark_read === '1'}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <Power className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <Label className="text-sm font-medium">Enable Gateway</Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Activate WhatsApp gateway functionality
                                                        </p>
                                                    </div>
                                                </div>
                                                <input type="hidden" name="enabled" value="0" />
                                                <Checkbox
                                                    name="enabled"
                                                    defaultChecked={settings.enabled === true || settings.enabled === '1'}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Wifi className="size-4" />
                                        Connection Status
                                    </CardTitle>
                                    <CardDescription>
                                        Monitor your WhatsApp instance connection and manage QR code pairing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleTestConnection}
                                            disabled={loading.test}
                                        >
                                            <Wifi className={cn('mr-1.5 size-3.5', loading.test && 'animate-spin')} />
                                            {loading.test ? 'Testing...' : 'Test Connection'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGetQrCode}
                                            disabled={loading.qr}
                                        >
                                            <RefreshCw className={cn('mr-1.5 size-3.5', loading.qr && 'animate-spin')} />
                                            {loading.qr ? 'Generating...' : 'Get QR Code'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={fetchConnectionState}
                                            disabled={loading.state}
                                        >
                                            <RotateCcw className={cn('mr-1.5 size-3.5', loading.state && 'animate-spin')} />
                                            Refresh State
                                        </Button>
                                    </div>

                                    {connectionState && (
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center gap-3">
                                                {isConnected ? (
                                                    <Wifi className="size-6 text-emerald-500" />
                                                ) : isConnecting ? (
                                                    <RefreshCw className="size-6 animate-spin text-amber-500" />
                                                ) : (
                                                    <WifiOff className="size-6 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Instance: <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{String(settings.instance_name || 'N/A')}</code>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        State: {connectionState.state || 'unknown'}
                                                        {connectionState.status && ` — ${connectionState.status}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {qrCode && (
                                        <div className="rounded-lg border bg-muted/30 p-6">
                                            <div className="flex flex-col items-center gap-4">
                                                <p className="text-sm font-medium">Scan this QR Code with WhatsApp</p>
                                                <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white p-4">
                                                    <img
                                                        src={qrCode}
                                                        alt="WhatsApp QR Code"
                                                        className="size-48 object-contain"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} size="lg" className="gap-2">
                                    <Settings2 className="size-4" />
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WaGateway.layout = {
    breadcrumbs: [
        {
            title: 'WhatsApp Gateway',
            href: settingsWaGateway(),
        },
    ],
};
