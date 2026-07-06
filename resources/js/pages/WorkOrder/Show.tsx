import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, User, Building2, FileText, AlertTriangle, Clock, Edit, Camera, Trash2, Hash, Tag, MessageSquare, Image as ImageIcon, ClipboardCheck, UserCheck, CheckCircle2 } from 'lucide-react';
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

type PageProps = { workOrder: WorkOrder };

function formatDate(date: string | null): string {
    if (!date) {
return '-';
}

    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(date: string | null): string {
    if (!date) {
return '-';
}

    return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getPriorityConfig(priorityType: string | null, prioritas: string | null) {
    const isUrgent = priorityType === 'urgent';
    const levelColors = {
        low: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-500/20' },
        medium: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-500/20' },
        high: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-700 dark:text-red-400', icon: 'bg-red-100 dark:bg-red-500/20' },
    };
    const level = (prioritas as keyof typeof levelColors) || 'medium';
    const colors = levelColors[level] || levelColors.medium;

    return { isUrgent, level, colors };
}

export default function WorkOrderShow({ workOrder }: PageProps) {
    const { isUrgent, colors } = getPriorityConfig(workOrder.priority_type, workOrder.prioritas);
    const isByAccident = workOrder.urgent_sub_type === 'by_accident';

    return (
        <>
            <Head title={`Work Order - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Back & Actions */}
                <div className="animate-fade-in flex items-center justify-between">
                    <Link href={workOrdersIndex.url()} className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10"><ArrowLeft className="size-4" /></span>
                        Back to Work Orders
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href={`/work-orders/${workOrder.id_work_order}/edit`}>
                            <Button variant="outline" className="group gap-2 rounded-full px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]">
                                <Edit className="size-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="outline" className="gap-2 rounded-full px-5 text-destructive transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-destructive/10 hover:text-destructive active:scale-[0.97]"
                            onClick={() => {
 if (confirm('Are you sure you want to delete this work order?')) {
router.delete(`/work-orders/${workOrder.id_work_order}`, { preserveScroll: true });
} 
}}>
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Hero Header — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[2rem] border border-primary/10 bg-primary/5 p-1.5">
                    <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-primary via-[#0088cc] to-[#0093dd] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] md:px-8 md:py-10">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-[80px]" />
                            <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-white/10 blur-[60px]" />
                        </div>
                        <div className="relative space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-white/90 uppercase backdrop-blur-md">
                                    <Hash className="size-3" />
                                    {workOrder.no_work_order}
                                </span>
                                <StatusBadge status={workOrder.status_tiket || 'Pending HOD'} />
                                {isUrgent && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
                                        <AlertTriangle className="size-3" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{workOrder.rincian_pekerjaan || 'No Description'}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                                {workOrder.department_tujuan && <span className="flex items-center gap-1.5"><Building2 className="size-4" />{workOrder.department_tujuan}</span>}
                                <span className="flex items-center gap-1.5"><Calendar className="size-4" />{formatDate(workOrder.tgl_work_order)}</span>
                                {workOrder.user_requester && <span className="flex items-center gap-1.5"><User className="size-4" />by {workOrder.user_requester}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Urgent Warning */}
                {isUrgent && isByAccident && (
                    <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border-2 border-red-200/40 bg-red-50/60 p-1 dark:border-red-500/20 dark:bg-red-500/5">
                        <div className="flex items-start gap-3 rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20"><AlertTriangle className="size-5 text-red-600 dark:text-red-400" /></div>
                            <div>
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Immediate Execution Required</h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-400">This is an urgent work order by accident. Scheduling is not permitted.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Work Order Info — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-sm"><FileText className="size-5 text-primary-foreground" /></div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-foreground">Work Order Details</h2>
                                        <p className="text-xs text-muted-foreground">Core information about this request</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { icon: Calendar, label: 'Work Order Date', value: formatDate(workOrder.tgl_work_order), color: 'text-primary' },
                                        { icon: Building2, label: 'Department', value: workOrder.department_tujuan || '-', color: 'text-purple-600 dark:text-purple-400' },
                                        { icon: MapPin, label: 'Location', value: workOrder.lokasi || '-', color: 'text-emerald-600 dark:text-emerald-400', span: true },
                                    ].map((f) => (
                                        <div key={f.label} className={`rounded-xl border border-border/40 bg-accent/30 p-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent/60 ${f.span ? 'sm:col-span-2' : ''}`}>
                                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><f.icon className={`size-3.5 ${f.color}`} />{f.label}</div>
                                            <p className="text-sm font-semibold text-foreground">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Priority — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm"><AlertTriangle className="size-5 text-white" /></div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-foreground">Priority & Classification</h2>
                                        <p className="text-xs text-muted-foreground">Urgency and priority level</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${colors.border} ${colors.bg}`}>
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className={`flex size-8 items-center justify-center rounded-lg ${colors.icon}`}><Tag className={`size-4 ${colors.text}`} /></div>
                                            <span className={`text-xs font-semibold ${colors.text}`}>Priority Level</span>
                                        </div>
                                        <p className="text-lg font-bold capitalize text-foreground">{workOrder.prioritas || 'medium'}</p>
                                    </div>
                                    <div className="rounded-xl border border-border/40 bg-accent/30 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className={`flex size-8 items-center justify-center rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                                                {isUrgent ? <AlertTriangle className="size-4 text-red-600 dark:text-red-400" /> : <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />}
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground">Type</span>
                                        </div>
                                        <p className="text-lg font-bold capitalize text-foreground">{workOrder.priority_type || 'normal'}</p>
                                        {workOrder.urgent_sub_type && <p className="mt-1 text-xs text-muted-foreground">{workOrder.urgent_sub_type.replace(/_/g, ' ')}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes — Double-Bezel */}
                        {workOrder.keterangan && (
                            <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm"><MessageSquare className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Notes & Remarks</h2>
                                            <p className="text-xs text-muted-foreground">Additional context for this work order</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/40 bg-accent/30 p-4"><p className="whitespace-pre-wrap text-sm text-foreground/80">{workOrder.keterangan}</p></div>
                                </div>
                            </div>
                        )}

                        {/* Photos — Double-Bezel */}
                        {workOrder.incident_photos_urls && workOrder.incident_photos_urls.length > 0 && (
                            <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-sm"><Camera className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Incident Photos</h2>
                                            <p className="text-xs text-muted-foreground">{workOrder.incident_photos_urls.length} photo(s) attached</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {workOrder.incident_photos_urls.map((photoUrl, index) => (
                                            <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer" className="group/photo relative aspect-square overflow-hidden rounded-xl border border-border/40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg">
                                                <img src={photoUrl} alt={`Incident photo ${index + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-500 group-hover/photo:bg-black/40 group-hover/photo:opacity-100">
                                                    <div className="rounded-full bg-white/90 p-2 transition-transform duration-500 group-hover/photo:scale-110"><ImageIcon className="size-4 text-primary" /></div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Status — Double-Bezel */}
                        <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                            <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-sm"><Clock className="size-5 text-primary-foreground" /></div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-foreground">Status</h2>
                                        <p className="text-xs text-muted-foreground">Current workflow state</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">Current Status</p>
                                        <StatusBadge status={workOrder.status_tiket || 'Pending HOD'} />
                                    </div>
                                    <div className="h-px bg-border" />
                                    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Created</span><span className="text-xs font-medium text-foreground">{formatDateTime(workOrder.created_at)}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Last Updated</span><span className="text-xs font-medium text-foreground">{formatDateTime(workOrder.updated_at)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Requester — Double-Bezel */}
                        {workOrder.user_requester && (
                            <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm"><User className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Requester</h2>
                                            <p className="text-xs text-muted-foreground">Who created this order</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-accent/30 p-4">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="size-5" /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{workOrder.user_requester}</p>
                                            <p className="text-xs text-muted-foreground">Requester</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workflow Actions — Double-Bezel */}
                        {workOrder.status_pekerjaan && (
                            <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm"><ClipboardCheck className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Workflow Actions</h2>
                                            <p className="text-xs text-muted-foreground">HOD workflow steps</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {workOrder.status_pekerjaan === 'pending_hod_review' && (
                                            <Link href={`/work-orders/${workOrder.id_work_order}/hod-review`} className="group flex w-full items-center gap-3 rounded-xl border-2 border-amber-200/60 bg-amber-50/50 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-amber-300 hover:bg-amber-100/50 dark:border-amber-500/20 dark:bg-amber-500/5 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20"><ClipboardCheck className="size-5 text-amber-600 dark:text-amber-400" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">HOD Review Required</p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">Review and approve this work order</p>
                                                </div>
                                            </Link>
                                        )}
                                        {workOrder.status_pekerjaan === 'hod_approved' && (
                                            <Link href={`/work-orders/${workOrder.id_work_order}/assign`} className="group flex w-full items-center gap-3 rounded-xl border-2 border-blue-200/60 bg-blue-50/50 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-blue-300 hover:bg-blue-100/50 dark:border-blue-500/20 dark:bg-blue-500/5 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20"><UserCheck className="size-5 text-blue-600 dark:text-blue-400" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Assign Team</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Select employees to execute</p>
                                                </div>
                                            </Link>
                                        )}
                                        {(workOrder.status_pekerjaan === 'scheduled' || workOrder.status_pekerjaan === 'assigned' || workOrder.status_pekerjaan === 'in_progress') && (
                                            <Link href={`/work-orders/${workOrder.id_work_order}/submit-results`} className="group flex w-full items-center gap-3 rounded-xl border-2 border-emerald-200/60 bg-emerald-50/50 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-300 hover:bg-emerald-100/50 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20"><CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Submit Results</p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Report work completion</p>
                                                </div>
                                            </Link>
                                        )}
                                        {workOrder.status_pekerjaan === 'pending_verification' && (
                                            <Link href={`/work-orders/${workOrder.id_work_order}/verify`} className="group flex w-full items-center gap-3 rounded-xl border-2 border-purple-200/60 bg-purple-50/50 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-purple-300 hover:bg-purple-100/50 dark:border-purple-500/20 dark:bg-purple-500/5 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20"><CheckCircle2 className="size-5 text-purple-600 dark:text-purple-400" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Verify Completion</p>
                                                    <p className="text-xs text-purple-600 dark:text-purple-400">Review and verify results</p>
                                                </div>
                                            </Link>
                                        )}
                                        {workOrder.status_pekerjaan === 'completed' && (
                                            <div className="rounded-xl border-2 border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20"><CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Completed</p>
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">This work order is finished</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {workOrder.status_pekerjaan === 'rejected' && (
                                            <div className="rounded-xl border-2 border-red-200/60 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20"><AlertTriangle className="size-5 text-red-600 dark:text-red-400" /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-red-800 dark:text-red-300">Rejected</p>
                                                        <p className="text-xs text-red-600 dark:text-red-400">This work order was rejected</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assigned Team — Double-Bezel */}
                        {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                            <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm"><UserCheck className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Assigned Team</h2>
                                            <p className="text-xs text-muted-foreground">{workOrder.personnel_count || workOrder.assigned_employees.length} member(s)</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {workOrder.assigned_employees.map((emp) => (
                                            <div key={emp.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-accent/30 p-3 transition-all duration-300 hover:bg-accent/60">
                                                <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400"><User className="size-4" /></div>
                                                <p className="text-sm font-medium text-foreground">{emp.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scheduled Date — Double-Bezel */}
                        {workOrder.scheduled_date && (
                            <div className="animate-fade-in animate-delay-500 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm"><Calendar className="size-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Scheduled Date</h2>
                                            <p className="text-xs text-muted-foreground">When execution is planned</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-border/40 bg-accent/30 p-4"><p className="text-sm font-semibold text-foreground">{formatDate(workOrder.scheduled_date)}</p></div>
                                </div>
                            </div>
                        )}

                        {/* Completion Results */}
                        {workOrder.completion_results && (
                            <div className="animate-fade-in animate-delay-500 rounded-[1.5rem] border border-emerald-200/30 bg-emerald-50/30 p-1.5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20"><CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" /></div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Completion Results</h2>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Submitted work results</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-accent/30 p-4"><p className="whitespace-pre-wrap text-sm text-foreground/80">{workOrder.completion_results}</p></div>
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
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Work Order Details', href: '#' },
    ],
};
