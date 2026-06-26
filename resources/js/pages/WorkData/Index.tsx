import { Head, Link, router } from '@inertiajs/react';
import { FileText, Search, Plus, Eye, Filter, X, ChevronLeft, ChevronRight, Calendar, Building2, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index as workDataIndex } from '@/routes/work-data';

type WorkData = {
    id_work_data: number;
    no_kerja: string;
    tanggal_work_data: string | null;
    deskripsi: string | null;
    status_pekerjaan: string | null;
    nama_tenant: string | null;
    work_department: string | null;
    kode_inventory: string | null;
    create_date: string;
};

type Filters = {
    search?: string;
    status_pekerjaan?: string;
    department?: string;
};

type PageProps = {
    workData: {
        data: WorkData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: Filters;
};

export default function WorkDataIndex({ workData, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_pekerjaan || '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.department || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(
            workDataIndex.url(),
            {
                search: search || undefined,
                status_pekerjaan: statusFilter || undefined,
                department: departmentFilter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setDepartmentFilter('');
        router.get(workDataIndex.url(), {}, { preserveState: true, preserveScroll: true });
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return null;

        const statusConfig: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
            draft: {
                bg: 'bg-neutral-100',
                text: 'text-neutral-700',
                darkBg: 'dark:bg-neutral-800',
                darkText: 'dark:text-neutral-300',
            },
            in_progress: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                darkBg: 'dark:bg-blue-500/20',
                darkText: 'dark:text-blue-400',
            },
            completed: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-700',
                darkBg: 'dark:bg-emerald-500/20',
                darkText: 'dark:text-emerald-400',
            },
            verified: {
                bg: 'bg-purple-100',
                text: 'text-purple-700',
                darkBg: 'dark:bg-purple-500/20',
                darkText: 'dark:text-purple-400',
            },
        };

        const config = statusConfig[status] || statusConfig.draft;

        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}`}
            >
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <>
            <Head title="Work Data Management" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <FileText className="size-3.5" />
                                Work Management
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Work Data
                            </h1>
                            <p className="mt-2 text-sm text-white/80">
                                Manage and track all work order execution data
                            </p>
                        </div>
                        <Link href="/work-data/create">
                            <Button className="bg-white text-[#0071b7] hover:bg-white/90 shadow-md">
                                <Plus className="mr-2 size-4" />
                                New Work Data
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Work Data</p>
                                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{workData.total}</p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0071b7] to-[#0093dd]">
                                <FileText className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">In Progress</p>
                                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {workData.data.filter(w => w.status_pekerjaan === 'in_progress').length}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600">
                                <Calendar className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {workData.data.filter(w => w.status_pekerjaan === 'completed').length}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600">
                                <User className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Verified</p>
                                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {workData.data.filter(w => w.status_pekerjaan === 'verified').length}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600">
                                <Building2 className="size-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Search work data..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 transition-all focus-visible:ring-[#0071b7]/50"
                                />
                            </div>
                            <Button onClick={handleSearch} className="bg-linear-to-r from-[#0071b7] to-[#0093dd]">
                                <Search className="mr-2 size-4" />
                                Search
                            </Button>
                            {(search || statusFilter || departmentFilter) && (
                                <Button variant="outline" onClick={handleReset}>
                                    <X className="mr-2 size-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter className="size-4" />
                            Filters
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 grid gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-700 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-all focus:border-[#0071b7] focus:outline-none focus:ring-2 focus:ring-[#0071b7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="verified">Verified</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    placeholder="Filter by department..."
                                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-all focus:border-[#0071b7] focus:outline-none focus:ring-2 focus:ring-[#0071b7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Work Data Table */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Work Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Tenant
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {workData.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <FileText className="mx-auto mb-4 size-12 text-neutral-300 dark:text-neutral-600" />
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                No work data found
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    workData.data.map((data) => (
                                        <tr
                                            key={data.id_work_data}
                                            className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {data.no_kerja}
                                                </div>
                                                {data.deskripsi && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-neutral-500 dark:text-neutral-400">
                                                        {data.deskripsi}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-neutral-900 dark:text-white">
                                                    {data.tanggal_work_data
                                                        ? new Date(data.tanggal_work_data).toLocaleDateString()
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-neutral-900 dark:text-white">
                                                    {data.work_department || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-neutral-900 dark:text-white">
                                                    {data.nama_tenant || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(data.status_pekerjaan)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/work-data/${data.id_work_data}`}>
                                                        <Button variant="outline" size="sm" className="gap-1">
                                                            <Eye className="size-3.5" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {workData.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Showing {workData.from} to {workData.to} of {workData.total} results
                            </p>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: workData.last_page }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() =>
                                            router.get(
                                                workDataIndex.url(),
                                                { ...filters, page },
                                                { preserveState: true, preserveScroll: true }
                                            )
                                        }
                                        className={`size-9 rounded-lg text-sm font-medium transition-all ${page === workData.current_page
                                                ? 'bg-[#0071b7] text-white shadow-md'
                                                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

WorkDataIndex.layout = {
    breadcrumbs: [
        {
            title: 'Work Data',
            href: workDataIndex(),
        },
    ],
};
