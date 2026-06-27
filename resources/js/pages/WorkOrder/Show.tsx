import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    Building2,
    FileText,
    AlertTriangle,
    Clock,
    Edit,
    Camera,
    Trash2,
    Hash,
    Tag,
    MessageSquare,
    Image as ImageIcon,
    ClipboardCheck,
    UserCheck,
    CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workOrdersIndex } from '@/routes/work-orders';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    tgl_work_order: string | null;
    rincian_pekerjaan: string | null;
    department_tujuan: string | null;
    lokasi: string | null;
    tenant_id: string | null;
    priority_type: string | null;
    urgent_sub_type: string | null;
    prioritas: string | null;
    status_tiket: string | null;
    status_pekerjaan: string | null;
    user_requester: string | null;
    keterangan: string | null;
    incident_photos_urls: string[];
    scheduled_date: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
    personnel_count: number | null;
    completion_results: string | null;
    created_at: string;
    updated_at: string;
};

type PageProps = {
    workOrder: WorkOrder;
};

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

function getPriorityConfig(priorityType: string | null, prioritas: string | null) {
    const isUrgent = priorityType === 'urgent';

    const levelColors = {
        low: {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            icon: 'bg-emerald-100 dark:bg-emerald-500/20',
        },
        medium: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-200 dark:border-amber-500/30',
            text: 'text-amber-700 dark:text-amber-400',
            icon: 'bg-amber-100 dark:bg-amber-500/20',
        },
        high: {
            bg: 'bg-red-50 dark:bg-red-500/10',
            border: 'border-red-200 dark:border-red-500/30',
            text: 'text-red-700 dark:text-red-400',
            icon: 'bg-red-100 dark:bg-red-500/20',
        },
    };

    const level = (prioritas as keyof typeof levelColors) || 'medium';
    const colors = levelColors[level] || levelColors.medium;

    return { isUrgent, level, colors };
}

