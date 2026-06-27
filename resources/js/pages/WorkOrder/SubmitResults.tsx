import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { Textarea } from '@/components/ui/textarea';

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

type PageProps = {
    workOrder: WorkOrder;
};

export default function SubmitResults({ workOrder }: PageProps) {
    return (
        <>
            <Head title={`Submit Results - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-3xl space-y-6">
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
                                Submit Work Results
                            </h1>
                            <StatusBadge status={workOrder.status_pekerjaan} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Report the completion of this work order
                        </p>
                    </div>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <WorkflowStepper currentStep={3} steps={[]} />
                </div>

                {/* Work Order Info */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Work Order Details
                        </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs text-neutral-500">Work Order Number</Label>
                            <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                {workOrder.no_work_order}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Department</Label>
                            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                {workOrder.department_tujuan || 'N/A'}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="text-xs text-neutral-500">Work Description</Label>
                            <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                {workOrder.rincian_pekerjaan}
                            </p>
                        </div>
                        {workOrder.assigned_employees && workOrder.assigned_employees.length > 0 && (
                            <div className="sm:col-span-2">
                                <Label className="text-xs text-neutral-500">Assigned Team</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {workOrder.assigned_employees.map((emp) => (
                                        <span
                                            key={emp.id}
                                            className="inline-flex items-center rounded-full bg-[#0071b7]/10 px-3 py-1 text-xs font-medium text-[#0071b7] dark:bg-[#0093dd]/10 dark:text-[#0093dd]"
                                        >
                                            {emp.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Results Form */}
                <Form
                    action={`/work-orders/${workOrder.id_work_order}/submit-results`}
                    method="post"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <ClipboardList className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Work Completion Report
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {/* Completion Results */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="completion_results">
                                            Completion Results{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="completion_results"
                                            name="completion_results"
                                            placeholder="Describe what was accomplished, tasks completed, and outcomes achieved..."
                                            rows={6}
                                            className="text-base"
                                        />
                                        {errors.completion_results && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.completion_results}
                                            </p>
                                        )}
                                    </div>

                                    {/* Additional Notes */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="completion_notes">
                                            Additional Notes
                                        </Label>
                                        <Textarea
                                            id="completion_notes"
                                            name="completion_notes"
                                            placeholder="Any challenges faced, materials used, or other relevant information..."
                                            rows={3}
                                        />
                                        {errors.completion_notes && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.completion_notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-500/10">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                                    Important
                                                </p>
                                                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                                    Once submitted, this work order will be sent to the HOD for verification.
                                                    Ensure all work has been completed accurately before submitting.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
                                    disabled={processing}
                                    type="submit"
                                    className="bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 hover:shadow-lg hover:shadow-[#0071b7]/30"
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
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 size-4" />
                                            Submit Results
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

SubmitResults.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Submit Results',
            href: '#',
        },
    ],
};
