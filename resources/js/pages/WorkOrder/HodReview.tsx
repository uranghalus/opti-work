import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, AlertTriangle, FileText, Clock } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

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
};

export default function HodReview({ workOrder }: PageProps) {
    const [hodAction, setHodAction] = useState('execute_immediately');
    const [scheduledDate, setScheduledDate] = useState('');

    const isUrgentByAccident = workOrder.urgent_sub_type === 'by_accident';

    return (
        <>
            <Head title={`HOD Review - ${workOrder.no_work_order}`} />

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
                                HOD Review
                            </h1>
                            <StatusBadge status={workOrder.status_pekerjaan} />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Review and approve this work order request
                        </p>
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
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 size-4" />
                                            Approve & Continue
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
