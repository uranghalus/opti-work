import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string;
    department_tujuan: string | null;
    priority_type: string;
    status_pekerjaan: string;
    assigned_employees: Array<{ id: number; name: string }> | null;
    personnel_count: number | null;
};

type PageProps = { workOrder: WorkOrder };

export default function SubmitResults({ workOrder }: PageProps) {
    return (
        <>
            <Head title={`Submit Results - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Back */}
                <Link href={workOrdersIndex.url()} className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10"><ArrowLeft className="size-4" /></span>
                    Back to Work Orders
                </Link>

                {/* Header */}
                <div className="animate-fade-in space-y-3">
                    <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.15em] text-emerald-700 uppercase dark:bg-emerald-500/10 dark:text-emerald-400">Completion</span>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Submit Work Results</h1>
                        <StatusBadge status={workOrder.status_pekerjaan} />
                    </div>
                    <p className="text-sm text-muted-foreground">Report the completion of this work order</p>
                </div>

                {/* Stepper — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <WorkflowStepper currentStep={3} steps={[]} />
                    </div>
                </div>

                {/* WO Info — Double-Bezel */}
                <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        <div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Work Order Details</h2></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div><Label className="text-xs text-muted-foreground">Work Order Number</Label><p className="mt-1 font-mono text-sm font-semibold text-foreground">{workOrder.no_work_order}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Department</Label><p className="mt-1 text-sm font-medium text-foreground">{workOrder.department_tujuan || 'N/A'}</p></div>
                            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Work Description</Label><p className="mt-1 text-sm text-foreground">{workOrder.rincian_pekerjaan}</p></div>
                            {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">Assigned Team</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {workOrder.assigned_employees.map((emp) => (
                                            <span key={emp.id} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{emp.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form — Double-Bezel */}
                <Form action={`/work-orders/${workOrder.id_work_order}/submit-results`} method="post" className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                    <div className="mb-4 flex items-center gap-2"><ClipboardList className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Work Completion Report</h2></div>
                                    <div className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="completion_results">Completion Results <span className="text-destructive">*</span></Label>
                                            <Textarea id="completion_results" name="completion_results" placeholder="Describe what was accomplished, tasks completed, and outcomes achieved..." rows={6} className="text-base" />
                                            {errors.completion_results && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.completion_results}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="completion_notes">Additional Notes</Label>
                                            <Textarea id="completion_notes" name="completion_notes" placeholder="Any challenges faced, materials used, or other relevant information..." rows={3} />
                                            {errors.completion_notes && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.completion_notes}</p>}
                                        </div>
                                        <div className="rounded-xl border border-amber-200/40 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</p>
                                                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Once submitted, this work order will be sent to the HOD for verification. Ensure all work has been completed accurately before submitting.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="animate-fade-in animate-delay-400 flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}><Button type="button" variant="outline" className="rounded-full px-6">Cancel</Button></Link>
                                <Button disabled={processing} type="submit" className="group rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                                    {processing ? (
                                        <><svg className="mr-2 size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Submitting...</>
                                    ) : (
                                        <><CheckCircle2 className="size-4" />Submit Results<span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><CheckCircle2 className="size-3" /></span></>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SubmitResults.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Submit Results', href: '#' },
    ],
};
