import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, ClipboardList, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
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
    completion_results: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
    user_requester: string;
};

type PageProps = { workOrder: WorkOrder };

export default function Verify({ workOrder }: PageProps) {
    const [verificationStatus, setVerificationStatus] = useState('');

    return (
        <>
            <Head title={`Verify - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Back */}
                <Link href={workOrdersIndex.url()} className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10"><ArrowLeft className="size-4" /></span>
                    Back to Work Orders
                </Link>

                {/* Header */}
                <div className="animate-fade-in space-y-3">
                    <span className="inline-block rounded-full border border-indigo-500/20 bg-indigo-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.15em] text-indigo-700 uppercase dark:bg-indigo-500/10 dark:text-indigo-400">Verification</span>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Verify Completion</h1>
                        <StatusBadge status={workOrder.status_pekerjaan} />
                    </div>
                    <p className="text-sm text-muted-foreground">Review and verify the completed work</p>
                </div>

                {/* Stepper — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <WorkflowStepper currentStep={4} steps={[]} />
                    </div>
                </div>

                {/* WO Details — Double-Bezel */}
                <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        <div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Work Order Information</h2></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div><Label className="text-xs text-muted-foreground">Work Order Number</Label><p className="mt-1 font-mono text-sm font-semibold text-foreground">{workOrder.no_work_order}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Department</Label><p className="mt-1 text-sm font-medium text-foreground">{workOrder.department_tujuan || 'N/A'}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Reported By</Label><p className="mt-1 text-sm text-foreground">{workOrder.user_requester}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Priority</Label><p className="mt-1 text-sm font-medium capitalize text-foreground">{workOrder.priority_type}</p></div>
                            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Work Description</Label><p className="mt-1 text-sm text-foreground">{workOrder.rincian_pekerjaan}</p></div>
                            {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">Assigned Team</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">{workOrder.assigned_employees.map((emp) => (<span key={emp.id} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{emp.name}</span>))}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Completion Results */}
                <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-emerald-200/30 bg-emerald-50/30 p-1.5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" /><h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Submitted Work Results</h2></div>
                        <div className="rounded-xl bg-accent/30 p-4"><p className="whitespace-pre-wrap text-sm text-foreground/80">{workOrder.completion_results || 'No results submitted.'}</p></div>
                    </div>
                </div>

                {/* Form — Double-Bezel */}
                <Form action={`/work-orders/${workOrder.id_work_order}/verify`} method="post" className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                                    <div className="mb-4 flex items-center gap-2"><ClipboardList className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Verification Decision</h2></div>
                                    <div className="space-y-5">
                                        <div className="grid gap-3">
                                            <Label>Verification Result <span className="text-destructive">*</span></Label>
                                            <RadioGroup value={verificationStatus} onValueChange={(v: string) => setVerificationStatus(v)} className="grid gap-3 sm:grid-cols-3">
                                                {[
                                                    { value: 'pass', icon: CheckCircle2, label: 'Pass', desc: 'Work completed successfully', colors: 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10', iconColor: 'text-emerald-500' },
                                                    { value: 'needs_revision', icon: RotateCcw, label: 'Needs Revision', desc: 'Minor changes needed', colors: 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10', iconColor: 'text-amber-500' },
                                                    { value: 'fail', icon: XCircle, label: 'Fail', desc: 'Major issues found', colors: 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10', iconColor: 'text-red-500' },
                                                ].map((opt) => {
                                                    const Icon = opt.icon;
                                                    const active = verificationStatus === opt.value;

                                                    return (
                                                        <div key={opt.value}>
                                                            <div className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-sm active:scale-[0.98] ${active ? opt.colors : 'border-border bg-background'}`} onClick={() => setVerificationStatus(opt.value)}>
                                                                <Icon className={`mb-2 size-6 ${active ? opt.iconColor : 'text-muted-foreground/50'}`} />
                                                                <p className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                                                                <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </RadioGroup>
                                            <input type="hidden" name="verification_status" value={verificationStatus} />
                                            {errors.verification_status && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.verification_status}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification_notes">Verification Notes</Label>
                                            <Textarea id="verification_notes" name="verification_notes" placeholder={verificationStatus === 'pass' ? 'Add any final notes or observations...' : verificationStatus === 'needs_revision' ? 'Describe what needs to be revised...' : 'Describe the issues found...'} rows={4} />
                                            {errors.verification_notes && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.verification_notes}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="animate-fade-in animate-delay-400 flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}><Button type="button" variant="outline" className="rounded-full px-6">Cancel</Button></Link>
                                <Button disabled={processing || !verificationStatus} type="submit"
                                    className={`group rounded-full px-6 text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:opacity-50 ${
                                        verificationStatus === 'pass' ? 'bg-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/30' :
                                        verificationStatus === 'needs_revision' ? 'bg-amber-500 shadow-amber-500/25 hover:shadow-amber-500/30' :
                                        verificationStatus === 'fail' ? 'bg-destructive shadow-destructive/25 hover:shadow-destructive/30' :
                                        'bg-primary shadow-primary/25'
                                    }`}>
                                    {processing ? (
                                        <><svg className="mr-2 size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Processing...</>
                                    ) : (
                                        <><CheckCircle2 className="size-4" />Submit Verification<span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><CheckCircle2 className="size-3" /></span></>
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

Verify.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Verify Completion', href: '#' },
    ],
};
