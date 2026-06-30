import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Code,
    Crown,
    Hash,
    Mail,
    Phone,
    Users,
} from 'lucide-react';

import { index } from '@/routes/departments';

type Employee = {
    id_employee: string;
    nama_employee: string | null;
    nik_employee: string | null;
    email: string | null;
    number: string | null;
    photo_url: string | null;
    id_department: string | null;
    id_position: string | null;
    last_login_ip: string | null;
    created_at: string;
};

type Department = {
    id_department: string;
    kode_department: string;
    nama_department: string | null;
    hod_user_id: string | null;
    manager_user_id: string | null;
    created_at: string;
    updated_at: string;
    employees?: Employee[];
};

type PageProps = {
    department: Department;
};

export default function DepartmentShow({ department }: PageProps) {
    const employees = department.employees ?? [];

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
        return 'DE';
    };

    return (
        <>
            <Head title={`${department.nama_department ?? 'Department'} - Details`} />

            <div className="mx-auto w-full max-w-5xl animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-linear-to-br from-white via-neutral-50/50 to-white p-6 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/50 dark:to-neutral-900 dark:shadow-neutral-900/40">
                    <div className="absolute -top-20 -right-20 size-64 rounded-full bg-linear-to-br from-[#0071b7]/5 to-[#0093dd]/5 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <Link
                                href={index.url()}
                                className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-all hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                            >
                                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                                Back to Departments
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    Department Details
                                </h1>
                                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                    Informasi detail departemen
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column - Department Info */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-8 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-linear-to-br from-[#0071b7]/10 to-[#0093dd]/10 blur-2xl transition-opacity group-hover:opacity-75" />

                            <div className="relative flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#0071b7] to-[#0093dd] opacity-75 blur-md" />
                                    <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-3xl border-2 border-white bg-linear-to-br from-neutral-50 to-white p-2 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900">
                                        <div className="flex size-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071b7]/10 to-[#0093dd]/10 text-3xl font-bold text-[#0071b7] dark:from-[#0093dd]/20 dark:to-[#0093dd]/5 dark:text-[#0093dd]">
                                            {getInitials(department.nama_department, department.kode_department)}
                                        </div>
                                    </div>
                                </div>

                                <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
                                    {department.nama_department ?? 'Tanpa Nama'}
                                </h2>

                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-linear-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:from-blue-500/10 dark:to-blue-500/5 dark:text-blue-400 dark:ring-blue-500/20">
                                        Kode: {department.kode_department}
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
                                        Kode Departemen
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                                        {department.kode_department}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/50 px-4 py-3 dark:from-neutral-800 dark:to-neutral-800/50">
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        Jumlah Anggota
                                    </span>
                                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                                        {employees.length} orang
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Department Info */}
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-[#0071b7]/5 to-transparent blur-2xl" />
                            <div className="relative">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0071b7] to-[#0093dd]">
                                        <Building2 className="size-4 text-white" />
                                    </div>
                                    Department Information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Department Name */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Building2 className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Nama Departemen
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {department.nama_department ?? '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Code */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Code className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Kode
                                            </p>
                                            <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                                {department.kode_department}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Created At */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Calendar className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Dibuat Pada
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {new Date(department.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Updated At */}
                                    <div className="group/item relative flex items-start gap-3 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                                            <Calendar className="size-5 text-[#0071b7]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                Terakhir Diperbarui
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {new Date(department.updated_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                            <div className="absolute -top-20 -right-20 size-48 rounded-full bg-linear-to-br from-emerald-500/5 to-transparent blur-2xl" />
                            <div className="relative">
                                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-400">
                                        <Users className="size-4 text-white" />
                                    </div>
                                    Anggota Departemen
                                    <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        {employees.length}
                                    </span>
                                </h3>

                                {employees.length > 0 ? (
                                    <div className="space-y-3">
                                        {employees.map((emp) => (
                                            <div
                                                key={emp.id_employee}
                                                className="flex items-center gap-4 rounded-xl bg-linear-to-r from-neutral-50 to-neutral-100/30 p-4 transition-all hover:from-neutral-100 hover:to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-800/30 dark:hover:from-neutral-800/80 dark:hover:to-neutral-800/50"
                                            >
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0071b7]/10 to-[#0093dd]/10 text-sm font-bold text-[#0071b7] dark:from-[#0093dd]/20 dark:to-[#0093dd]/5 dark:text-[#0093dd]">
                                                    {(emp.nama_employee ?? 'NA')
                                                        .split(' ')
                                                        .slice(0, 2)
                                                        .map((w) => w[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                            {emp.nama_employee ?? 'Tanpa Nama'}
                                                        </p>
                                                        {emp.id_employee === department.hod_user_id && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                                <Crown className="size-2.5" />
                                                                HOD
                                                            </span>
                                                        )}
                                                        {emp.id_employee === department.manager_user_id && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                                                                Manager
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                        {emp.nik_employee && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Hash className="size-3" />
                                                                {emp.nik_employee}
                                                            </span>
                                                        )}
                                                        {emp.email && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Mail className="size-3" />
                                                                {emp.email}
                                                            </span>
                                                        )}
                                                        {emp.number && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Phone className="size-3" />
                                                                {emp.number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 py-10 dark:border-neutral-700 dark:bg-neutral-900/50">
                                        <Users className="size-10 text-neutral-300 dark:text-neutral-600" />
                                        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                                            Belum ada anggota di departemen ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

DepartmentShow.layout = {
    breadcrumbs: [
        {
            title: 'Departments',
            href: index(),
        },
        {
            title: 'Department Details',
            href: '',
        },
    ],
};
