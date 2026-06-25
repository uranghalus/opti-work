import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, ClipboardList, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string;
    department: string | null;
    priority_type: string;
    status_pekerjaan: string;
    completion_results: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
    user: string;
};

type PageProps = {
    workOrder: WorkOrder;
};

export default function Verify({ workOrder }: PageProps) {
    const [verificationStatus, setVerificationStatus] = useState('');

    return (
        <>
            <Head title={`Verify - ${workOrder.no_work_order}`} />

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
                                Verify Completion
                            </h1>
                            <StatusBadge status={workOrder.status_pekerjaan} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Review and verify the completed work
                        </p>
                    </div>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <WorkflowStepper currentStep={4} steps={[]} />
                </div>

                {/* Work Order Details */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Work Order Information
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
                                {workOrder.department || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Reported By</Label>
                            <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                {workOrder.user}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs text-neutral-500">Priority</Label>
                            <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                {workOrder.priority_type}
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

                {/* Completion Results */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-500/10">
                    <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                            Submitted Work Results
                        </h2>
                    </div>
                    <div className="rounded-lg bg-white p-4 dark:bg-neutral-900">
                        <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-white">
                            {workOrder.completion_results || 'No results submitted.'}
                        </p>
                    </div>
                </div>

                {/* Verification Form */}
                <Form
                    action={`/work-orders/${workOrder.id_work_order}/verify`}
                    method="post"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <ClipboardList className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Verification Decision
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {/* Verification Status */}
                                    <div className="grid gap-3">
                                        <Label>
                                            Verification Result{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <RadioGroup
                                            value={verificationStatus}
                                            onValueChange={(value: string) =>
                                                setVerificationStatus(value)
                                            }
                                            className="grid gap-3 sm:grid-cols-3"
                                        >
                                            {/* Pass */}
                                            <div>
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${verificationStatus === 'pass'
                                                        ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    onClick={() => setVerificationStatus('pass')}
                                                >
                                                    <CheckCircle2 className="mb-2 size-6 text-emerald-500" />
                                                    <p className="font-medium text-emerald-700 dark:text-emerald-400">
                                                        Pass
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        Work completed successfully
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Needs Revision */}
                                            <div>
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${verificationStatus === 'needs_revision'
                                                        ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    onClick={() =>
                                                        setVerificationStatus('needs_revision')
                                                    }
                                                >
                                                    <RotateCcw className="mb-2 size-6 text-amber-500" />
                                                    <p className="font-medium text-amber-700 dark:text-amber-400">
                                                        Needs Revision
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        Minor changes needed
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Fail */}
                                            <div>
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${verificationStatus === 'fail'
                                                        ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    onClick={() => setVerificationStatus('fail')}
                                                >
                                                    <XCircle className="mb-2 size-6 text-red-500" />
                                                    <p className="font-medium text-red-700 dark:text-red-400">
                                                        Fail
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        Major issues found
                                                    </p>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <input
                                            type="hidden"
                                            name="verification_status"
                                            value={verificationStatus}
                                        />
                                        {errors.verification_status && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.verification_status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Verification Notes */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="verification_notes">
                                            Verification Notes
                                        </Label>
                                        <Textarea
                                            id="verification_notes"
                                            name="verification_notes"
                                            placeholder={
                                                verificationStatus === 'pass'
                                                    ? 'Add any final notes or observations...'
                                                    : verificationStatus === 'needs_revision'
                                                        ? 'Describe what needs to be revised...'
                                                        : 'Describe the issues found...'
                                            }
                                            rows={4}
                                        />
                                        {errors.verification_notes && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.verification_notes}
                                            </p>
                                        )}
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
                                    disabled={processing || !verificationStatus}
                                    type="submit"
                                    className={`text-white shadow-md hover:shadow-lg ${verificationStatus === 'pass'
                                        ? 'bg-linear-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/30'
                                        : verificationStatus === 'needs_revision'
                                            ? 'bg-linear-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/30'
                                            : verificationStatus === 'fail'
                                                ? 'bg-linear-to-r from-red-500 to-red-600 shadow-red-500/25 hover:shadow-red-500/30'
                                                : 'bg-linear-to-r from-[#0071b7] to-[#0093dd] shadow-[#0071b7]/25'
                                        } disabled:opacity-50`}
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
                                            Submit Verification
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

Verify.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Verify Completion',
            href: '#',
        },
    ],
};
