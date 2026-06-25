import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    DollarSign,
    User,
    Building2,
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Users,
    TrendingUp,
    ClipboardList,
    Edit,
    Camera,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workOrdersIndex } from '@/routes/work-orders';

type AssignedEmployee = {
    id: number;
    name: string;
};

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
    location_type: string | null;
    tenant_id: number | null;
    tenant_name: string | null;
    hod_action: string | null;
    scheduled_date: string | null;
    assigned_employees: AssignedEmployee[] | null;
    personnel_count: number | null;
    budget: string | null;
    keterangan: string | null;
    incident_photos: string[] | null;
    completion_results: string | null;
    verified_by: number | null;
    verified_at: string | null;
    verification_notes: string | null;
    modified_user: number | null;
    user: string | null;
    department: string | null;
    pic: string | null;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    workOrder: WorkOrder;
};

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

    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatDateTime(date: string | null): string {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getPriorityIcon(priorityType: string | null) {
    if (priorityType === 'urgent') {
        return <AlertTriangle className="size-4 text-red-500" />;
    }

    return <TrendingUp className="size-4 text-emerald-500" />;
}

export default function WorkOrderShow({ workOrder }: PageProps) {
    const isUrgent = workOrder.priority_type === 'urgent';
    const isByAccident = workOrder.urgent_sub_type === 'by_accident';

    const getNextAction = () => {
        switch (workOrder.status_pekerjaan) {
            case 'pending_hod_review':
                return { label: 'Review', href: `/work-orders/${workOrder.id_work_order}/hod-review` };
            case 'hod_approved':
            case 'scheduled':
                return { label: 'Assign Team', href: `/work-orders/${workOrder.id_work_order}/assign` };
            case 'assigned':
                return { label: 'Submit Results', href: `/work-orders/${workOrder.id_work_order}/submit-results` };
            case 'pending_verification':
                return { label: 'Verify', href: `/work-orders/${workOrder.id_work_order}/verify` };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();

    return (
        <>
            <Head title={`Work Order - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Back Link & Actions */}
                <div className="flex items-center justify-between">
                    <Link
                        href={workOrdersIndex.url()}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Work Orders
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href={`/work-orders/${workOrder.id_work_order}/edit`}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="size-4" />
                                Edit
                            </Button>
                        </Link>
                        {nextAction && (
                            <Link href={nextAction.href}>
                                <Button className="gap-2 bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 transition-all hover:shadow-lg hover:shadow-[#0071b7]/30">
                                    <Edit className="size-4" />
                                    {nextAction.label}
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this work order?')) {
                                    router.delete(`/work-orders/${workOrder.id_work_order}`, {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Header */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <p className="font-mono text-sm font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                    {workOrder.no_work_order}
                                </p>
                                <StatusBadge status={workOrder.status_pekerjaan || 'pending_hod_review'} />
                                {isUrgent && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                        <AlertTriangle className="size-3" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                {workOrder.rincian_pekerjaan || 'No Description'}
                            </h1>
                            {workOrder.department && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <Building2 className="size-4" />
                                    <span>{workOrder.department}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Urgent Warning */}
                {isUrgent && isByAccident && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-500/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 size-6 text-red-600 dark:text-red-400" />
                            <div>
                                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                    Urgent By Accident
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                    This work order requires immediate execution. Scheduling is not permitted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Work Order Details */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Work Order Details
                                </h2>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-neutral-500">Work Order Date</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="size-4 text-neutral-400" />
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {formatDate(workOrder.tgl_work_order)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-neutral-500">Location Type</Label>
                                    <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                        {workOrder.location_type || '-'}
                                    </p>
                                </div>
                                {workOrder.location_type === 'tenant' ? (
                                    <div className="sm:col-span-2">
                                        <Label className="text-xs text-neutral-500">Tenant</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Building2 className="size-4 text-neutral-400" />
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {workOrder.tenant_name || '-'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    workOrder.lokasi && (
                                        <div className="sm:col-span-2">
                                            <Label className="text-xs text-neutral-500">Location</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <MapPin className="size-4 text-neutral-400" />
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {workOrder.lokasi}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                                {workOrder.keterangan && (
                                    <div className="sm:col-span-2">
                                        <Label className="text-xs text-neutral-500">Description / Notes</Label>
                                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                            {workOrder.keterangan}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Priority & Classification */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <AlertTriangle className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Priority & Classification
                                </h2>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-neutral-500">Priority Type</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getPriorityIcon(workOrder.priority_type)}
                                        <p className="text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                            {workOrder.priority_type || 'normal'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-neutral-500">Priority Level</Label>
                                    <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                        {workOrder.prioritas || 'medium'}
                                    </p>
                                </div>
                                {workOrder.urgent_sub_type && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">Urgent Sub-Type</Label>
                                        <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                            {workOrder.urgent_sub_type.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                )}
                                {workOrder.level && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">Level</Label>
                                        <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                            {workOrder.level}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned Team */}
                        {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Users className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Assigned Team
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {workOrder.assigned_employees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center gap-2 rounded-full bg-[#0071b7]/5 px-4 py-2 dark:bg-[#0093dd]/10"
                                        >
                                            <User className="size-4 text-[#0071b7] dark:text-[#0093dd]" />
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {employee.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {workOrder.personnel_count && (
                                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                                        Total Personnel: <span className="font-semibold">{workOrder.personnel_count}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Completion Results */}
                        {workOrder.completion_results && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Completion Results
                                    </h2>
                                </div>
                                <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-white">
                                    {workOrder.completion_results}
                                </p>
                            </div>
                        )}

                        {/* Incident Photos */}
                        {workOrder.incident_photos && workOrder.incident_photos.length > 0 && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Camera className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Incident Photos ({workOrder.incident_photos.length})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {workOrder.incident_photos.map((photo, index) => {
                                        const photoUrl = photo.startsWith('http')
                                            ? photo
                                            : `/storage/${photo}`;

                                        return (
                                            <a
                                                key={index}
                                                href={photoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 transition-all hover:shadow-lg dark:border-neutral-700"
                                            >
                                                <img
                                                    src={photoUrl}
                                                    alt={`Incident photo ${index + 1}`}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                                                    <div className="rounded-full bg-white/90 p-2">
                                                        <Camera className="size-4 text-[#0071b7]" />
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Timeline */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Clock className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Status & Timeline
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-neutral-500">Current Status</Label>
                                    <div className="mt-2">
                                        <StatusBadge status={workOrder.status_pekerjaan || 'pending_hod_review'} />
                                    </div>
                                </div>
                                {workOrder.hod_action && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">HOD Action</Label>
                                        <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                            {workOrder.hod_action.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                )}
                                {workOrder.scheduled_date && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">Scheduled Date</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Calendar className="size-4 text-neutral-400" />
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {formatDate(workOrder.scheduled_date)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {workOrder.verified_at && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">Verified At</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {formatDateTime(workOrder.verified_at)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {workOrder.verification_notes && (
                                    <div>
                                        <Label className="text-xs text-neutral-500">Verification Notes</Label>
                                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                            {workOrder.verification_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        {workOrder.budget && (
                            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6 shadow-sm dark:border-amber-800/60 dark:bg-amber-500/5">
                                <div className="mb-2 flex items-center gap-2">
                                    <DollarSign className="size-5 text-amber-600 dark:text-amber-400" />
                                    <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                                        Budget
                                    </h2>
                                </div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {formatCurrency(workOrder.budget)}
                                </p>
                            </div>
                        )}

                        {/* Personnel Info */}
                        {(workOrder.pic || workOrder.user) && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <User className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Personnel
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {workOrder.pic && (
                                        <div>
                                            <Label className="text-xs text-neutral-500">Person In Charge</Label>
                                            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                                {workOrder.pic}
                                            </p>
                                        </div>
                                    )}
                                    {workOrder.user && (
                                        <div>
                                            <Label className="text-xs text-neutral-500">Created By</Label>
                                            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                                {workOrder.user}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Created & Updated */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center gap-2">
                                <ClipboardList className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Metadata
                                </h2>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Created</span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        {formatDateTime(workOrder.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-500 dark:text-neutral-400">Last Updated</span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        {formatDateTime(workOrder.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Simple inline Label component
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`text-xs font-medium text-neutral-500 dark:text-neutral-400 ${className}`}>
            {children}
        </span>
    );
}

WorkOrderShow.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Work Order Details',
            href: '#',
        },
    ],
};
