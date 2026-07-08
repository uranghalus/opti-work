import { Head, Link, router } from '@inertiajs/react';
import { Building2, Mail, MapPin, MoreVertical, Pencil, Phone, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { show, index } from '@/routes/tenants';
import TenantCreateModal from './Create';
import TenantDeleteModal from './Delete';
import TenantEditModal from './Edit';

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

type PaginatedData<T> = { data: T[]; current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; prev_page_url: string | null; next_page_url: string | null };

type Filters = { search?: string; status?: string; type?: string; create?: string; edit?: string };

type PageProps = { tenants: PaginatedData<Tenant>; filters: Filters; editingTenant: Tenant | null };

const statusConfig = {
    active: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30', dot: 'bg-emerald-500' },
    inactive: { label: 'Inactive', bg: 'bg-neutral-50 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400 dark:ring-neutral-500/30', dot: 'bg-neutral-400' },
    suspended: { label: 'Suspended', bg: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30', dot: 'bg-red-500' },
};

function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout>;

    return ((...args: Parameters<T>) => {
 clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); 
}) as T;
}

export default function TenantIndex({ tenants, filters, editingTenant }: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [actionMenuId, setActionMenuId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(filters.create === 'true');
    const [editOpen, setEditOpen] = useState(!!filters.edit);
    const [selectedTenantToEdit, setSelectedTenantToEdit] = useState<Tenant | null>(null);

    const openEdit = (t: Tenant) => {
 setSelectedTenantToEdit(t); setEditOpen(true); setActionMenuId(null); 
};
    const openDelete = (t: Tenant) => {
 setTenantToDelete(t); setDeleteDialogOpen(true); setActionMenuId(null); 
};

    useEffect(() => {
 if (editingTenant) {
 setSelectedTenantToEdit(editingTenant); setEditOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
 } 
 }, [editingTenant]);

    const closeCreate = () => {
 setCreateOpen(false);

 if (filters.create) {
router.get(index.url(), {}, { preserveState: true, replace: true });
} 
};
    const closeEdit = () => {
 setEditOpen(false); setSelectedTenantToEdit(null);

 if (filters.edit) {
router.get(index.url(), {}, { preserveState: true, replace: true });
} 
};

    const debouncedSearch = useRef(debounce((term: string, status: string) => {
        router.get(index.url(), { ...(term && { search: term }), ...(status !== 'all' && { status }) }, { preserveState: true, replace: true });
    }, 300));

    const handleSearch = (value: string) => {
 setSearchTerm(value); debouncedSearch.current(value, statusFilter); 
};
    const handleStatusFilter = (value: string) => {
 setStatusFilter(value); debouncedSearch.current(searchTerm, value); 
};
    const clearFilters = () => {
 setSearchTerm(''); setStatusFilter('all'); router.get(index.url(), {}, { preserveState: true, replace: true }); 
};
    const hasActiveFilters = searchTerm || statusFilter !== 'all';

    return (
        <>
            <Head title="Tenants" />

            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Header */}
                <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[11px] font-semibold tracking-[0.15em] text-primary uppercase">Directory</span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Tenants</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Manage your tenants, partners, and vendors</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="group h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                        <Plus className="size-4" />Add Tenant
                        <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><Plus className="size-3" /></span>
                    </Button>
                </div>

                {/* Search & Filter — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                                <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                    <Input placeholder="Search by name, company, or email..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
                                        className="rounded-[calc(0.75rem-4px)] border-0 bg-background pl-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300" />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="h-11 w-full sm:w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground rounded-full px-4">
                                    <X className="size-3.5" />Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="animate-fade-in animate-delay-200 text-sm text-muted-foreground">
                    {tenants.total > 0 ? <>Showing <span className="font-semibold text-foreground">{tenants.from}</span> to <span className="font-semibold text-foreground">{tenants.to}</span> of <span className="font-semibold text-foreground">{tenants.total}</span> tenants</> : 'No tenants found'}
                </div>

                {/* Card Grid */}
                {tenants.data.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tenants.data.map((tenant, idx) => {
                            const status = statusConfig[tenant.status];
                            const initials = tenant.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

                            return (
                                <div key={tenant.id} className={`animate-fade-in animate-delay-${(idx % 8) * 50 + 200} rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]`}>
                                    <div className="group relative flex flex-col overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg active:scale-[0.99]">
                                        {/* Action Menu */}
                                        <div className="absolute right-2 top-2 z-10">
                                            <button onClick={() => setActionMenuId(actionMenuId === tenant.id ? null : tenant.id)}
                                                className="rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all duration-500 hover:bg-accent hover:text-foreground group-hover:opacity-100">
                                                <MoreVertical className="size-4" />
                                            </button>
                                            {actionMenuId === tenant.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-xl border border-border/40 bg-background shadow-lg">
                                                    <button onClick={() => openEdit(tenant)} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground transition-all hover:bg-accent">
                                                        <Pencil className="size-3.5" /> Edit
                                                    </button>
                                                    <button onClick={() => openDelete(tenant)} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive transition-all hover:bg-destructive/10">
                                                        <Trash2 className="size-3.5" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Header */}
                                        <div className="relative bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-5 pb-4">
                                            <div className="flex items-start gap-3.5">
                                                {tenant.logo_url ? (
                                                    <img src={tenant.logo_url} alt={tenant.name} className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-border/50" />
                                                ) : (
                                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#0093dd] text-sm font-bold text-white shadow-md ring-4 ring-primary/10">
                                                        {initials}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-semibold text-foreground">{tenant.name}</h3>
                                                    {tenant.company_name && (
                                                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                            <Building2 className="size-3 shrink-0" />{tenant.company_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="flex flex-1 flex-col gap-2.5 px-5 pb-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset transition-all ${status.bg}`}>
                                                    <span className={`size-1.5 rounded-full ${status.dot}`} />{status.label}
                                                </span>
                                                {tenant.type && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{tenant.type}</span>}
                                            </div>
                                            <div className="space-y-1.5">
                                                {tenant.email && (
                                                    <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                                                        <Mail className="size-3.5 shrink-0 text-muted-foreground/50" /><span className="truncate">{tenant.email}</span>
                                                    </p>
                                                )}
                                                {tenant.phone && (
                                                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="size-3.5 shrink-0 text-muted-foreground/50" />{tenant.phone}
                                                    </p>
                                                )}
                                                {tenant.area && (
                                                    <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                                                        <MapPin className="size-3.5 shrink-0 text-muted-foreground/50" /><span className="truncate">{tenant.area}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="border-t border-border/50 bg-accent/30 px-5 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                                                    <Users className="size-3" />
                                                    <span>{new Date(tenant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <Link href={show(tenant.id)} className="group/link flex items-center gap-1 text-[11px] font-medium text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary/70">
                                                    View details<span className="inline-block transition-transform duration-500 group-hover/link:translate-x-0.5">&rarr;</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State — Double-Bezel */
                    <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-dashed border-border/50 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="flex flex-col items-center justify-center rounded-[calc(1.5rem-0.375rem)] bg-background py-16 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-accent"><Building2 className="size-7 text-muted-foreground" /></div>
                            <h3 className="mt-4 text-sm font-semibold text-foreground">No tenants found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{hasActiveFilters ? 'Try adjusting your search or filters.' : 'Get started by adding your first tenant.'}</p>
                            {hasActiveFilters ? (
                                <Button variant="outline" size="sm" className="mt-4 gap-1.5 rounded-full px-5" onClick={clearFilters}><X className="size-3.5" />Clear filters</Button>
                            ) : (
                                <Button onClick={() => setCreateOpen(true)} size="sm" className="group mt-4 gap-1.5 rounded-full bg-primary px-5 text-primary-foreground shadow-md active:scale-[0.97]">
                                    <Plus className="size-3.5" />Add Tenant
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination — Double-Bezel */}
                {tenants.last_page > 1 && (
                    <div className="animate-fade-in animate-delay-500 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="flex items-center justify-center gap-1.5 rounded-[calc(1.5rem-0.375rem)] bg-background px-6 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            {Array.from({ length: tenants.last_page }, (_, i) => i + 1).map((page) => {
                                const active = page === tenants.current_page;

                                return (
                                    <Link key={page} href={index.url({ query: { page: page.toString(), ...(searchTerm && { search: searchTerm }), ...(statusFilter !== 'all' && { status: statusFilter }) } })} preserveState
                                        className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                            active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}>
                                        {page}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <TenantDeleteModal open={deleteDialogOpen} onClose={() => {
 setDeleteDialogOpen(false); setTenantToDelete(null); 
}} tenant={tenantToDelete} />
            <TenantCreateModal open={createOpen} onClose={closeCreate} />
            <TenantEditModal open={editOpen} onClose={closeEdit} tenant={selectedTenantToEdit} />
        </>
    );
}

TenantIndex.layout = { breadcrumbs: [{ title: 'Tenants', href: index() }] };
