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
                    <Link href={workOrdersCreate()}>
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

                {/* Search & Filter Button */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Search work orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="h-11 pl-10 transition-all focus-visible:ring-[#0071b7]/50"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSearch}
                                className="h-11 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 transition-all hover:shadow-lg hover:shadow-[#0071b7]/30"
                            >
                                Search
                            </Button>
                            <Button
                                variant={hasActiveFilters ? 'default' : 'outline'}
                                onClick={() => setShowFilterModal(true)}
                                className={`h-11 gap-2 transition-all ${hasActiveFilters
                                    ? 'bg-[#0071b7] text-white shadow-md hover:bg-[#0089cc]'
                                    : ''
                                    }`}
                            >
                                <SlidersHorizontal className="size-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0071b7]">
                                        {
                                            [
                                                statusFilter,
                                                priorityFilter,
                                                departmentFilter,
                                                priorityTypeFilter,
                                            ].filter(Boolean).length
                                        }
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filter Modal */}
                <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Filter className="size-5 text-[#0071b7]" />
                                Filter Work Orders
                            </DialogTitle>
                            <DialogDescription>
                                Narrow down work orders by applying filters below
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Status
                                </Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
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

                            {/* Priority Level Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Priority Level
                                </Label>
                                <Select
                                    value={priorityFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('priority', value)
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select priority level..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Levels</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Priority Type
                                </Label>
                                <Select
                                    value={priorityTypeFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('priorityType', value)
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select priority type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Department
                                </Label>
                                <Select
                                    value={departmentFilter}
                                    onValueChange={(value) =>
                                        handleFilterChange('department', value)
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select department..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id_department} value={dept.nama_department}>
                                                {dept.nama_department}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="gap-2"
                            >
                                <X className="size-4" />
                                Clear All
                            </Button>
                            <Button
                                onClick={handleSearch}
                                className="gap-2 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md"
                            >
                                <Filter className="size-4" />
                                Apply Filters
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Results Count & Sort */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {workOrders.total > 0 ? (
                            <>
                                Showing{' '}
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                    {workOrders.from}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                    {workOrders.to}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                    {workOrders.total}
                                </span>{' '}
                                work orders
                            </>
                        ) : (
                            'No work orders found'
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="size-4 text-neutral-400" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value as 'date' | 'priority' | 'status' | 'no_work_order')}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm transition-all focus:border-[#0071b7] focus:outline-none focus:ring-2 focus:ring-[#0071b7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="date">Date</option>
                            <option value="priority">Priority</option>
                            <option value="status">Status</option>
                            <option value="no_work_order">WO Number</option>
                        </select>
                        <button
                            onClick={toggleSortDirection}
                            className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm transition-all hover:bg-neutral-50 focus:border-[#0071b7] focus:outline-none focus:ring-2 focus:ring-[#0071b7]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
                        </button>
                    </div>
                </div>

                {/* Work Orders Grid */}
                {workOrders.data.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {workOrders.data.map((wo) => {
                            const statusConf = getStatusConfig(wo.status_pekerjaan);
                            const priorityConf = getPriorityConfig(wo.prioritas);
                            const StatusIcon = statusConf.icon;

                            return (
                                <div
                                    key={wo.id_work_order}
                                    className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200/50 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                                >
                                    {/* Top accent bar based on priority */}
                                    <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${priorityConf.badge}`} />

                                    <div className="flex flex-1 flex-col p-5">
                                        {/* Header Section */}
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="font-mono text-xs font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                                        {wo.no_work_order}
                                                    </p>
                                                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-tight text-neutral-900 dark:text-white">
                                                        {wo.rincian_pekerjaan || 'No Description'}
                                                    </h3>
                                                </div>
                                                <Link
                                                    href={`/work-orders/${wo.id_work_order}`}
                                                    className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-[#0071b7] dark:hover:bg-neutral-800 dark:hover:text-[#0093dd]"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Status & Priority Badges */}
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusConf.bg}`}
                                            >
                                                <span className={`size-2 rounded-full ${statusConf.dot}`} />
                                                {statusConf.label}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityConf.bg}`}
                                            >
                                                {priorityConf.label}
                                            </span>
                                            {wo.priority_type && (
                                                <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    {wo.priority_type}
                                                </span>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                                        {/* Information Grid */}
                                        <div className="flex flex-col gap-3 text-sm">
                                            {/* Date */}
                                            {wo.tgl_work_order && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                                                        <Calendar className="size-4 text-[#0071b7] dark:text-[#0093dd]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                            Date
                                                        </span>
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {formatDate(wo.tgl_work_order)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Department */}
                                            {(wo.department || wo.department_tujuan) && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10">
                                                        <Building2 className="size-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                            Department
                                                        </span>
                                                        <span className="truncate font-medium text-neutral-900 dark:text-white">
                                                            {wo.department || wo.department_tujuan}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Requester/Assignee */}
                                            {(wo.pic || wo.user_requester) && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
                                                        <User className="size-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                            Requester
                                                        </span>
                                                        <span className="truncate font-medium text-neutral-900 dark:text-white">
                                                            {wo.pic || wo.user_requester}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assigned Team */}
                                            {wo.assigned_employees && wo.assigned_employees.length > 0 && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
                                                        <User className="size-4 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                            Team
                                                        </span>
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {wo.assigned_employees.length} member{wo.assigned_employees.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Budget */}
                                            {wo.budget && parseFloat(wo.budget) > 0 && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                                        <DollarSign className="size-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                            Budget
                                                        </span>
                                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                            {formatCurrency(wo.budget)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1.5">
                                                <StatusIcon className="size-3.5" />
                                                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                    {wo.status_pekerjaan ? wo.status_pekerjaan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending'}
                                                </span>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex items-center gap-1.5">
                                                {wo.status_pekerjaan === 'pending_hod_review' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/hod-review`}>
                                                        <Button size="sm" variant="outline" className="h-7 rounded-lg bg-white text-xs font-medium shadow-sm hover:bg-neutral-50">
                                                            Review
                                                        </Button>
                                                    </Link>
                                                )}
                                                {(wo.status_pekerjaan === 'hod_approved' || wo.status_pekerjaan === 'scheduled') && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/assign`}>
                                                        <Button size="sm" variant="outline" className="h-7 rounded-lg bg-white text-xs font-medium shadow-sm hover:bg-neutral-50">
                                                            Assign
                                                        </Button>
                                                    </Link>
                                                )}
                                                {wo.status_pekerjaan === 'assigned' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/submit-results`}>
                                                        <Button size="sm" variant="outline" className="h-7 rounded-lg bg-white text-xs font-medium shadow-sm hover:bg-neutral-50">
                                                            Submit
                                                        </Button>
                                                    </Link>
                                                )}
                                                {wo.status_pekerjaan === 'pending_verification' && (
                                                    <Link href={`/work-orders/${wo.id_work_order}/verify`}>
                                                        <Button size="sm" variant="outline" className="h-7 rounded-lg bg-white text-xs font-medium shadow-sm hover:bg-neutral-50">
                                                            Verify
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Created Date */}
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                Created {new Date(wo.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <Link
                                                href={`/work-orders/${wo.id_work_order}`}
                                                className="font-medium text-[#0071b7] transition-colors hover:text-[#005a94] dark:text-[#0093dd] dark:hover:text-[#0071b7]"
                                            >
                                                View Details →
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200/60 bg-white px-6 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing {workOrders.from || 0} to{' '}
                            {workOrders.to || 0} of {workOrders.total} results
                        </p>
                        <div className="flex items-center gap-1">
                            {/* First Page */}
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.set('page', '1');
                                    router.get(`${workOrdersIndex.url()}?${params.toString()}`, {}, { preserveState: true });
                                }}
                                disabled={workOrders.current_page === 1}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                &laquo;
                            </button>

                            {/* Previous Page */}
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.set('page', String(workOrders.current_page - 1));
                                    router.get(`${workOrdersIndex.url()}?${params.toString()}`, {}, { preserveState: true });
                                }}
                                disabled={workOrders.current_page === 1}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                &lsaquo;
                            </button>

                            {/* Page Numbers with Ellipsis */}
                            {(() => {
                                const currentPage = workOrders.current_page;
                                const lastPage = workOrders.last_page;
                                const pages: (number | string)[] = [];

                                if (lastPage <= 7) {
                                    // Show all pages if 7 or fewer
                                    for (let i = 1; i <= lastPage; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Always show first page
                                    pages.push(1);

                                    if (currentPage <= 3) {
                                        // Near start: 1 2 3 4 5 .. last
                                        pages.push(2, 3, 4, 5, '...', lastPage);
                                    } else if (currentPage >= lastPage - 2) {
                                        // Near end: 1 .. last-4 last-3 last-2 last-1 last
                                        pages.push('...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
                                    } else {
                                        // Middle: 1 .. current-1 current current+1 .. last
                                        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
                                    }
                                }

                                return pages.map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="px-2 py-1.5 text-sm text-neutral-400 dark:text-neutral-500"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    const pageNum = page as number;
                                    const isCurrentPage = pageNum === currentPage;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => {
                                                const params = new URLSearchParams(window.location.search);
                                                params.set('page', String(pageNum));
                                                router.get(`${workOrdersIndex.url()}?${params.toString()}`, {}, { preserveState: true });
                                            }}
                                            className={`min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${isCurrentPage
                                                ? 'border-[#0071b7] bg-[#0071b7] text-white shadow-md'
                                                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                });
                            })()}

                            {/* Next Page */}
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.set('page', String(workOrders.current_page + 1));
                                    router.get(`${workOrdersIndex.url()}?${params.toString()}`, {}, { preserveState: true });
                                }}
                                disabled={workOrders.current_page === workOrders.last_page}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                &rsaquo;
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(window.location.search);
                                    params.set('page', String(workOrders.last_page));
                                    router.get(`${workOrdersIndex.url()}?${params.toString()}`, {}, { preserveState: true });
                                }}
                                disabled={workOrders.current_page === workOrders.last_page}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                &raquo;
                            </button>
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
