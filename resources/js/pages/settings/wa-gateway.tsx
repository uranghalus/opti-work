import { Form, Head } from '@inertiajs/react';
import {
    Bot,
    Globe,
    Key,
    MessageCircle,
    Phone,
    RefreshCw,
    Shield,
    Webhook,
    Zap,
} from 'lucide-react';
import AppSettingsController from '@/actions/App/Http/Controllers/Settings/AppSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { waGateway as settingsWaGateway } from '@/routes/settings';

type Props = {
    settings: Record<string, string | boolean | number>;
};

const webhookEvents = [
    { value: 'messages.upsert', label: 'Messages received' },
    { value: 'messages.update', label: 'Message updates' },
    { value: 'messages.delete', label: 'Message deleted' },
    { value: 'send.message', label: 'Message sent' },
    { value: 'connection.update', label: 'Connection state' },
    { value: 'presence.update', label: 'Presence changes' },
    { value: 'groups.upsert', label: 'Group updates' },
    { value: 'contacts.upsert', label: 'Contact sync' },
];

export default function WaGateway({ settings }: Props) {
    const isEnabled = settings.enabled === true || settings.enabled === '1';
    const selectedEvents = settings.webhook_events
        ? String(settings.webhook_events).split(',')
        : [];

    return (
        <>
            <Head title="Evolution API Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Evolution API"
                    description="Configure your Evolution API WhatsApp Gateway"
                />

                <Form
                    {...AppSettingsController.updateWaGateway.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Hero */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071b7] via-[#0088cc] to-[#0093dd] p-6 shadow-lg md:p-8">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/20 blur-3xl" />
                                    <div className="absolute right-1/4 top-1/3 size-20 rounded-full bg-white/10 blur-2xl" />
                                </div>
                                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                            <Bot className="size-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                                                <Zap className="size-3" />
                                                Evolution API v2
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">WhatsApp Gateway</h3>
                                            <p className="text-sm text-white/80">
                                                Send notifications and manage WhatsApp interactions
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center gap-3">
                                        <span className="text-sm font-medium text-white/90">Gateway</span>
                                        <input
                                            type="checkbox"
                                            name="enabled"
                                            className="peer sr-only"
                                            defaultChecked={isEnabled}
                                        />
                                        <input type="hidden" name="enabled" value="0" />
                                        <div className="h-7 w-12 rounded-full bg-white/20 backdrop-blur-sm after:absolute after:start-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:bg-emerald-400 peer-checked:after:translate-x-full" />
                                        <span className={cn(
                                            'text-sm font-medium',
                                            isEnabled ? 'text-emerald-200' : 'text-white/60',
                                        )}>
                                            {isEnabled ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Server Connection */}
                                <Card className="overflow-hidden">
                                    <div className="bg-gradient-to-r from-[#0071b7] to-[#0093dd] px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Globe className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Server Connection
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Point to your Evolution API server
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="api_url" className="text-sm font-medium">
                                                Server URL
                                            </Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="api_url"
                                                    name="api_url"
                                                    type="url"
                                                    defaultValue={settings.api_url as string ?? ''}
                                                    placeholder="https://evo-api.yourcompany.com"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Base URL of your Evolution API instance (with port if needed)
                                            </p>
                                            <InputError message={errors.api_url} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="api_key" className="text-sm font-medium">
                                                Global API Key
                                            </Label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="api_key"
                                                    name="api_key"
                                                    type="password"
                                                    defaultValue={settings.api_key as string ?? ''}
                                                    placeholder="••••••••••••••••"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Your Evolution API authentication key
                                            </p>
                                            <InputError message={errors.api_key} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Instance Config */}
                                <Card className="overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Bot className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Instance Configuration
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Manage your WhatsApp instance
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="instance_name" className="text-sm font-medium">
                                                Instance Name
                                            </Label>
                                            <div className="relative">
                                                <Bot className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="instance_name"
                                                    name="instance_name"
                                                    type="text"
                                                    defaultValue={settings.instance_name as string ?? ''}
                                                    placeholder="optiwork-wa"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Name of your Evolution API instance (lowercase, no spaces)
                                            </p>
                                            <InputError message={errors.instance_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="instance_token" className="text-sm font-medium">
                                                Instance Token
                                            </Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="instance_token"
                                                    name="instance_token"
                                                    type="password"
                                                    defaultValue={settings.instance_token as string ?? ''}
                                                    placeholder="••••••••••••••••"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Instance-specific API token (leave blank to use Global API Key)
                                            </p>
                                            <InputError message={errors.instance_token} />
                                        </div>

                                        <Separator />

                                        <div className="grid gap-2">
                                            <Label htmlFor="sender_number" className="text-sm font-medium">
                                                Sender Phone Number
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="sender_number"
                                                    name="sender_number"
                                                    type="text"
                                                    defaultValue={settings.sender_number as string ?? ''}
                                                    placeholder="6281234567890"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Connected WhatsApp number (country code, no + or spaces)
                                            </p>
                                            <InputError message={errors.sender_number} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Webhook */}
                                <Card className="overflow-hidden">
                                    <div className="bg-gradient-to-r from-violet-500 to-purple-400 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Webhook className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Webhook Configuration
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Receive real-time events from Evolution API
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="webhook_url" className="text-sm font-medium">
                                                Webhook URL
                                            </Label>
                                            <div className="relative">
                                                <Webhook className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="webhook_url"
                                                    name="webhook_url"
                                                    type="url"
                                                    defaultValue={settings.webhook_url as string ?? ''}
                                                    placeholder="https://optiwork.test/api/wa-webhook"
                                                    className="pl-9 font-mono text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Endpoint where Evolution sends events
                                            </p>
                                            <InputError message={errors.webhook_url} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-sm font-medium">
                                                Webhook Events
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {webhookEvents.map((event) => (
                                                    <label
                                                        key={event.value}
                                                        className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm hover:bg-accent/50"
                                                    >
                                                        <Checkbox
                                                            name="webhook_events"
                                                            value={event.value}
                                                            defaultChecked={selectedEvents.includes(event.value)}
                                                        />
                                                        {event.label}
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Events to listen for
                                            </p>

                                            <InputError message={errors.webhook_events} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Retry & Behavior */}
                                <Card className="overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                <RefreshCw className="size-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-white">
                                                    Retry & Behavior
                                                </CardTitle>
                                                <CardDescription className="text-xs text-white/70">
                                                    Control delivery behaviour
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="max_retries" className="text-sm font-medium">
                                                Max Retries
                                            </Label>
                                            <Select
                                                name="max_retries"
                                                defaultValue={String(settings.max_retries ?? '3')}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select retry count" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[0, 1, 2, 3, 5].map((n) => (
                                                        <SelectItem key={n} value={String(n)}>
                                                            {n === 0 ? 'No retries' : `${n} retries`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Number of retry attempts on send failure
                                            </p>
                                            <InputError message={errors.max_retries} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="app_name" className="text-sm font-medium">
                                                App Name (visible in messages)
                                            </Label>
                                            <Input
                                                id="app_name"
                                                name="app_name"
                                                type="text"
                                                defaultValue={settings.app_name as string ?? 'Optiwork'}
                                                placeholder="Optiwork"
                                                className="font-mono text-sm"
                                            />
                                            <InputError message={errors.app_name} />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Autostart Instance
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Auto-start instance on server boot
                                                </p>
                                            </div>
                                            <input type="hidden" name="autostart_instance" value="0" />
                                            <Checkbox
                                                name="autostart_instance"
                                                defaultChecked={settings.autostart_instance === true || settings.autostart_instance === '1'}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Mark as Read
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Auto-mark incoming messages as read
                                                </p>
                                            </div>
                                            <input type="hidden" name="mark_read" value="0" />
                                            <Checkbox
                                                name="mark_read"
                                                defaultChecked={settings.mark_read === true || settings.mark_read === '1'}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Mobile toggle */}
                            <div className="flex items-center justify-between rounded-2xl border bg-card p-5 shadow-sm lg:hidden">
                                <div>
                                    <p className="text-sm font-medium">Gateway Status</p>
                                    <p className="text-xs text-muted-foreground">Enable or disable the gateway</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        name="enabled"
                                        className="peer sr-only"
                                        defaultChecked={isEnabled}
                                    />
                                    <input type="hidden" name="enabled" value="0" />
                                    <div className="h-7 w-12 rounded-full bg-neutral-200 after:absolute after:start-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:bg-[#0071b7] peer-checked:after:translate-x-full dark:bg-neutral-700" />
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} size="lg">
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
            title: 'Evolution API Settings',
            href: settingsWaGateway(),
        },
    ],
};
