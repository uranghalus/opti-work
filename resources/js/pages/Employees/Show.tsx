import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Check,
    Copy,
    Hash,
    User,
    Monitor,
} from 'lucide-react';
import { useState } from 'react';

import { index } from '@/routes/employees';

type Department = {
    id_department: string;
    kode_department: string;
    nama_department: string;
};

type Position = {
    id_position: string;
    nama_position: string;
    id_department: string | null;
};

type Employee = {
    id_employee: string;
    nik_employee: string | null;
    nama_employee: string | null;
    email: string | null;
    number: string | null;
    photo_url: string | null;
    id_department: string | null;
    id_position: string | null;
    last_login_ip: string | null;
    created_at: string;
    updated_at: string;
    department?: Department | null;
    position?: Position | null;
};

type PageProps = {
    employee: Employee;
};

export default function EmployeeShow({ employee }: PageProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getInitials = (name: string | null, code: string | null) => {
        if (name) {
            return name
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase();
        }
        if (code) {
            return code.slice(0, 2).toUpperCase();
        }
        return 'EM';
    };

    return (
        <>
            <Head title={`${employee.nama_employee ?? 'Employee'} - Details`} />

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
                                Back to Employees
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    Employee Details
                                </h1>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    Informasi detail karyawan
                                </p>
                            </div>
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
                                {/* Profile Picture */}
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#0071b7] to-[#0093dd] opacity-75 blur-md" />
                                    <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-3xl border-2 border-white bg-linear-to-br from-neutral-50 to-white p-2 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900">
                                        {employee.photo_url ? (
                                            <img
                                                src={employee.photo_url}
                                                alt={employee.nama_employee ?? ''}
                                                className="size-full rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071b7]/10 to-[#0093dd]/10 text-3xl font-bold text-[#0071b7] dark:from-[#0093dd]/20 dark:to-[#0093dd]/5 dark:text-[#0093dd]">
                                                {getInitials(employee.nama_employee, employee.nik_employee)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
                                    {employee.nama_employee ?? 'Tanpa Nama'}
                                </h2>

                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-linear-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:from-blue-500/10 dark:to-blue-500/5 dark:text-blue-400 dark:ring-blue-500/20">
                                        NIK: {employee.nik_employee ?? '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                <Hash className="size-4 text-[#0071b7]" />
                                Identitas
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/50 px-4 py-3 dark:from-neutral-800 dark:to-neutral-800/50">
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        Nomor Induk Karyawan
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]" title={employee.nik_employee ?? undefined}>
                                        {employee.nik_employee}
                                    </span>
                                </div>
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
                                                    {employee.email || '-'}
                                                </p>
                                                {employee.email && (
                                                    <button
                                                        onClick={() => copyToClipboard(employee.email!, 'email')}
                                                        className="shrink-0 text-neutral-400 transition-colors hover:text-[#0071b7] dark:hover:text-[#0093dd]"
                                                        title="Copy email"
                                                    >
                                                        {copiedField === 'email' ? (
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
                                                    {employee.number || '-'}
                                                </p>
                                                {employee.number && (
                                                    <button
                                                        onClick={() => copyToClipboard(employee.number!, 'number')}
                                                        className="shrink-0 text-neutral-400 transition-colors hover:text-[#0071b7] dark:hover:text-[#0093dd]"
                                                        title="Copy phone"
                                                    >
                                                        {copiedField === 'number' ? (
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

                        {/* Additional info Details */}
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-emerald-500/5 to-transparent blur-2xl" />
                            <div className="relative">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-400">
                                        <User className="size-4 text-white" />
                                    </div>
                                    Organization & Access
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {/* Department */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Department
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {employee.department?.nama_department ?? employee.id_department ?? '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Position */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <User className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Position / Jabatan
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {employee.position?.nama_position ?? employee.id_position ?? '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Login IP */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Monitor className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Last Login IP
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {employee.last_login_ip || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

EmployeeShow.layout = {
    breadcrumbs: [
        {
            title: 'Employees',
            href: index(),
        },
        {
            title: 'Employee Details',
            href: '',
        },
    ],
};