export default function WorkOrderShow({ workOrder }: PageProps) {
    const { isUrgent, level, colors } = getPriorityConfig(workOrder.priority_type, workOrder.prioritas);
    const isByAccident = workOrder.urgent_sub_type === 'by_accident';

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

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <Hash className="size-3.5" />
                                {workOrder.no_work_order}
                            </div>
                            <StatusBadge status={workOrder.status_tiket || 'Pending HOD'} />
                            {isUrgent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                                    <AlertTriangle className="size-3" />
                                    Urgent
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            {workOrder.rincian_pekerjaan || 'No Description'}
                        </h1>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
                            {workOrder.department_tujuan && (
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="size-4" />
                                    <span>{workOrder.department_tujuan}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                <span>{formatDate(workOrder.tgl_work_order)}</span>
                            </div>
                            {workOrder.user_requester && (
                                <div className="flex items-center gap-1.5">
                                    <User className="size-4" />
                                    <span>by {workOrder.user_requester}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Urgent Warning */}
                {isUrgent && isByAccident && (
                    <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-5 dark:border-red-500/30 dark:from-red-500/10 dark:to-red-500/5">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
                                <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                                    Immediate Execution Required
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                    This is an urgent work order by accident. Scheduling is not permitted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Work Order Info Card */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071b7] to-[#0093dd] shadow-sm">
                                    <FileText className="size-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Work Order Details
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Core information about this request
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                        <Calendar className="size-3.5" />
                                        Work Order Date
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {formatDate(workOrder.tgl_work_order)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                        <Building2 className="size-3.5" />
                                        Department
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {workOrder.department_tujuan || '-'}
                                    </p>
                                </div>

                                <div className="sm:col-span-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                        <MapPin className="size-3.5" />
                                        Location
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {workOrder.lokasi || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Priority Card */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                                    <AlertTriangle className="size-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Priority & Classification
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Urgency and priority level
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className={`rounded-xl border-2 p-4 ${colors.border} ${colors.bg}`}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className={`flex size-8 items-center justify-center rounded-lg ${colors.icon}`}>
                                            <Tag className={`size-4 ${colors.text}`} />
                                        </div>
                                        <span className={`text-xs font-semibold ${colors.text}`}>
                                            Priority Level
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold capitalize text-neutral-900 dark:text-white">
                                        {workOrder.prioritas || 'medium'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className={`flex size-8 items-center justify-center rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                                            {isUrgent ? (
                                                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                            Type
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold capitalize text-neutral-900 dark:text-white">
                                        {workOrder.priority_type || 'normal'}
                                    </p>
                                    {workOrder.urgent_sub_type && (
                                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            {workOrder.urgent_sub_type.replace(/_/g, ' ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        {workOrder.keterangan && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                                        <MessageSquare className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Notes & Remarks
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Additional context for this work order
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                                        {workOrder.keterangan}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Incident Photos */}
                        {workOrder.incident_photos_urls && workOrder.incident_photos_urls.length > 0 && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-sm">
                                        <Camera className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Incident Photos
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {workOrder.incident_photos_urls.length} photo(s) attached
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {workOrder.incident_photos_urls.map((photoUrl, index) => (
                                        <a
                                            key={index}
                                            href={photoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 transition-all hover:shadow-lg dark:border-neutral-700"
                                        >
                                            <img
                                                src={photoUrl}
                                                alt={`Incident photo ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                                                <div className="rounded-full bg-white/90 p-2">
                                                    <ImageIcon className="size-4 text-[#0071b7]" />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071b7] to-[#0093dd] shadow-sm">
                                    <Clock className="size-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Status
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Current workflow state
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        Current Status
                                    </p>
                                    <StatusBadge status={workOrder.status_tiket || 'Pending HOD'} />
                                </div>

                                <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Created</span>
                                    <span className="text-xs font-medium text-neutral-900 dark:text-white">
                                        {formatDateTime(workOrder.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Last Updated</span>
                                    <span className="text-xs font-medium text-neutral-900 dark:text-white">
                                        {formatDateTime(workOrder.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Requester Card */}
                        {workOrder.user_requester && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                                        <User className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Requester
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Who created this order
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[#0071b7]/10 dark:bg-[#0093dd]/20">
                                        <User className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {workOrder.user_requester}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Requester
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workflow Actions Card */}
                        {workOrder.status_pekerjaan && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                                        <ClipboardCheck className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Workflow Actions
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            HOD workflow steps
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {workOrder.status_pekerjaan === 'pending_hod_review' && (
                                        <Link
                                            href={`/work-orders/${workOrder.id_work_order}/hod-review`}
                                            className="flex w-full items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition-all hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/20"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                                                <ClipboardCheck className="size-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                                    HOD Review Required
                                                </p>
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    Review and approve this work order
                                                </p>
                                            </div>
                                        </Link>
                                    )}

                                    {workOrder.status_pekerjaan === 'hod_approved' && (
                                        <Link
                                            href={`/work-orders/${workOrder.id_work_order}/assign`}
                                            className="flex w-full items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/20"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                                <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                                                    Assign Team
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    Select employees to execute
                                                </p>
                                            </div>
                                        </Link>
                                    )}

                                    {(workOrder.status_pekerjaan === 'scheduled' ||
                                        workOrder.status_pekerjaan === 'assigned' ||
                                        workOrder.status_pekerjaan === 'in_progress') && (
                                            <Link
                                                href={`/work-orders/${workOrder.id_work_order}/submit-results`}
                                                className="flex w-full items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/20"
                                            >
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                                        Submit Results
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                        Report work completion
                                                    </p>
                                                </div>
                                            </Link>
                                        )}

                                    {workOrder.status_pekerjaan === 'pending_verification' && (
                                        <Link
                                            href={`/work-orders/${workOrder.id_work_order}/verify`}
                                            className="flex w-full items-center gap-3 rounded-xl border-2 border-purple-200 bg-purple-50 p-4 text-left transition-all hover:border-purple-300 hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:hover:border-purple-500/50 dark:hover:bg-purple-500/20"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20">
                                                <CheckCircle2 className="size-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
                                                    Verify Completion
                                                </p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                                    Review and verify results
                                                </p>
                                            </div>
                                        </Link>
                                    )}

                                    {workOrder.status_pekerjaan === 'completed' && (
                                        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                                        Completed
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                        This work order is finished
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.status_pekerjaan === 'rejected' && (
                                        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
                                                    <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-red-800 dark:text-red-300">
                                                        Rejected
                                                    </p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">
                                                        This work order was rejected
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assigned Team Card */}
                        {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm">
                                        <UserCheck className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Assigned Team
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {workOrder.personnel_count || workOrder.assigned_employees.length} member(s)
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {workOrder.assigned_employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
                                        >
                                            <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
                                                <User className="size-4 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {emp.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scheduled Date Card */}
                        {workOrder.scheduled_date && (
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm">
                                        <Calendar className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Scheduled Date
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            When execution is planned
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {formatDate(workOrder.scheduled_date)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Completion Results Card */}
                        {workOrder.completion_results && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                            Completion Results
                                        </h2>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                            Submitted work results
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-white p-4 dark:bg-neutral-900">
                                    <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-white">
                                        {workOrder.completion_results}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
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
