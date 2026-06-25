import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    Search,
    Filter,
    ChevronDown,
    Eye,
    Calendar,
    MapPin,
    DollarSign,
    User,
    Building2,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Plus,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as workOrdersIndex } from '@/routes/work-orders';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    tgl_work_order: string | null;
    rincian_pekerjaan: string | null;
    lokasi: string | null;
    status_pekerjaan: string | null;
    prioritas: string | null;
    level: string | null;
    budget: string | null;
    keterangan: string | null;
    modified_user: number | null;
    user: string | null;
    department: string | null;
    pic: string | null;
    created_at: string;
    updated_at: string;
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
    status_pekerjaan?: string;
    prioritas?: string;
    department?: string;
};

type PageProps = {
    workOrders: PaginatedData<WorkOrder>;
    filters: Filters;
};

const statusConfig: Record<
    string,
    { label: string; bg: string; icon: typeof CheckCircle2; color: string }
> = {
    completed: {
        label: 'Completed',
        bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
        icon: CheckCircle2,
        color: 'emerald',
    },
    'in progress': {
        label: 'In Progress',
        bg: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30',
        icon: Clock,
        color: 'blue',
    },
    pending: {
        label: 'Pending',
        bg: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
        icon: AlertCircle,
        color: 'amber',
    },
    cancelled: {
        label: 'Cancelled',
        bg: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
        icon: X,
        color: 'red',
    },
};

const priorityConfig: Record<
    string,
    { label: string; bg: string; gradient: string }
> = {
    high: {
        label: 'High',
        bg: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
        gradient: 'from-red-500 to-red-600',
    },
    medium: {
        label: 'Medium',
        bg: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        gradient: 'from-amber-500 to-amber-600',
    },
    low: {
        label: 'Low',
        bg: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
        gradient: 'from-green-500 to-green-600',
    },
};

function getStatusConfig(status: string | null) {
    if (!status) {
        return statusConfig.pending;
    }

    const key = status.toLowerCase();

    return statusConfig[key] || statusConfig.pending;
}

function getPriorityConfig(priority: string | null) {
    if (!priority) {
        return priorityConfig.medium;
    }

    const key = priority.toLowerCase();

    return priorityConfig[key] || priorityConfig.medium;
}

