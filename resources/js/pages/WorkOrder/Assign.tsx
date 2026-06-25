import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, CheckCircle2, AlertCircle, FileText, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { Textarea } from '@/components/ui/textarea';

type Employee = {
    id: number;
    name: string;
    position?: string;
};

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string;
    department: string | null;
    priority_type: string;
    status_pekerjaan: string;
};

type PageProps = {
    workOrder: WorkOrder;
    employees: Employee[];
};

export default function Assign({ workOrder, employees }: PageProps) {
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
    const [personnelCount, setPersonnelCount] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addEmployee = (employee: Employee) => {
        if (!selectedEmployees.find((e) => e.id === employee.id)) {
            setSelectedEmployees([...selectedEmployees, employee]);
            setPersonnelCount(selectedEmployees.length + 1);
        }
    };

    const removeEmployee = (employeeId: number) => {
        const updated = selectedEmployees.filter((e) => e.id !== employeeId);
        setSelectedEmployees(updated);
        setPersonnelCount(updated.length);
    };

    return (
        <>
            <Head title={`Assign Team - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* Back Link */}
                <Link
                    href={workOrdersIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <ArrowLeft className="size-4" />
                    Back to Work Orders
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                Assign Team
                            </h1>
                            <StatusBadge status={workOrder.status_pekerjaan} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Select employees to execute this work order
                        </p>
                    </div>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <WorkflowStepper currentStep={2} steps={[]} />
                </div>

                {/* Work Order Info */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Work Order Information
                        </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
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
                        <div>
                            <Label className="text-xs text-neutral-500">Priority</Label>
                            <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                {workOrder.priority_type}
                            </p>
                        </div>
                        <div className="sm:col-span-3">
                            <Label className="text-xs text-neutral-500">Work Description</Label>
                            <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                {workOrder.rincian_pekerjaan}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assignment Form */}
                <Form
                    action={`/work-orders/${workOrder.id_work_order}/assign`}
                    method="post"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Employee Selection */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Users className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Select Employees
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Search */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="employee-search">Search Employees</Label>
                                        <Input
                                            id="employee-search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or position..."
                                        />
                                    </div>

                                    {/* Employee List */}
                                    <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                                        {filteredEmployees.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-neutral-500">
                                                No employees found
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                                {filteredEmployees.map((employee) => {
                                                    const isSelected = selectedEmployees.some(
                                                        (e) => e.id === employee.id
                                                    );

                                                    return (
                                                        <button
                                                            key={employee.id}
                                                            type="button"
                                                            onClick={() => addEmployee(employee)}
                                                            disabled={isSelected}
                                                            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${isSelected
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : 'cursor-pointer'
                                                                }`}
                                                        >
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
                                                            {isSelected ? (
                                                                <CheckCircle2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                                            ) : (
                                                                <Plus className="size-5 text-neutral-400" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Employees */}
                                    {selectedEmployees.length > 0 && (
                                        <div className="rounded-lg border border-[#0071b7]/20 bg-[#0071b7]/5 p-4 dark:border-[#0093dd]/20 dark:bg-[#0093dd]/5">
                                            <Label className="mb-2 block text-xs font-medium text-[#0071b7] dark:text-[#0093dd]">
                                                Selected Team ({selectedEmployees.length})
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedEmployees.map((employee) => (
                                                    <div
                                                        key={employee.id}
                                                        className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm dark:bg-neutral-900"
                                                    >
                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {employee.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeEmployee(employee.id)
                                                            }
                                                            className="text-neutral-400 transition-colors hover:text-red-500"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden inputs for form submission */}
                                    <input
                                        type="hidden"
                                        name="personnel_count"
                                        value={personnelCount}
                                    />
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

                                    {errors.assigned_employees && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="size-3" />
                                            {errors.assigned_employees}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Notes */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Assignment Notes
                                    </h2>
                                </div>
                                <div className="grid gap-2">
                                    <Textarea
                                        name="assignment_notes"
                                        placeholder="Add any special instructions or notes for the team..."
                                        rows={3}
                                    />
                                    {errors.assignment_notes && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="size-3" />
                                            {errors.assignment_notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
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
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="mr-2 size-4" />
                                            Assign Team ({selectedEmployees.length})
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

Assign.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Assign Team',
            href: '#',
        },
    ],
};
