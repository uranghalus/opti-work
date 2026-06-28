import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Mail,
    MapPin,
    MoreVertical,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { show, index } from '@/routes/tenants';
import TenantCreateModal from './Create';
import TenantEditModal from './Edit';
import TenantDeleteModal from './Delete';

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
    created_at: string;
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
    status?: string;
    type?: string;
    create?: string;
    edit?: string;
};

type PageProps = {
    tenants: PaginatedData<Tenant>;
    filters: Filters;
    editingTenant: Tenant | null;
};

const statusConfig = {
    active: {
        label: 'Active',
        bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
        dot: 'bg-emerald-500',
    },
    inactive: {
        label: 'Inactive',
        bg: 'bg-neutral-50 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400 dark:ring-neutral-500/30',
        dot: 'bg-neutral-400',
    },
    suspended: {
        label: 'Suspended',
        bg: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
        dot: 'bg-red-500',
    },
};

function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout>;

    return ((...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    }) as T;
}

export default function TenantIndex({ tenants, filters, editingTenant }: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [actionMenuId, setActionMenuId] = useState<number | null>(null);

    // Modal States
    const [createOpen, setCreateOpen] = useState(filters.create === 'true');
    const [editOpen, setEditOpen] = useState(!!filters.edit);
    const [selectedTenantToEdit, setSelectedTenantToEdit] = useState<Tenant | null>(null);

    const openEditModal = (tenant: Tenant) => {
        setSelectedTenantToEdit(tenant);
        setEditOpen(true);
        setActionMenuId(null);
    };

    useEffect(() => {
        if (editingTenant) {
            setSelectedTenantToEdit(editingTenant);
            setEditOpen(true);
        }
    }, [editingTenant]);

    const closeCreateModal = () => {
        setCreateOpen(false);
        if (filters.create) {
            router.get(index.url(), {}, { preserveState: true, replace: true });
        }
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setSelectedTenantToEdit(null);
        if (filters.edit) {
            router.get(index.url(), {}, { preserveState: true, replace: true });
        }
    };

    const debouncedSearch = useRef(
        debounce((term: string, status: string) => {
            router.get(
                index.url(),
                {
                    ...(term && { search: term }),
                    ...(status !== 'all' && { status }),
                },
                { preserveState: true, replace: true },
            );
        }, 300),
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        debouncedSearch.current(value, statusFilter);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        debouncedSearch.current(searchTerm, value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        router.get(index.url(), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all';

    const openDeleteDialog = (tenant: Tenant) => {
        setTenantToDelete(tenant);
        setDeleteDialogOpen(true);
        setActionMenuId(null);
    };

    return (
        <>
            <Head title="Tenants" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Tenants
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage your tenants, partners, and vendors
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <Plus className="size-4" />
                        Add Tenant
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            placeholder="Search by name, company, or email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-10 pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="h-10 w-full sm:w-[160px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1.5 text-neutral-500"
                        >
                            <X className="size-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {tenants.total > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {tenants.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {tenants.to}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {tenants.total}
                            </span>{' '}
                            tenants
                        </>
                    ) : (
                        'No tenants found'
                    )}
                </div>

                {/* Card Grid */}
                {tenants.data.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tenants.data.map((tenant) => {
                            const status = statusConfig[tenant.status];
                            const initials = tenant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);

                            return (
                                <div
                                    key={tenant.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    {/* Action Menu */}
                                    <div className="absolute right-3 top-3 z-10">
                                        <button
                                            onClick={() =>
                                                setActionMenuId(
                                                    actionMenuId === tenant.id
                                                        ? null
                                                        : tenant.id,
                                                )
                                            }
                                            className="rounded-lg p-1.5 text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-600 group-hover:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                        >
                                            <MoreVertical className="size-4" />
                                        </button>
                                        {actionMenuId === tenant.id && (
                                            <div className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                                <button
                                                    onClick={() => openEditModal(tenant)}
                                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDeleteDialog(tenant)
                                                    }
                                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Header with gradient */}
                                    <div className="relative bg-gradient-to-br from-[#0071b7]/5 via-[#0071b7]/[0.02] to-transparent p-5 pb-4">
                                        <div className="flex items-start gap-3.5">
                                            {tenant.logo_url ? (
                                                <img
                                                    src={tenant.logo_url}
                                                    alt={tenant.name}
                                                    className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-neutral-200/50 dark:ring-neutral-700"
                                                />
                                            ) : (
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071b7] to-[#0093dd] text-sm font-bold text-white shadow-md ring-4 ring-[#0071b7]/10">
                                                    {initials}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {tenant.name}
                                                </h3>
                                                {tenant.company_name && (
                                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                                        <Building2 className="size-3 shrink-0" />
                                                        {tenant.company_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex flex-1 flex-col gap-2.5 px-5 pb-4">
                                        {/* Status & Type */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.bg}`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${status.dot}`}
                                                />
                                                {status.label}
                                            </span>
                                            {tenant.type && (
                                                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    {tenant.type}
                                                </span>
                                            )}
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-1.5">
                                            {tenant.email && (
                                                <p className="flex items-center gap-2 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                                    <Mail className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {tenant.email}
                                                    </span>
                                                </p>
                                            )}
                                            {tenant.phone && (
                                                <p className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                    <Phone className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    {tenant.phone}
                                                </p>
                                            )}
                                            {tenant.area && (
                                                <p className="flex items-center gap-2 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                                    <MapPin className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {tenant.area}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                                                <Users className="size-3" />
                                                <span>
                                                    {new Date(tenant.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <Link
                                                href={show(tenant.id)}
                                                className="text-[11px] font-medium text-[#0071b7] transition-colors hover:text-[#0071b7]/70 dark:text-[#0093dd]"
                                            >
                                                View details &rarr;
                                            </Link>
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
                            No tenants found
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {hasActiveFilters
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by adding your first tenant.'}
                        </p>
                        {hasActiveFilters ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 gap-1.5"
                                onClick={clearFilters}
                            >
                                <X className="size-3.5" />
                                Clear filters
                            </Button>
                        ) : (
                            <Button onClick={() => setCreateOpen(true)} size="sm" className="mt-4 gap-1.5">
                                <Plus className="size-3.5" />
                                Add Tenant
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {tenants.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5">
                        {Array.from(
                            { length: tenants.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={index.url({
                                    query: {
                                        page: page.toString(),
                                        ...(searchTerm && { search: searchTerm }),
                                        ...(statusFilter !== 'all' && {
                                            status: statusFilter,
                                        }),
                                    },
                                })}
                                preserveState
                                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${page === tenants.current_page
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

            {/* Delete Confirmation Dialog */}
            <TenantDeleteModal
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setTenantToDelete(null);
                }}
                tenant={tenantToDelete}
            />

            {/* Create Tenant Modal */}
            <TenantCreateModal open={createOpen} onClose={closeCreateModal} />

            {/* Edit Tenant Modal */}
            <TenantEditModal open={editOpen} onClose={closeEditModal} tenant={selectedTenantToEdit} />
        </>
    );
}

TenantIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tenants',
            href: index(),
        },
    ],
};
