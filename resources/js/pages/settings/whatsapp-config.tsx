import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store, testConnection as testConnectionRoute } from '@/routes/whatsapp/config';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    config: {
        id: number;
        base_url: string;
        default_session: string | null;
        webhook_url: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    } | null;
    hasApiKey: boolean;
    hasWebhookSecret: boolean;
};

export default function WhatsappConfig() {
    const { auth, config, hasApiKey, hasWebhookSecret } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        base_url: config?.base_url ?? '',
        api_key: '',
        default_session: config?.default_session ?? '',
        webhook_url: config?.webhook_url ?? '',
        webhook_secret: '',
        is_active: config?.is_active ?? true,
    });

    const [showApiKey, setShowApiKey] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Configuration saved');
                reset('api_key', 'webhook_secret');
            },
            onError: () => toast.error('Failed to save configuration'),
        });
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch(testConnectionRoute.url(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
            });
            const result = await res.json();
            setTestResult(result);
            if (result.success) {
                toast.success('Connection successful');
            } else {
                toast.error(result.error || 'Connection failed');
            }
        } catch {
            setTestResult({ success: false, error: 'Network error' });
            toast.error('Network error');
        } finally {
            setTesting(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Failed to copy');
        }
    };

    const webhookUrl = config?.webhook_url
        ? config.webhook_url
        : `${window.location.origin}/webhook/waha`;

    return (
        <>
            <Head title="WhatsApp Gateway Configuration" />

            <Heading
                variant="small"
                title="WhatsApp Gateway"
                description="Configure WAHA API connection settings"
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-indigo-950/80 to-slate-900/80 p-1 shadow-lg backdrop-blur-xl">
                    <div className="rounded-lg bg-white/5 p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-white/90">WAHA API Connection</CardTitle>
                            <CardDescription className="text-white/60">
                                Enter your WAHA (WhatsApp HTTP API) server details
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 px-0">
                            {testResult && (
                                <div className={`rounded-lg border px-4 py-3 text-sm ${testResult.success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                                    {testResult.success
                                        ? 'Connection successful! WAHA API is reachable.'
                                        : `Connection failed: ${testResult.error}`}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="base_url" className="text-white/80">Base URL</Label>
                                <Input
                                    id="base_url"
                                    value={data.base_url}
                                    onChange={(e) => setData('base_url', e.target.value)}
                                    placeholder="http://waha-server:3000"
                                    className="border-white/20 bg-white/5 text-white/90 placeholder:text-white/30"
                                />
                                {errors.base_url && <p className="text-sm text-red-400">{errors.base_url}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key" className="text-white/80">API Key</Label>
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type={showApiKey ? 'text' : 'password'}
                                        value={data.api_key}
                                        onChange={(e) => setData('api_key', e.target.value)}
                                        placeholder={hasApiKey ? '(unchanged)' : 'Enter API key'}
                                        className="border-white/20 bg-white/5 text-white/90 placeholder:text-white/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                                    >
                                        {showApiKey ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.api_key && <p className="text-sm text-red-400">{errors.api_key}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="default_session" className="text-white/80">Default Session Name</Label>
                                <Input
                                    id="default_session"
                                    value={data.default_session}
                                    onChange={(e) => setData('default_session', e.target.value)}
                                    placeholder="default"
                                    className="border-white/20 bg-white/5 text-white/90 placeholder:text-white/30"
                                />
                                {errors.default_session && <p className="text-sm text-red-400">{errors.default_session}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="webhook_url" className="text-white/80">Webhook URL</Label>
                                <div className="relative">
                                    <Input
                                        id="webhook_url"
                                        value={webhookUrl}
                                        readOnly
                                        className="border-white/20 bg-white/5 text-white/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(webhookUrl)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-xs"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="webhook_secret" className="text-white/80">Webhook Secret</Label>
                                <div className="relative">
                                    <Input
                                        id="webhook_secret"
                                        type={showSecret ? 'text' : 'password'}
                                        value={data.webhook_secret}
                                        onChange={(e) => setData('webhook_secret', e.target.value)}
                                        placeholder={hasWebhookSecret ? '(unchanged)' : 'Enter webhook secret'}
                                        className="border-white/20 bg-white/5 text-white/90 placeholder:text-white/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                                    >
                                        {showSecret ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {errors.webhook_secret && <p className="text-sm text-red-400">{errors.webhook_secret}</p>}
                            </div>
                        </CardContent>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                        Save Configuration
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={testConnection}
                        disabled={testing || !data.base_url}
                        className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                    >
                        {testing && <Spinner className="mr-2 h-4 w-4" />}
                        Test Connection
                    </Button>
                </div>
            </form>
        </>
    );
}
