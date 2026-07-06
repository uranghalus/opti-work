import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, AlertTriangle, FileText, Clock, Users, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workOrdersIndex } from '@/routes/work-orders';

type Employee = { id: number; name: string; position?: string };
type WorkOrder = { id_work_order: number; no_work_order: string; tgl_work_order: string; rincian_pekerjaan: string; lokasi: string | null; status_pekerjaan: string; prioritas: string; priority_type: string; urgent_sub_type: string | null; department_tujuan: string | null; keterangan: string | null; user_requester: string };
type PageProps = { workOrder: WorkOrder; employees: Employee[] };

export default function HodReview({ workOrder, employees = [] }: PageProps) {
    const [hodAction, setHodAction] = useState('execute_immediately');
    const [scheduledDate, setScheduledDate] = useState('');
    const [selected, setSelected] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');

    const isUrgentByAccident = workOrder.urgent_sub_type === 'by_accident';
    const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.position?.toLowerCase().includes(search.toLowerCase()));

    const add = (emp: Employee) => {
 if (!selected.find((e) => e.id === emp.id)) {
setSelected([...selected, emp]);
} 
};
    const remove = (id: number) => setSelected(selected.filter((e) => e.id !== id));

    return (
        <>
            <Head title={`HOD Review - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-0 md:py-8">
                {/* Back */}
                <Link href={workOrdersIndex.url()} className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10"><ArrowLeft className="size-4" /></span>
                    Back to Work Orders
                </Link>

                {/* Hero — Double-Bezel */}
                <div className="animate-fade-in rounded-[2rem] border border-primary/10 bg-primary/5 p-1.5">
                    <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-primary via-[#0088cc] to-[#0093dd] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] md:px-8">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-[80px]" />
                            <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-white/10 blur-[60px]" />
                        </div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-white/90 uppercase backdrop-blur-md">
                                    <CheckCircle2 className="size-3" />HOD Review Stage
                                </span>
                                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Review & Approve Work Order</h1>
                                <p className="text-sm text-white/80">Review work order details and assign team for execution</p>
                            </div>
                            <StatusBadge status={workOrder.status_pekerjaan} className="bg-white/20 text-white backdrop-blur-sm" />
                        </div>
                    </div>
                </div>

                {/* Urgent Warning */}
                {isUrgentByAccident && (
                    <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border-2 border-red-200/40 bg-red-50/60 p-1 dark:border-red-500/20 dark:bg-red-500/5">
                        <div className="flex items-start gap-3 rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20"><AlertTriangle className="size-5 text-red-600 dark:text-red-400" /></div>
                            <div>
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Immediate Execution Required</h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-400">This is an urgent work order by accident. Scheduling is not permitted.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* WO Details — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Work Order Details</h2></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div><Label className="text-xs text-muted-foreground">Work Order Number</Label><p className="mt-1 font-mono text-sm font-semibold text-foreground">{workOrder.no_work_order}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Department</Label><p className="mt-1 text-sm font-medium text-foreground">{workOrder.department_tujuan || 'N/A'}</p></div>
                            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Work Description</Label><p className="mt-1 text-sm text-foreground">{workOrder.rincian_pekerjaan}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Location</Label><p className="mt-1 text-sm text-foreground">{workOrder.lokasi || 'N/A'}</p></div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Priority</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${workOrder.priority_type === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                        {workOrder.priority_type === 'urgent' && <AlertTriangle className="size-3" />}{workOrder.priority_type}
                                    </span>
                                    {workOrder.urgent_sub_type && <span className="text-xs text-muted-foreground">({workOrder.urgent_sub_type.replace(/_/g, ' ')})</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Form action={`/work-orders/${workOrder.id_work_order}/hod-approve`} method="post" className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            {/* Review Action — Double-Bezel */}
                            <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Review Action</h2></div>
                                    <div className="space-y-5">
                                        <div className="grid gap-3">
                                            <Label>Action <span className="text-destructive">*</span></Label>
                                            <RadioGroup value={hodAction} onValueChange={(v: string) => setHodAction(v)} className="flex flex-col gap-3 sm:flex-row" disabled={isUrgentByAccident}>
                                                {[
                                                    { value: 'execute_immediately', icon: Clock, label: 'Execute Immediately', desc: 'Start work right away' },
                                                    { value: 'schedule', icon: Calendar, label: 'Schedule for Later', desc: 'Set a future date' },
                                                ].map((opt) => {
                                                    const Icon = opt.icon;
                                                    const active = hodAction === opt.value;

                                                    return (
                                                        <div key={opt.value} className="flex-1">
                                                            <div className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-sm active:scale-[0.98] ${active ? 'border-primary bg-primary/5' : 'border-border bg-background'} ${isUrgentByAccident && opt.value === 'schedule' ? 'cursor-not-allowed opacity-50' : ''}`}
                                                                onClick={() => {
 if (!isUrgentByAccident || opt.value !== 'schedule') {
setHodAction(opt.value);
} 
}}>
                                                                <div className="flex items-center gap-3">
                                                                    <Icon className={`size-5 ${active ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                                                    <div>
                                                                        <p className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</p>
                                                                        <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </RadioGroup>
                                            <input type="hidden" name="hod_action" value={hodAction} />
                                            {errors.hod_action && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3" />{errors.hod_action}</p>}
                                        </div>

                                        {hodAction === 'schedule' && !isUrgentByAccident && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="scheduled_date">Scheduled Date <span className="text-destructive">*</span></Label>
                                                <Input id="scheduled_date" name="scheduled_date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                                {errors.scheduled_date && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3" />{errors.scheduled_date}</p>}
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="action_notes">Review Notes</Label>
                                            <Textarea id="action_notes" name="action_notes" placeholder="Add any notes or instructions..." rows={3} />
                                            {errors.action_notes && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3" />{errors.action_notes}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Assignment — Double-Bezel */}
                            <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-dashed border-primary/30 bg-primary/[0.02] p-1.5 dark:border-primary/20">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Users className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Assign Team Members</h2>
                                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{selected.length} selected</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or position..." className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]" />
                                        </div>

                                        <div className="max-h-56 overflow-y-auto rounded-xl border border-border/40">
                                            {filtered.length === 0 ? (
                                                <div className="p-6 text-center"><Users className="mx-auto mb-2 size-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No employees found</p></div>
                                            ) : (
                                                <div className="divide-y divide-border/40">
                                                    {filtered.map((emp) => {
                                                        const isSelected = selected.some((e) => e.id === emp.id);

                                                        return (
                                                            <button key={emp.id} type="button" onClick={() => add(emp)} disabled={isSelected}
                                                                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-300 ${isSelected ? 'cursor-not-allowed bg-primary/5' : 'cursor-pointer hover:bg-accent/50'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0093dd] text-sm font-semibold text-white">{emp.name.charAt(0).toUpperCase()}</div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-foreground">{emp.name}</p>
                                                                        {emp.position && <p className="text-xs text-muted-foreground">{emp.position}</p>}
                                                                    </div>
                                                                </div>
                                                                {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : <Plus className="size-5 text-muted-foreground/50 transition-colors hover:text-primary" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {selected.length > 0 && (
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                <Label className="mb-2 block text-xs font-medium text-primary">Selected Team Members</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.map((emp) => (
                                                        <div key={emp.id} className="group flex items-center gap-2 rounded-full border border-border/40 bg-background px-3 py-2 shadow-sm transition-all duration-300 hover:shadow-md">
                                                            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0093dd] text-xs font-semibold text-white">{emp.name.charAt(0).toUpperCase()}</div>
                                                            <span className="text-sm font-medium text-foreground">{emp.name}</span>
                                                            <button type="button" onClick={() => remove(emp.id)} className="rounded-full p-0.5 text-muted-foreground/50 transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"><X className="size-3.5" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selected.map((emp, i) => (<input key={emp.id} type="hidden" name={`assigned_employees[${i}][id]`} value={emp.id} />))}
                                        {selected.map((emp, i) => (<input key={`n-${emp.id}`} type="hidden" name={`assigned_employees[${i}][name]`} value={emp.name} />))}
                                        <input type="hidden" name="personnel_count" value={selected.length} />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="animate-fade-in animate-delay-400 flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}><Button type="button" variant="outline" className="rounded-full px-6">Cancel</Button></Link>
                                <Button disabled={processing || selected.length === 0} type="submit"
                                    className="group rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-50">
                                    {processing ? (
                                        <><svg className="mr-2 size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Processing...</>
                                    ) : (
                                        <><CheckCircle2 className="size-4" />Approve & Assign Team ({selected.length})<span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><CheckCircle2 className="size-3" /></span></>
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

HodReview.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'HOD Review', href: '#' },
    ],
};
