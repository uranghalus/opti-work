import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Phone,
    Pencil,
    Globe,
    Hash,
    FileText,
    ExternalLink,
    Copy,
    Check,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { index, edit } from '@/routes/tenants';

type Tenant = {
    id: number;
    name: string;
    company_name: string | null;
    status: 'active' | 'inactive' | 'suspended';
    type: string | null;
    email: string | null;
    phone: string | null;
    area: string | null;
    location: string | null;
    logo_url: string | null;
    description: string | null;
};

type PageProps = {
    tenant: Tenant;
};

export default function TenantShow({ tenant }: PageProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <>
            <Head title={`${tenant.name} - Details`} />

            <div className="mx-auto w-full max-w-5xl animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
                {/* Header & Actions */}
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-linear-to-br from-white via-neutral-50/50 to-white p-6 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/50 dark:to-neutral-900 dark:shadow-neutral-900/40">
                    <div className="absolute -top-20 -right-20 size-64 rounded-full bg-linear-to-br from-[#0071b7]/5 to-[#0093dd]/5 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <Link
                                href={index.url()}
                                className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-all hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                            >
                                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                                Back to Tenants
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    Tenant Details
                                </h1>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    Comprehensive overview and management
                                    information
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={edit.url({ tenant: tenant.id })}>
                                <Button className="gap-2 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-lg shadow-[#0071b7]/25 transition-all hover:shadow-xl hover:shadow-[#0071b7]/30 hover:brightness-110">
                                    <Pencil className="size-4" />
                                    Edit Tenant
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column - Main Info */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-8 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            {/* Decorative gradient */}
                            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-linear-to-br from-[#0071b7]/10 to-[#0093dd]/10 blur-2xl transition-opacity group-hover:opacity-75" />

                            <div className="relative flex flex-col items-center text-center">
                                {/* Logo with animated border */}
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#0071b7] to-[#0093dd] opacity-75 blur-md" />
                                    <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-3xl border-2 border-white bg-linear-to-br from-neutral-50 to-white p-2 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900">
                                        {tenant.logo_url ? (
                                            <img
                                                src={tenant.logo_url}
                                                alt={tenant.name}
                                                className="size-full rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <Building2 className="size-12 text-neutral-400" />
                                        )}
                                    </div>
                                </div>

                                <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
                                    {tenant.name}
                                </h2>
                                {tenant.company_name && (
                                    <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                        {tenant.company_name}
                                    </p>
                                )}

                                {/* Status & Type badges */}
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${tenant.status === 'active'
                                                ? 'bg-linear-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 ring-1 ring-emerald-500/20 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400 dark:ring-emerald-500/20'
                                                : tenant.status === 'inactive'
                                                    ? 'bg-linear-to-r from-neutral-50 to-neutral-100/50 text-neutral-700 ring-1 ring-neutral-500/20 dark:from-neutral-800 dark:to-neutral-800/50 dark:text-neutral-400 dark:ring-neutral-500/20'
                                                    : 'bg-linear-to-r from-red-50 to-red-100/50 text-red-700 ring-1 ring-red-500/20 dark:from-red-500/10 dark:to-red-500/5 dark:text-red-400 dark:ring-red-500/20'
                                            }`}
                                    >
                                        <span
                                            className={`size-2 rounded-full ${tenant.status === 'active'
                                                    ? 'animate-pulse bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                                    : tenant.status ===
                                                        'inactive'
                                                        ? 'bg-neutral-500'
                                                        : 'bg-red-500 shadow-sm shadow-red-500/50'
                                                }`}
                                        />
                                        {tenant.status.charAt(0).toUpperCase() +
                                            tenant.status.slice(1)}
                                    </span>
                                    {tenant.type && (
                                        <span className="inline-flex items-center rounded-full bg-linear-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:from-blue-500/10 dark:to-blue-500/5 dark:text-blue-400 dark:ring-blue-500/20">
                                            {tenant.type}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                <Hash className="size-4 text-[#0071b7]" />
                                Quick Reference
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/50 px-4 py-3 dark:from-neutral-800 dark:to-neutral-800/50">
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        Tenant ID
                                    </span>
                                    <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                        #{tenant.id}
                                    </span>
                                </div>
                                {tenant.area && (
                                    <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/50 px-4 py-3 dark:from-neutral-800 dark:to-neutral-800/50">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            Region
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {tenant.area}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Contact Information */}
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-[#0071b7]/5 to-transparent blur-2xl" />
                            <div className="relative">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0071b7] to-[#0093dd]">
                                        <Mail className="size-4 text-white" />
                                    </div>
                                    Contact Information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Email */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Mail className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Email Address
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {tenant.email || '-'}
                                                </p>
                                                {tenant.email && (
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                tenant.email!,
                                                                'email',
                                                            )
                                                        }
                                                        className="shrink-0 text-neutral-400 transition-colors hover:text-[#0071b7] dark:hover:text-[#0093dd]"
                                                        title="Copy email"
                                                    >
                                                        {copiedField ===
                                                            'email' ? (
                                                            <Check className="size-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="size-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Phone */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Phone className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Phone Number
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {tenant.phone || '-'}
                                                </p>
                                                {tenant.phone && (
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                tenant.phone!,
                                                                'phone',
                                                            )
                                                        }
                                                        className="shrink-0 text-neutral-400 transition-colors hover:text-[#0071b7] dark:hover:text-[#0093dd]"
                                                        title="Copy phone"
                                                    >
                                                        {copiedField ===
                                                            'phone' ? (
                                                            <Check className="size-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="size-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-emerald-500/5 to-transparent blur-2xl" />
                            <div className="relative">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-400">
                                        <MapPin className="size-4 text-white" />
                                    </div>
                                    Location Details
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Area */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Globe className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Area / Region
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {tenant.area || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Location */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <MapPin className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Full Address
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {tenant.location || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description & Metadata */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Description */}
                            <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 sm:col-span-2 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                                <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-violet-500/5 to-transparent blur-2xl" />
                                <div className="relative">
                                    <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-400">
                                            <FileText className="size-4 text-white" />
                                        </div>
                                        Description & Notes
                                    </h3>
                                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 via-neutral-50/50 to-white p-5 ring-1 ring-neutral-200/60 dark:from-neutral-800 dark:via-neutral-800/50 dark:to-neutral-900 dark:ring-neutral-700">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                            {tenant.description || (
                                                <span className="text-neutral-400 italic dark:text-neutral-500">
                                                    No description provided.
                                                    Click "Edit Tenant" to add
                                                    details.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metadata */}
                        {tenant.type && (
                            <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-linear-to-br from-blue-50/50 via-white to-blue-50/30 p-6 shadow-lg shadow-blue-200/20 transition-all hover:shadow-xl hover:shadow-blue-200/30 dark:border-neutral-800 dark:from-blue-500/5 dark:via-neutral-900 dark:to-blue-500/5 dark:shadow-neutral-900/40">
                                <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-blue-500/10 to-transparent blur-2xl" />
                                <div className="relative flex items-center gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                                        <Building2 className="size-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                            Tenant Type
                                        </p>
                                        <p className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-white">
                                            {tenant.type}
                                        </p>
                                    </div>
                                    <ExternalLink className="size-5 text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-blue-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

TenantShow.layout = {
    breadcrumbs: [
        {
            title: 'Tenants',
            href: index(),
        },
        {
            title: 'Tenant Details',
            href: '',
        },
    ],
};
