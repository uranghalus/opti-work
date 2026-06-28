import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Loader2,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index, show, sync } from '@/routes/employees';

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

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    search?: string;
};

type PageProps = {
    employees: PaginatedData<Employee>;
    filters: Filters;
};

function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout>;

    return ((...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    }) as T;
}

export default function EmployeeIndex({ employees, filters }: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [syncing, setSyncing] = useState(false);

    const debouncedSearch = useRef(
        debounce((term: string) => {
            router.get(
                index.url(),
                {
                    ...(term && { search: term }),
                },
                { preserveState: true, replace: true },
            );
        }, 300),
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        debouncedSearch.current(value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };

    const handleSync = () => {
        setSyncing(true);
        router.post(sync.url(), {}, {
            onSuccess: () => {
                toast.success('Data employee berhasil disinkronkan.');
            },
            onError: () => {
                toast.error('Gagal menyinkronkan data employee.');
            },
            onFinish: () => {
                setSyncing(false);
            }
        });
    };

    const hasActiveFilters = !!searchTerm;

    // Helper to get initials of employee name
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
            <Head title="Employees" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Employees
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Lihat daftar employee
                        </p>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2 bg-[#0071b7] hover:bg-[#0093dd] text-white cursor-pointer"
                    >
                        {syncing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}
                        {syncing ? 'Menyinkronkan...' : 'Sync dari Optigate'}
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            placeholder="Cari berdasarkan NIK atau nama employee..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-10 pl-10"
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1.5 text-neutral-500 cursor-pointer"
                        >
                            <X className="size-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {employees.total > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {employees.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {employees.to}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {employees.total}
                            </span>{' '}
                            employees
                        </>
                    ) : (
                        'No employees to show'
                    )}
                </div>

                {/* Employees Card Grid */}
                {employees.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {employees.data.map((dept) => {
                            const initials = getInitials(dept.nama_employee, dept.nik_employee);
                            return (
                                <div
                                    key={dept.id_employee}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#0071b7]/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-[#0093dd]/30"
                                >
                                    <div className="p-5">
                                        {/* Card Header Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071b7]/10 to-[#0093dd]/10 text-sm font-bold text-[#0071b7] dark:from-[#0093dd]/20 dark:to-[#0093dd]/5 dark:text-[#0093dd]">
                                                {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-base font-semibold text-neutral-900 group-hover:text-[#0071b7] dark:text-white dark:group-hover:text-[#0093dd] transition-colors" title={dept.nama_employee ?? 'Tanpa Nama'}>
                                                    {dept.nama_employee ?? 'Tanpa Nama'}
                                                </h3>
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                        {dept.nik_employee}
                                                    </span>
                                                    {dept.position?.nama_position && (
                                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            {dept.position.nama_position}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="border-t border-neutral-100 px-5 py-3 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10">
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Building2 className="size-3 shrink-0 text-neutral-400" />
                                                <span className="truncate" title={dept.department?.nama_department}>
                                                    {dept.department?.nama_department ?? '-'}
                                                </span>
                                            </div>
                                            <span className="shrink-0">
                                                Updated:{' '}
                                                {new Date(dept.updated_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-[#0071b7] hover:text-[#0093dd] hover:bg-[#0071b7]/10"
                                                onClick={() => router.get(show.url({ employee: dept.id_employee }))}
                                            >
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 py-16 dark:border-neutral-700 dark:bg-neutral-900/50">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                            <Building2 className="size-7 text-neutral-400 dark:text-neutral-500" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
                            Employee tidak ditemukan
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {hasActiveFilters
                                ? 'Coba ubah kata kunci pencarian Anda.'
                                : 'Silakan klik tombol Sync untuk menarik data employee dari Optigate.'}
                        </p>
                        {hasActiveFilters ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 gap-1.5 cursor-pointer"
                                onClick={clearFilters}
                            >
                                <X className="size-3.5" />
                                Bersihkan Pencarian
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSync}
                                disabled={syncing}
                                size="sm"
                                className="mt-4 gap-1.5 cursor-pointer bg-[#0071b7] hover:bg-[#0093dd] text-white"
                            >
                                {syncing ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="size-3.5" />
                                )}
                                Sync Sekarang
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {employees.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                        {Array.from(
                            { length: employees.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={index.url({
                                    query: {
                                        page: page.toString(),
                                        ...(searchTerm && { search: searchTerm }),
                                    },
                                })}
                                preserveState
                                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${page === employees.current_page
                                    ? 'bg-[#0071b7] text-white shadow-md shadow-[#0071b7]/20'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

EmployeeIndex.layout = {
    breadcrumbs: [
        {
            title: 'Employees',
            href: index(),
        },
    ],
};