function formatCurrency(amount: string | null): string {
    if (!amount) {
        return '-';
    }

    const num = parseFloat(amount);

    if (isNaN(num)) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

function formatDate(date: string | null): string {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function WorkOrderIndex({ workOrders, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status_pekerjaan || '',
    );
    const [priorityFilter, setPriorityFilter] = useState(
        filters.prioritas || '',
    );
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department || '',
    );
    const [showFilters, setShowFilters] = useState(false);

    const stats = useMemo(() => {
        const allOrders = workOrders.data;

        return {
            total: workOrders.total,
            completed: allOrders.filter(
                (wo) => wo.status_pekerjaan?.toLowerCase() === 'completed',
            ).length,
            inProgress: allOrders.filter(
                (wo) => wo.status_pekerjaan?.toLowerCase() === 'in progress',
            ).length,
            pending: allOrders.filter(
                (wo) => wo.status_pekerjaan?.toLowerCase() === 'pending',
            ).length,
            totalBudget: allOrders.reduce(
                (sum, wo) => sum + (parseFloat(wo.budget || '0') || 0),
                0,
            ),
        };
    }, [workOrders]);

    const handleSearch = () => {
        router.get(
            workOrdersIndex.url(),
            {
                search: search || undefined,
                status_pekerjaan: statusFilter || undefined,
                prioritas: priorityFilter || undefined,
                department: departmentFilter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (
        type: 'status' | 'priority' | 'department',
        value: string,
    ) => {
        if (type === 'status') {
            setStatusFilter(value);
        }

        if (type === 'priority') {
            setPriorityFilter(value);
        }

        if (type === 'department') {
            setDepartmentFilter(value);
        }

        setTimeout(handleSearch, 100);
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setPriorityFilter('');
        setDepartmentFilter('');
        router.get(workOrdersIndex.url(), {}, { preserveState: true });
    };

    const hasActiveFilters =
        search || statusFilter || priorityFilter || departmentFilter;

    return (
        <>
            <Head title="Work Orders" />

            <div className="mx-auto w-full max-w-7xl animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-linear-to-br from-white via-neutral-50/50 to-white p-8 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/50 dark:to-neutral-900 dark:shadow-neutral-900/40">
                    <div className="absolute -top-20 -right-20 size-64 rounded-full bg-linear-to-br from-[#0071b7]/5 to-[#0093dd]/5 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                Work Orders
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Manage and track all work orders efficiently
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/work-orders/create">
                                <Button className="gap-2 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-lg shadow-[#0071b7]/25 transition-all hover:shadow-xl hover:shadow-[#0071b7]/30 hover:brightness-110">
                                    <Plus className="size-4" />
                                    New Work Order
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-linear-to-br from-[#0071b7]/10 to-[#0093dd]/10 blur-2xl" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Orders
                                </p>
                                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0071b7] to-[#0093dd] shadow-lg shadow-[#0071b7]/25">
                                <ClipboardList className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-linear-to-br from-emerald-500/10 to-emerald-400/10 blur-2xl" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Completed
                                </p>
                                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                                <CheckCircle2 className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-linear-to-br from-blue-500/10 to-blue-400/10 blur-2xl" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    In Progress
                                </p>
                                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.inProgress}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                                <Clock className="size-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 transition-all hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-linear-to-br from-amber-500/10 to-amber-400/10 blur-2xl" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Budget
                                </p>
                                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {formatCurrency(
                                        stats.totalBudget.toString(),
                                    )}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25">
                                <DollarSign className="size-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg shadow-neutral-200/20 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40">
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Search work orders..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-lg shadow-[#0071b7]/25 hover:shadow-xl hover:shadow-[#0071b7]/30"
                            >
                                Search
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className="size-4" />
                                Filters
                                <ChevronDown
                                    className={`size-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                                />
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    onClick={clearFilters}
                                    className="gap-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                >
                                    <X className="size-4" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="grid animate-in gap-3 border-t border-neutral-200 pt-4 fade-in slide-in-from-top-2 sm:grid-cols-3 dark:border-neutral-800">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="in progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={priorityFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('priority', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All Priority
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={departmentFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('department', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            All Departments
                                        </SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="Finance">
                                            Finance
                                        </SelectItem>
                                        <SelectItem value="Operations">
                                            Operations
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Work Orders Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {workOrders.data.map((wo, index) => {
                        const statusConf = getStatusConfig(wo.status_pekerjaan);
                        const priorityConf = getPriorityConfig(wo.prioritas);
                        const StatusIcon = statusConf.icon;

                        return (
                            <div
                                key={wo.id_work_order}
                                className="group relative animate-in overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-lg shadow-neutral-200/20 transition-all fade-in slide-in-from-bottom-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/30 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/40"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Priority indicator */}
                                <div
                                    className={`absolute top-0 left-0 h-1 w-full bg-linear-to-r ${priorityConf.gradient}`}
                                />

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-mono text-xs font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                                {wo.no_work_order}
                                            </p>
                                            <h3 className="mt-1 line-clamp-2 text-base font-semibold text-neutral-900 dark:text-white">
                                                {wo.rincian_pekerjaan ||
                                                    'No Description'}
                                            </h3>
                                        </div>
                                        <Link
                                            href={`/work-orders/${wo.id_work_order}`}
                                            className="shrink-0"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-neutral-400 hover:text-[#0071b7] dark:hover:text-[#0093dd]"
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Status & Priority */}
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusConf.bg}`}
                                        >
                                            <StatusIcon className="size-3" />
                                            {statusConf.label}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityConf.bg}`}
                                        >
                                            {priorityConf.label}
                                        </span>
                                        {wo.level && (
                                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                {wo.level}
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        {wo.tgl_work_order && (
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <Calendar className="size-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {formatDate(
                                                        wo.tgl_work_order,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {wo.lokasi && (
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <MapPin className="size-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {wo.lokasi}
                                                </span>
                                            </div>
                                        )}
                                        {wo.department && (
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <Building2 className="size-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {wo.department}
                                                </span>
                                            </div>
                                        )}
                                        {wo.pic && (
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <User className="size-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {wo.pic}
                                                </span>
                                            </div>
                                        )}
                                        {wo.budget && (
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <DollarSign className="size-3.5 shrink-0" />
                                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                    {formatCurrency(wo.budget)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {workOrders.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/60 bg-white py-16 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                        <ClipboardList className="mb-4 size-16 text-neutral-300 dark:text-neutral-700" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            No Work Orders Found
                        </h3>
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search terms'
                                : 'No work orders have been created yet'}
                        </p>
                        {hasActiveFilters && (
                            <Button
                                onClick={clearFilters}
                                className="mt-4 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {workOrders.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/60 bg-white px-6 py-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing {workOrders.from || 0} to{' '}
                            {workOrders.to || 0} of {workOrders.total} results
                        </p>
                        <div className="flex items-center gap-2">
                            {workOrders.prev_page_url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            workOrders.prev_page_url!,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                            )}
                            {workOrders.next_page_url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            workOrders.next_page_url!,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

WorkOrderIndex.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
    ],
};
