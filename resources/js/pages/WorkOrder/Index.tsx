import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    Search,
    Filter,
    Eye,
    Calendar,
    DollarSign,
    User,
    Building2,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Plus,
    TrendingUp,
    ArrowUpDown,
    SlidersHorizontal,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as workOrdersIndex, create as workOrdersCreate } from '@/routes/work-orders';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    tgl_work_order: string | null;
    rincian_pekerjaan: string | null;
    lokasi: string | null;
    status_tiket: string | null;
    status_pekerjaan: string | null;
    prioritas: string | null;
    priority_type: string | null;
    urgent_sub_type: string | null;
    level: string | null;
    budget: string | null;
    keterangan: string | null;
    user_requester: string | null;
    department_tujuan: string | null;
    modified_user: number | null;
    user: string | null;
    department: string | null;
    pic: string | null;
    hod_action: string | null;
    scheduled_date: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
    personnel_count: number | null;
    completion_results: string | null;
    verified_by: number | null;
    verified_at: string | null;
    verification_notes: string | null;
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
    sort_by: any;
    sort_direction: any;
    search?: string;
    status?: string;
    status_pekerjaan?: string;
    prioritas?: string;
    department?: string;
    priority_type?: string;
};

type Department = {
    id_department: number;
    nama_department: string;
    kode_department: string;
};

