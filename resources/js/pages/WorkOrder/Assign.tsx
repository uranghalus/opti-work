import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, CheckCircle2, AlertCircle, FileText, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workOrdersIndex } from '@/routes/work-orders';

type Employee = { id: number; name: string; position?: string };
type WorkOrder = { id_work_order: number; no_work_order: string; rincian_pekerjaan: string; department_tujuan: string | null; priority_type: string; status_pekerjaan: string };
type PageProps = { workOrder: WorkOrder; employees: Employee[] };

export default function Assign({ workOrder, employees }: PageProps) {
    const [selected, setSelected] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');

    const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.position?.toLowerCase().includes(search.toLowerCase()));

    const add = (emp: Employee) => {
 if (!selected.find((e) => e.id === emp.id)) {
setSelected([...selected, emp]);
} 
};
    const remove = (id: number) => setSelected(selected.filter((e) => e.id !== id));

    return (
        <>
            <Head title={`Assign Team - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 md:px-0 md:py-8">
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
                                    <Users className="size-3" />Team Assignment
                                </span>
                                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Assign Team</h1>
                                <p className="text-sm text-white/80">Select employees to execute this work order</p>
                            </div>
                            <StatusBadge status={workOrder.status_pekerjaan} className="bg-white/20 text-white backdrop-blur-sm" />
                        </div>
                    </div>
                </div>

                {/* WO Info — Double-Bezel */}
                <div className="animate-fade-in animate-delay-100 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Work Order Information</h2></div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div><Label className="text-xs text-muted-foreground">Work Order Number</Label><p className="mt-1 font-mono text-sm font-semibold text-foreground">{workOrder.no_work_order}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Department</Label><p className="mt-1 text-sm font-medium text-foreground">{workOrder.department_tujuan || 'N/A'}</p></div>
                            <div><Label className="text-xs text-muted-foreground">Priority</Label><p className="mt-1 text-sm font-medium capitalize text-foreground">{workOrder.priority_type}</p></div>
                            <div className="sm:col-span-3"><Label className="text-xs text-muted-foreground">Work Description</Label><p className="mt-1 text-sm text-foreground">{workOrder.rincian_pekerjaan}</p></div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Form action={`/work-orders/${workOrder.id_work_order}/assign`} method="post" className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            {/* Employee Selection — Double-Bezel */}
                            <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-4 flex items-center gap-2"><Users className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Select Employees</h2></div>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="employee-search">Search Employees</Label>
                                            <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                                <Input id="employee-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or position..." className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]" />
                                            </div>
                                        </div>

                                        <div className="max-h-64 overflow-y-auto rounded-xl border border-border/40">
                                            {filtered.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-muted-foreground">No employees found</div>
                                            ) : (
                                                <div className="divide-y divide-border/40">
                                                    {filtered.map((emp) => {
                                                        const isSelected = selected.some((e) => e.id === emp.id);

                                                        return (
                                                            <button key={emp.id} type="button" onClick={() => add(emp)} disabled={isSelected}
                                                                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-300 ${isSelected ? 'cursor-not-allowed bg-primary/5 opacity-60' : 'cursor-pointer hover:bg-accent/50'}`}>
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground">{emp.name}</p>
                                                                    {emp.position && <p className="text-xs text-muted-foreground">{emp.position}</p>}
                                                                </div>
                                                                {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : <Plus className="size-5 text-muted-foreground/50" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {selected.length > 0 && (
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/20">
                                                <Label className="mb-2 block text-xs font-medium text-primary">Selected Team ({selected.length})</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.map((emp) => (
                                                        <div key={emp.id} className="group flex items-center gap-2 rounded-full border border-border/40 bg-background px-3 py-1.5 shadow-sm transition-all duration-300 hover:shadow-md">
                                                            <span className="text-sm font-medium text-foreground">{emp.name}</span>
                                                            <button type="button" onClick={() => remove(emp.id)} className="rounded-full p-0.5 text-muted-foreground/50 transition-all duration-300 hover:bg-destructive/10 hover:text-destructive">
                                                                <X className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <input type="hidden" name="personnel_count" value={selected.length} />
                                        {selected.map((emp, i) => (<input key={emp.id} type="hidden" name={`assigned_employees[${i}][id]`} value={emp.id} />))}
                                        {selected.map((emp, i) => (<input key={`n-${emp.id}`} type="hidden" name={`assigned_employees[${i}][name]`} value={emp.name} />))}
                                        {errors.assigned_employees && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.assigned_employees}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Notes — Double-Bezel */}
                            <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                                    <div className="mb-4 flex items-center gap-2"><FileText className="size-5 text-primary" /><h2 className="text-sm font-semibold text-foreground">Assignment Notes</h2></div>
                                    <Textarea name="assignment_notes" placeholder="Add any special instructions or notes for the team..." rows={3} />
                                    {errors.assignment_notes && <p className="mt-2 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="size-3" />{errors.assignment_notes}</p>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="animate-fade-in animate-delay-400 flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}><Button type="button" variant="outline" className="rounded-full px-6">Cancel</Button></Link>
                                <Button disabled={processing || selected.length === 0} type="submit"
                                    className="group rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-50">
                                    {processing ? (
                                        <><svg className="mr-2 size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Assigning...</>
                                    ) : (
                                        <><Users className="size-4" />Assign Team ({selected.length})<span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><Users className="size-3" /></span></>
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

Assign.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: workOrdersIndex() },
        { title: 'Assign Team', href: '#' },
    ],
};
