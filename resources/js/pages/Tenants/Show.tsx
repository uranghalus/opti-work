import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, MapPin, Phone, Pencil, Globe, Hash, FileText, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/tenants';
import TenantEditModal from './Edit';

type Tenant = { id: number; name: string; company_name: string | null; status: 'active' | 'inactive' | 'suspended'; type: string | null; email: string | null; phone: string | null; area: string | null; location: string | null; logo_url: string | null; description: string | null };
type PageProps = { tenant: Tenant };

export default function TenantShow({ tenant }: PageProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const copy = (text: string, field: string) => {
 if (!text) {
return;
}

 navigator.clipboard.writeText(text); setCopiedField(field); setTimeout(() => setCopiedField(null), 2000); 
};

    return (
        <>
            <Head title={`${tenant.name} - Details`} />

            <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Header — Double-Bezel */}
                <div className="animate-fade-in rounded-[2rem] border border-primary/10 bg-primary/5 p-1.5">
                    <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-primary via-[#0088cc] to-[#0093dd] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] md:px-8">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-[80px]" />
                            <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-white/10 blur-[60px]" />
                        </div>
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-3">
                                <Link href={index.url()} className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white">
                                    <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white/20"><ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /></span>
                                    Back to Tenants
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Tenant Details</h1>
                                    <p className="mt-1 text-sm text-white/80">Comprehensive overview and management information</p>
                                </div>
                            </div>
                            <Button onClick={() => setEditOpen(true)} className="group rounded-full bg-white/15 px-6 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/25 active:scale-[0.97]">
                                <Pencil className="size-4" />Edit Tenant
                                <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><Pencil className="size-3" /></span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left — Profile */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Profile Card — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-md">
                                <div className="relative flex flex-col items-center text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-[#0093dd] opacity-60 blur-lg" />
                                        <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-background bg-accent p-1">
                                            {tenant.logo_url ? (
                                                <img src={tenant.logo_url} alt={tenant.name} className="size-full rounded-xl object-cover" />
                                            ) : (
                                                <Building2 className="size-10 text-muted-foreground/50" />
                                            )}
                                        </div>
                                    </div>
                                    <h2 className="mt-5 text-xl font-bold text-foreground">{tenant.name}</h2>
                                    {tenant.company_name && <p className="mt-1 text-sm font-medium text-muted-foreground">{tenant.company_name}</p>}

                                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset ${
                                            tenant.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            tenant.status === 'inactive' ? 'bg-neutral-50 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400' :
                                            'bg-red-50 text-red-700 ring-red-500/20 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : tenant.status === 'inactive' ? 'bg-neutral-500' : 'bg-red-500'}`} />
                                            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                                        </span>
                                        {tenant.type && (
                                            <span className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                                {tenant.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Reference — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Hash className="size-4 text-primary" />Quick Reference
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3">
                                        <span className="text-xs font-medium text-muted-foreground">Tenant ID</span>
                                        <span className="font-mono text-sm font-semibold text-foreground">#{tenant.id}</span>
                                    </div>
                                    {tenant.area && (
                                        <div className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3">
                                            <span className="text-xs font-medium text-muted-foreground">Region</span>
                                            <span className="text-sm font-semibold text-foreground">{tenant.area}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Details */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Contact — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-sm"><Mail className="size-4 text-primary-foreground" /></div>
                                    Contact Information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { icon: Mail, label: 'Email Address', value: tenant.email, field: 'email' },
                                        { icon: Phone, label: 'Phone Number', value: tenant.phone, field: 'phone' },
                                    ].map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div key={item.field} className="group flex items-start gap-3 rounded-xl border border-border/40 bg-accent/30 p-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent/60">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/40">
                                                    <Icon className="size-5 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-foreground">{item.value || '-'}</p>
                                                        {item.value && (
                                                            <button onClick={() => copy(item.value!, item.field)} className="shrink-0 text-muted-foreground/50 transition-all hover:text-primary" title={`Copy ${item.field}`}>
                                                                {copiedField === item.field ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Location — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 shadow-sm"><MapPin className="size-4 text-white" /></div>
                                    Location Details
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { icon: Globe, label: 'Area / Region', value: tenant.area },
                                        { icon: MapPin, label: 'Full Address', value: tenant.location },
                                    ].map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div key={item.label} className="flex items-start gap-3 rounded-xl border border-border/40 bg-accent/30 p-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent/60">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/40">
                                                    <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                                    <p className="mt-1 text-sm font-semibold text-foreground">{item.value || '-'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Description — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 shadow-sm"><FileText className="size-4 text-white" /></div>
                                    Description & Notes
                                </h3>
                                <div className="rounded-xl border border-border/40 bg-accent/30 p-5">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                                        {tenant.description || <span className="italic text-muted-foreground">No description provided. Click "Edit Tenant" to add details.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Type Highlight */}
                        {tenant.type && (
                            <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-primary/20 bg-primary/[0.02] p-1.5">
                                <div className="flex items-center gap-4 rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#0093dd] shadow-lg shadow-primary/30">
                                        <Building2 className="size-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-primary">Tenant Type</p>
                                        <p className="mt-0.5 text-lg font-bold text-foreground">{tenant.type}</p>
                                    </div>
                                    <ExternalLink className="size-5 text-primary/40 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TenantEditModal open={editOpen} onClose={() => setEditOpen(false)} tenant={tenant} />
        </>
    );
}

TenantShow.layout = { breadcrumbs: [{ title: 'Tenants', href: index() }, { title: 'Tenant Details', href: '' }] };