type PageProps = {
    workOrders: PaginatedData<WorkOrder>;
    filters: Filters;
    departments: Department[];
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

export default function WorkOrderIndex({ workOrders, filters, departments = [] }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [priorityFilter, setPriorityFilter] = useState(
        filters.prioritas || '',
    );
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department || '',
    );
    const [priorityTypeFilter, setPriorityTypeFilter] = useState(
        filters.priority_type || '',
    );
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'no_work_order'>(
        (filters.sort_by as any) || 'date',
    );
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
        (filters.sort_direction as any) || 'desc',
    );

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
                status: statusFilter || undefined,
                prioritas: priorityFilter || undefined,
                department: departmentFilter || undefined,
                priority_type: priorityTypeFilter || undefined,
                sort_by: sortBy || undefined,
                sort_direction: sortDirection || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setShowFilterModal(false);
    };

    const handleFilterChange = (
        type: 'status' | 'priority' | 'department' | 'priorityType',
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

        if (type === 'priorityType') {
            setPriorityTypeFilter(value);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setPriorityFilter('');
        setDepartmentFilter('');
        setPriorityTypeFilter('');
        router.get(workOrdersIndex.url(), {}, { preserveState: true });
        setShowFilterModal(false);
    };

    const handleSortChange = (newSortBy: 'date' | 'priority' | 'status' | 'no_work_order') => {
        setSortBy(newSortBy);
        router.get(
            workOrdersIndex.url(),
            {
                search: search || undefined,
                status: statusFilter || undefined,
                prioritas: priorityFilter || undefined,
                department: departmentFilter || undefined,
                priority_type: priorityTypeFilter || undefined,
                sort_by: newSortBy,
                sort_direction: sortDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const toggleSortDirection = () => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(newDirection);
        router.get(
            workOrdersIndex.url(),
            {
                search: search || undefined,
                status: statusFilter || undefined,
                prioritas: priorityFilter || undefined,
                department: departmentFilter || undefined,
                priority_type: priorityTypeFilter || undefined,
                sort_by: sortBy,
                sort_direction: newDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const hasActiveFilters =
        search || statusFilter || priorityFilter || departmentFilter || priorityTypeFilter;

    return (
        <>
            <Head title="Work Orders" />

            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Page Header */}
                <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[11px] font-semibold tracking-[0.15em] text-primary uppercase">
                            Operations
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                Work Orders
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage and track all work orders efficiently
                            </p>
                        </div>
                    </div>
                    <Link href={workOrdersCreate()}>
                        <Button className="group h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                            <Plus className="size-4" />
                            New Work Order
                            <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                                <Plus className="size-3" />
                            </span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards — Double-Bezel */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Total Orders', value: stats.total, change: 'All time', icon: ClipboardList, color: 'from-primary to-[#0093dd]', changeIcon: TrendingUp, textColor: 'text-primary' },
                        { title: 'Completed', value: stats.completed, change: 'Done', icon: CheckCircle2, color: 'from-emerald-500 to-teal-400', changeIcon: CheckCircle2, textColor: 'text-emerald-600 dark:text-emerald-400' },
                        { title: 'In Progress', value: stats.inProgress, change: 'Active', icon: Clock, color: 'from-primary to-[#0093dd]', changeIcon: Clock, textColor: 'text-primary' },
                        { title: 'Total Budget', value: formatCurrency(stats.totalBudget.toString()), change: 'Allocated', icon: DollarSign, color: 'from-amber-500 to-orange-400', changeIcon: DollarSign, textColor: 'text-amber-600 dark:text-amber-400' },
                    ].map((stat, i) => (
                        <div key={stat.title} className={`animate-fade-in animate-delay-${(i + 1) * 100} rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]`}>
                            <div className="group rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2.5">
                                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                                        <p className={`text-3xl font-extrabold tracking-tight ${stat.textColor} ${stat.title === 'Total Budget' ? 'text-2xl' : ''}`}>
                                            {stat.value}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <stat.changeIcon className="size-3.5 text-muted-foreground" />
                                            <span className="text-xs font-semibold text-muted-foreground">{stat.change}</span>
                                        </div>
                                    </div>
                                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110`}>
                                        <stat.icon className="size-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter — Double-Bezel */}
                <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                                <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                    <Input
                                        type="text"
                                        placeholder="Search work orders..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="rounded-[calc(0.75rem-4px)] border-0 bg-background pl-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    className="group h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
                                >
                                    Search
                                    <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5">
                                        <Search className="size-3" />
                                    </span>
                                </Button>
                                <Button
                                    variant={hasActiveFilters ? 'default' : 'outline'}
                                    onClick={() => setShowFilterModal(true)}
                                    className={`group h-11 gap-2 rounded-full px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                        hasActiveFilters
                                            ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                                            : ''
                                    }`}
                                >
                                    <SlidersHorizontal className="size-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-primary-foreground">
                                            {[statusFilter, priorityFilter, departmentFilter, priorityTypeFilter].filter(Boolean).length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Modal */}
                <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                    <DialogContent className="max-w-xl rounded-2xl p-0">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6">
                            <DialogHeader className="mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Filter className="size-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-semibold text-foreground">Filter Work Orders</DialogTitle>
                                        <DialogDescription className="text-sm text-muted-foreground">Narrow down work orders by applying filters below</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground">Status</Label>
                                    <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select status..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Status</SelectItem>
                                            <SelectItem value="Pending HOD">Pending HOD</SelectItem>
                                            <SelectItem value="HOD Approved">HOD Approved</SelectItem>
                                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                                            <SelectItem value="Assigned">Assigned</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground">Priority Level</Label>
                                    <Select value={priorityFilter} onValueChange={(v) => handleFilterChange('priority', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select priority level..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Levels</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground">Priority Type</Label>
                                    <Select value={priorityTypeFilter} onValueChange={(v) => handleFilterChange('priorityType', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select priority type..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Types</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground">Department</Label>
                                    <Select value={departmentFilter} onValueChange={(v) => handleFilterChange('department', v)}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select department..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Departments</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id_department} value={dept.nama_department}>{dept.nama_department}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter className="mt-6 gap-2">
                                <Button variant="outline" onClick={clearFilters} className="group gap-2 rounded-full px-5">
                                    <X className="size-4" />
                                    Clear All
                                </Button>
                                <Button onClick={handleSearch} className="group gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-md active:scale-[0.97]">
                                    <Filter className="size-4" />
                                    Apply Filters
                                    <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all group-hover:translate-x-0.5"><Filter className="size-3" /></span>
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Results Count & Sort */}
                <div className="animate-fade-in animate-delay-200 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {workOrders.total > 0 ? (
                            <>Showing <span className="font-semibold text-foreground">{workOrders.from}</span> to <span className="font-semibold text-foreground">{workOrders.to}</span> of <span className="font-semibold text-foreground">{workOrders.total}</span> work orders</>
                        ) : 'No work orders found'}
                    </p>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="size-4 text-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <select value={sortBy} onChange={(e) => handleSortChange(e.target.value as any)}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <option value="date">Date</option>
                            <option value="priority">Priority</option>
                            <option value="status">Status</option>
                            <option value="no_work_order">WO Number</option>
                        </select>
                        <button onClick={toggleSortDirection}
                            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground transition-all duration-300 hover:bg-accent focus:border-primary focus:ring-2 focus:ring-primary/20"
                            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}>
                            {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
                        </button>
                    </div>
                </div>

                {/* Work Orders Grid — Double-Bezel Cards */}
                {workOrders.data.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {workOrders.data.map((wo, idx) => {
                            const statusConf = getStatusConfig(wo.status_pekerjaan);
                            const priorityConf = getPriorityConfig(wo.prioritas);
                            const StatusIcon = statusConf.icon;

                            return (
                                <div
                                    key={wo.id_work_order}
                                    className={`animate-fade-in animate-delay-${(idx % 8) * 50 + 200} rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]`}
                                >
                                    <div className="group relative flex flex-col overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg active:scale-[0.99]">
                                        {/* Top accent bar based on priority */}
                                        <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${priorityConf.badge} z-10`} />

                                        <div className="flex flex-1 flex-col p-5">
                                            {/* Header Section */}
                                            <div className="mb-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-mono text-xs font-semibold text-primary">
                                                            {wo.no_work_order}
                                                        </p>
                                                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                                                            {wo.rincian_pekerjaan || 'No Description'}
                                                        </h3>
                                                    </div>
                                                    <Link
                                                        href={`/work-orders/${wo.id_work_order}`}
                                                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent hover:text-primary"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Status & Priority Badges */}
                                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all ${statusConf.bg}`}>
                                                    <span className={`size-1.5 rounded-full ${statusConf.dot}`} />
                                                    {statusConf.label}
                                                </span>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityConf.bg}`}>
                                                    {priorityConf.label}
                                                </span>
                                                {wo.priority_type && (
                                                    <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                        {wo.priority_type}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div className="mb-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                                            {/* Information Grid */}
                                            <div className="flex flex-col gap-3 text-sm">
                                                {wo.tgl_work_order && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                                            <Calendar className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Date</span>
                                                            <span className="font-medium text-foreground">{formatDate(wo.tgl_work_order)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {(wo.department || wo.department_tujuan) && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/5 text-purple-600 dark:text-purple-400">
                                                            <Building2 className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Department</span>
                                                            <span className="truncate font-medium text-foreground">{wo.department || wo.department_tujuan}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {(wo.pic || wo.user_requester) && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                                            <User className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Requester</span>
                                                            <span className="truncate font-medium text-foreground">{wo.pic || wo.user_requester}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {wo.assigned_employees && wo.assigned_employees.length > 0 && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/5 text-orange-600 dark:text-orange-400">
                                                            <User className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Team</span>
                                                            <span className="font-medium text-foreground">{wo.assigned_employees.length} member{wo.assigned_employees.length > 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {wo.budget && parseFloat(wo.budget) > 0 && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/5 text-amber-600 dark:text-amber-400">
                                                            <DollarSign className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Budget</span>
                                                            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(wo.budget)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="border-t border-border/50 bg-accent/30 px-5 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <StatusIcon className="size-3.5 text-muted-foreground" />
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {wo.status_pekerjaan ? wo.status_pekerjaan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {wo.status_pekerjaan === 'pending_hod_review' && (
                                                        <Link href={`/work-orders/${wo.id_work_order}/hod-review`}>
                                                            <Button size="sm" variant="outline" className="group h-7 rounded-full border-border/60 px-3 text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent active:scale-[0.95]">
                                                                Review
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {(wo.status_pekerjaan === 'hod_approved' || wo.status_pekerjaan === 'scheduled') && (
                                                        <Link href={`/work-orders/${wo.id_work_order}/assign`}>
                                                            <Button size="sm" variant="outline" className="group h-7 rounded-full border-border/60 px-3 text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent active:scale-[0.95]">
                                                                Assign
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {wo.status_pekerjaan === 'assigned' && (
                                                        <Link href={`/work-orders/${wo.id_work_order}/submit-results`}>
                                                            <Button size="sm" variant="outline" className="group h-7 rounded-full border-border/60 px-3 text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent active:scale-[0.95]">
                                                                Submit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {wo.status_pekerjaan === 'pending_verification' && (
                                                        <Link href={`/work-orders/${wo.id_work_order}/verify`}>
                                                            <Button size="sm" variant="outline" className="group h-7 rounded-full border-border/60 px-3 text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent active:scale-[0.95]">
                                                                Verify
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground/60">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    Created {new Date(wo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <Link
                                                    href={`/work-orders/${wo.id_work_order}`}
                                                    className="group/link flex items-center gap-1 font-medium text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary/70"
                                                >
                                                    View Details
                                                    <span className="inline-block transition-transform duration-500 group-hover/link:translate-x-0.5">→</span>
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
                    <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-dashed border-border/50 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="flex flex-col items-center justify-center rounded-[calc(1.5rem-0.375rem)] bg-background py-16 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
                                <ClipboardList className="size-7 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-foreground">No work orders found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'No work orders have been created yet.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button variant="outline" size="sm" className="mt-4 gap-1.5 rounded-full px-5" onClick={clearFilters}>
                                    <X className="size-3.5" />
                                    Clear filters
                                </Button>
                            ) : (
                                <Link href="/work-orders/create">
                                    <Button size="sm" className="group mt-4 gap-1.5 rounded-full bg-primary px-5 text-primary-foreground shadow-md active:scale-[0.97]">
                                        <Plus className="size-3.5" />
                                        Create Work Order
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination — Double-Bezel */}
                {workOrders.last_page > 1 && (
                    <div className="animate-fade-in animate-delay-500 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[calc(1.5rem-0.375rem)] bg-background px-6 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <p className="text-sm text-muted-foreground">
                            Showing {workOrders.from || 0} to{' '}
                            {workOrders.to || 0} of <span className="font-semibold text-foreground">{workOrders.total}</span> results
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => {
 const p = new URLSearchParams(location.search); p.set('page', '1'); router.get(`${workOrdersIndex.url()}?${p.toString()}`, {}, { preserveState: true }); 
}}
                                disabled={workOrders.current_page === 1}
                                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">&laquo;</button>
                            <button onClick={() => {
 const p = new URLSearchParams(location.search); p.set('page', String(workOrders.current_page - 1)); router.get(`${workOrdersIndex.url()}?${p.toString()}`, {}, { preserveState: true }); 
}}
                                disabled={workOrders.current_page === 1}
                                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">&lsaquo;</button>

                            {(() => {
                                const cp = workOrders.current_page, lp = workOrders.last_page;
                                const pages: (number | string)[] = [];

                                if (lp <= 7) {
 for (let i = 1; i <= lp; i++) {
pages.push(i);
} 
} else {
                                    pages.push(1);

                                    if (cp <= 3) {
pages.push(2, 3, 4, 5, '...', lp);
} else if (cp >= lp - 2) {
pages.push('...', lp - 4, lp - 3, lp - 2, lp - 1, lp);
} else {
pages.push('...', cp - 1, cp, cp + 1, '...', lp);
}
                                }

                                return pages.map((page, i) => {
                                    if (page === '...') {
return <span key={`e-${i}`} className="flex size-9 items-center justify-center text-sm text-muted-foreground/50">...</span>;
}

                                    const pn = page as number, active = pn === cp;

                                    return <button key={pn} onClick={() => {
 const p = new URLSearchParams(location.search); p.set('page', String(pn)); router.get(`${workOrdersIndex.url()}?${p.toString()}`, {}, { preserveState: true }); 
}}
                                        className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'}`}>{pn}</button>;
                                });
                            })()}

                            <button onClick={() => {
 const p = new URLSearchParams(location.search); p.set('page', String(workOrders.current_page + 1)); router.get(`${workOrdersIndex.url()}?${p.toString()}`, {}, { preserveState: true }); 
}}
                                disabled={workOrders.current_page === workOrders.last_page}
                                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">&rsaquo;</button>
                            <button onClick={() => {
 const p = new URLSearchParams(location.search); p.set('page', String(workOrders.last_page)); router.get(`${workOrdersIndex.url()}?${p.toString()}`, {}, { preserveState: true }); 
}}
                                disabled={workOrders.current_page === workOrders.last_page}
                                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40">&raquo;</button>
                        </div>
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
