import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, AlertTriangle, FileText, Clock, Users, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';

type Employee = {
    id: number;
    name: string;
    position?: string;
};

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    tgl_work_order: string;
    rincian_pekerjaan: string;
    lokasi: string | null;
    status_pekerjaan: string;
    prioritas: string;
    priority_type: string;
    urgent_sub_type: string | null;
    location_type: string;
    tenant_name: string | null;
    budget: string;
    keterangan: string | null;
    department: string | null;
    pic: string | null;
    user: string;
};

type PageProps = {
    workOrder: WorkOrder;
    employees: Employee[];
};

export default function HodReview({ workOrder, employees = [] }: PageProps) {
    const [hodAction, setHodAction] = useState('execute_immediately');
    const [scheduledDate, setScheduledDate] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const isUrgentByAccident = workOrder.urgent_sub_type === 'by_accident';

    const filteredEmployees = (employees || []).filter(
        (emp) =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addEmployee = (employee: Employee) => {
        if (!selectedEmployees.find((e) => e.id === employee.id)) {
            setSelectedEmployees([...selectedEmployees, employee]);
        }
    };

    const removeEmployee = (employeeId: number) => {
        const updated = selectedEmployees.filter((e) => e.id !== employeeId);
        setSelectedEmployees(updated);
    };

    return (
        <>
            <Head title={`HOD Review - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-5xl space-y-6">
                {/* Back Link */}
                <Link
                    href={workOrdersIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <ArrowLeft className="size-4" />
                    Back to Work Orders
                </Link>

                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <CheckCircle2 className="size-3.5" />
                                HOD Review Stage
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Review & Approve Work Order
                            </h1>
                            <p className="mt-2 text-sm text-white/80">
                                Review work order details and assign team for execution
                            </p>
                        </div>
                        <StatusBadge status={workOrder.status_pekerjaan} className="bg-white/20 text-white backdrop-blur-sm" />
                    </div>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <WorkflowStepper currentStep={1} steps={[]} />
                </div>

                {/* Urgent Warning */}
                {isUrgentByAccident && (
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
                            <Label className="text-xs text-neutral-500">Work Order Number</Label>
                            <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                {workOrder.no_work_order}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Department</Label>
                            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                {workOrder.department || 'N/A'}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="text-xs text-neutral-500">Work Description</Label>
                            <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                {workOrder.rincian_pekerjaan}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Location/Tenant</Label>
                            <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                {workOrder.location_type === 'tenant'
                                    ? workOrder.tenant_name || 'N/A'
                                    : workOrder.lokasi || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Priority</Label>
                            <div className="mt-1 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${workOrder.priority_type === 'urgent'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        }`}
                                >
                                    {workOrder.priority_type === 'urgent' && (
                                        <AlertTriangle className="size-3" />
                                    )}
                                    {workOrder.priority_type}
                                </span>
                                {workOrder.urgent_sub_type && (
                                    <span className="text-xs text-neutral-500">
                                        ({workOrder.urgent_sub_type.replace(/_/g, ' ')})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HOD Action Form */}
                <Form
                    action={`/work-orders/${workOrder.id_work_order}/hod-approve`}
                    method="post"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Review Action
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {/* Action Selection */}
                                    <div className="grid gap-3">
                                        <Label>
                                            Action{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <RadioGroup
                                            value={hodAction}
                                            onValueChange={(value: string) =>
                                                setHodAction(value)
                                            }
                                            className="flex flex-col gap-3 sm:flex-row"
                                            disabled={isUrgentByAccident}
                                        >
                                            <div className="flex-1">
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${hodAction === 'execute_immediately'
                                                        ? 'border-[#0071b7] bg-[#0071b7]/5 dark:border-[#0093dd] dark:bg-[#0093dd]/5'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        } ${isUrgentByAccident ? 'opacity-50' : ''}`}
                                                    onClick={() =>
                                                        !isUrgentByAccident &&
                                                        setHodAction('execute_immediately')
                                                    }
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                                        <div>
                                                            <p className="font-medium">
                                                                Execute Immediately
                                                            </p>
                                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                                Start work right away
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${hodAction === 'schedule'
                                                        ? 'border-[#0071b7] bg-[#0071b7]/5 dark:border-[#0093dd] dark:bg-[#0093dd]/5'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        } ${isUrgentByAccident ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    onClick={() =>
                                                        !isUrgentByAccident &&
                                                        setHodAction('schedule')
                                                    }
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                                        <div>
                                                            <p className="font-medium">
                                                                Schedule for Later
                                                            </p>
                                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                                Set a future date
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <input
                                            type="hidden"
                                            name="hod_action"
                                            value={hodAction}
                                        />
                                        {errors.hod_action && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertTriangle className="size-3" />
                                                {errors.hod_action}
                                            </p>
                                        )}
                                    </div>

                                    {/* Scheduled Date */}
                                    {hodAction === 'schedule' && !isUrgentByAccident && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="scheduled_date">
                                                Scheduled Date{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="scheduled_date"
                                                name="scheduled_date"
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.scheduled_date && (
                                                <p className="flex items-center gap-1 text-xs text-red-500">
                                                    <AlertTriangle className="size-3" />
                                                    {errors.scheduled_date}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Notes */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="action_notes">Review Notes</Label>
                                        <Textarea
                                            id="action_notes"
                                            name="action_notes"
                                            placeholder="Add any notes or instructions..."
                                            rows={3}
                                        />
                                        {errors.action_notes && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertTriangle className="size-3" />
                                                {errors.action_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Employee Assignment Section */}
                            <div className="mt-6 rounded-2xl border-2 border-dashed border-[#0071b7]/30 bg-linear-to-br from-[#0071b7]/5 to-transparent p-6 dark:border-[#0093dd]/30 dark:from-[#0093dd]/5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Users className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Assign Team Members
                                    </h2>
                                    <span className="ml-auto rounded-full bg-[#0071b7]/10 px-2 py-0.5 text-xs font-medium text-[#0071b7] dark:bg-[#0093dd]/10 dark:text-[#0093dd]">
                                        {selectedEmployees.length} selected
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {/* Search Employees */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="employee-search" className="text-xs">Search Employees</Label>
                                        <Input
                                            id="employee-search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or position..."
                                            className="transition-all focus-visible:ring-[#0071b7]/50"
                                        />
                                    </div>

                                    {/* Employee List */}
                                    <div className="max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                                        {filteredEmployees.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <Users className="mx-auto mb-2 size-8 text-neutral-300 dark:text-neutral-600" />
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">No employees found</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                                {filteredEmployees.map((employee) => {
                                                    const isSelected = selectedEmployees.some((e) => e.id === employee.id);

                                                    return (
                                                        <button
                                                            key={employee.id}
                                                            type="button"
                                                            onClick={() => addEmployee(employee)}
                                                            disabled={isSelected}
                                                            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all ${isSelected
                                                                ? 'cursor-not-allowed bg-[#0071b7]/5 dark:bg-[#0093dd]/5'
                                                                : 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-[#0071b7] to-[#0093dd] text-sm font-semibold text-white">
                                                                    {employee.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                        {employee.name}
                                                                    </p>
                                                                    {employee.position && (
                                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                            {employee.position}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isSelected ? (
                                                                <CheckCircle2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                                            ) : (
                                                                <Plus className="size-5 text-neutral-400 transition-colors hover:text-[#0071b7]" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Employees */}
                                    {selectedEmployees.length > 0 && (
                                        <div className="rounded-xl border border-[#0071b7]/20 bg-linear-to-br from-[#0071b7]/5 to-transparent p-4 dark:border-[#0093dd]/20 dark:from-[#0093dd]/5">
                                            <Label className="mb-2 block text-xs font-medium text-[#0071b7] dark:text-[#0093dd]">
                                                Selected Team Members
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedEmployees.map((employee) => (
                                                    <div
                                                        key={employee.id}
                                                        className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm transition-all hover:shadow-md dark:bg-neutral-900"
                                                    >
                                                        <div className="flex size-6 items-center justify-center rounded-full bg-linear-to-br from-[#0071b7] to-[#0093dd] text-xs font-semibold text-white">
                                                            {employee.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {employee.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEmployee(employee.id)}
                                                            className="rounded-full p-0.5 text-neutral-400 transition-all hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20"
                                                        >
                                                            <X className="size-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden inputs for form submission */}
                                    {selectedEmployees.map((employee, index) => (
                                        <input
                                            key={employee.id}
                                            type="hidden"
                                            name={`assigned_employees[${index}][id]`}
                                            value={employee.id}
                                        />
                                    ))}
                                    {selectedEmployees.map((employee, index) => (
                                        <input
                                            key={employee.id}
                                            type="hidden"
                                            name={`assigned_employees[${index}][name]`}
                                            value={employee.name}
                                        />
                                    ))}
                                    <input
                                        type="hidden"
                                        name="personnel_count"
                                        value={selectedEmployees.length}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    disabled={processing || selectedEmployees.length === 0}
                                    type="submit"
                                    className="bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 hover:shadow-lg hover:shadow-[#0071b7]/30 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="mr-2 size-4 animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 size-4" />
                                            Approve & Assign Team ({selectedEmployees.length})
                                        </>
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
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'HOD Review',
            href: '#',
        },
    ],
};
