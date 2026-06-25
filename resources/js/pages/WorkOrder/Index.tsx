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
    TrendingUp,
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
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workOrdersIndex } from '@/routes/work-orders';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    tgl_work_order: string | null;
    rincian_pekerjaan: string | null;
    lokasi: string | null;
    status_pekerjaan: string | null;
    prioritas: string | null;
    priority_type: string | null;
    urgent_sub_type: string | null;
    level: string | null;
    budget: string | null;
    keterangan: string | null;
    modified_user: number | null;
    user: string | null;
    department: string | null;
    pic: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
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
    { label: string; bg: string; icon: typeof CheckCircle2; dot: string }
> = {
    completed: {
        label: 'Completed',
        bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
        icon: CheckCircle2,
        dot: 'bg-emerald-500',
    },
    'in progress': {
        label: 'In Progress',
        bg: 'bg-[#0071b7]/10 text-[#0071b7] ring-[#0071b7]/20 dark:bg-[#0093dd]/20 dark:text-[#0093dd] dark:ring-[#0093dd]/30',
        icon: Clock,
        dot: 'bg-[#0071b7]',
    },
    pending: {
        label: 'Pending',
        bg: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
        icon: AlertCircle,
        dot: 'bg-amber-500',
    },
    cancelled: {
        label: 'Cancelled',
        bg: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
        icon: X,
        dot: 'bg-red-500',
    },
};

const priorityConfig: Record<
    string,
    { label: string; bg: string; badge: string }
> = {
    high: {
        label: 'High',
        bg: 'bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
        badge: 'from-red-500 to-red-600',
    },
    medium: {
        label: 'Medium',
        bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
        badge: 'from-amber-500 to-amber-600',
    },
    low: {
        label: 'Low',
        bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
        badge: 'from-emerald-500 to-emerald-600',
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

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Work Orders
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Manage and track all work orders efficiently
                        </p>
                    </div>
                    <Link href="/work-orders/create">
                        <Button className="gap-2 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 transition-all hover:shadow-lg hover:shadow-[#0071b7]/30">
                            <Plus className="size-4" />
                            New Work Order
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Orders
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                    {stats.total}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="size-3.5 text-[#0071b7]" />
                                    <span className="text-xs font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                        All time
                                    </span>
                                </div>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0071b7] to-[#0093dd] shadow-md ring-4 ring-[#0071b7]/10">
                                <ClipboardList className="size-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Completed
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {stats.completed}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        Done
                                    </span>
                                </div>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 shadow-md ring-4 ring-emerald-500/20">
                                <CheckCircle2 className="size-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    In Progress
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-[#0071b7] dark:text-[#0093dd]">
                                    {stats.inProgress}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-[#0071b7]" />
                                    <span className="text-xs font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0071b7] to-[#0093dd] shadow-md ring-4 ring-[#0071b7]/10">
                                <Clock className="size-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Budget
                                </p>
                                <p className="text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                                    {formatCurrency(
                                        stats.totalBudget.toString(),
                                    )}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="size-3.5 text-amber-500" />
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        Allocated
                                    </span>
                                </div>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-400 shadow-md ring-4 ring-amber-500/20">
                                <DollarSign className="size-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col gap-4 p-5">
                        {/* Search Bar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Search work orders..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="h-10 pl-10"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-10 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 hover:shadow-lg hover:shadow-[#0071b7]/30"
                            >
                                Search
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="h-10 gap-2"
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
                                    size="sm"
                                    onClick={clearFilters}
                                    className="gap-1.5 text-neutral-500"
                                >
                                    <X className="size-3.5" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="grid animate-in gap-3 border-t border-neutral-100 pt-4 fade-in slide-in-from-top-2 sm:grid-cols-3 dark:border-neutral-800">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger className="h-10">
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
                                    <SelectTrigger className="h-10">
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
                                    <SelectTrigger className="h-10">
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

                {/* Results Count */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {workOrders.total > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {workOrders.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {workOrders.to}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {workOrders.total}
                            </span>{' '}
                            work orders
                        </>
                    ) : (
                        'No work orders found'
                    )}
                </div>

                {/* Work Orders Grid */}
                {workOrders.data.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {workOrders.data.map((wo) => {
                            const statusConf = getStatusConfig(wo.status_pekerjaan);
                            const priorityConf = getPriorityConfig(wo.prioritas);

                            return (
                                <div
                                    key={wo.id_work_order}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    {/* Priority indicator */}
                                    <div
                                        className={`absolute top-0 left-0 h-1 w-full bg-linear-to-r ${priorityConf.badge}`}
                                    />

                                    <div className="flex flex-1 flex-col p-5">
                                        {/* Header */}
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-mono text-xs font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                                    {wo.no_work_order}
                                                </p>
                                                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
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
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Status & Priority */}
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusConf.bg}`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${statusConf.dot}`}
                                                />
                                                {statusConf.label}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityConf.bg}`}
                                            >
                                                {priorityConf.label}
                                            </span>
                                            {wo.level && (
                                                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    {wo.level}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="mt-auto space-y-2 text-xs">
                                            {wo.tgl_work_order && (
                                                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                    <Calendar className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {formatDate(
                                                            wo.tgl_work_order,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {wo.lokasi && (
                                                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                    <MapPin className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {wo.lokasi}
                                                    </span>
                                                </div>
                                            )}
                                            {wo.department && (
                                                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                    <Building2 className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {wo.department}
                                                    </span>
                                                </div>
                                            )}
                                            {wo.pic && (
                                                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                    <User className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="truncate">
                                                        {wo.pic}
                                                    </span>
                                                </div>
                                            )}
                                            {wo.budget && (
                                                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                    <DollarSign className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                        {formatCurrency(wo.budget)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                <StatusBadge status={wo.status_pekerjaan || 'pending_hod_review'} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {wo.status_pekerjaan === 'pending_hod_review' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/hod-review`}>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            Review
                                                        </Button>
                                                    </Link>
                                                )}
                                                {(wo.status_pekerjaan === 'hod_approved' || wo.status_pekerjaan === 'scheduled') && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/assign`}>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            Assign
                                                        </Button>
                                                    </Link>
                                                )}
                                                {wo.status_pekerjaan === 'assigned' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/submit-results`}>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            Submit
                                                        </Button>
                                                    </Link>
                                                )}
                                                {wo.status_pekerjaan === 'pending_verification' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/verify`}>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            Verify
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                                            <ClipboardList className="size-3" />
                                            <span>
                                                {new Date(wo.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/work-orders/${wo.id_work_order}`}
                                            className="text-[11px] font-medium text-[#0071b7] transition-colors hover:text-[#0071b7]/70 dark:text-[#0093dd]"
                                        >
                                            View details &rarr;
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 py-16 dark:border-neutral-700 dark:bg-neutral-900/50">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                            <ClipboardList className="size-7 text-neutral-400 dark:text-neutral-500" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
                            No work orders found
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search terms.'
                                : 'No work orders have been created yet.'}
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
                            <Link href="/work-orders/create">
                                <Button size="sm" className="mt-4 gap-1.5">
                                    <Plus className="size-3.5" />
                                    Create Work Order
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {workOrders.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/60 bg-white px-6 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing {workOrders.from || 0} to{' '}
                            {workOrders.to || 0} of {workOrders.total} results
                        </p>
                        <div className="flex items-center gap-1.5">
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
