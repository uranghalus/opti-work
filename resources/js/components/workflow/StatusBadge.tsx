import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: string;
    className?: string;
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    // status_tiket values
    Pending_HOD: {
        label: 'Pending HOD',
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    },
    Executed: {
        label: 'Executed',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
    Rejected: {
        label: 'Rejected',
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-500/20',
    },
    // status_pekerjaan values
    pending_hod_review: {
        label: 'Pending Review',
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    },
    hod_approved: {
        label: 'Approved',
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    },
    scheduled: {
        label: 'Scheduled',
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    },
    assigned: {
        label: 'Assigned',
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-500/20',
    },
    in_progress: {
        label: 'In Progress',
        color: 'text-orange-700 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-500/20',
    },
    pending_verification: {
        label: 'Pending Verification',
        color: 'text-indigo-700 dark:text-indigo-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
    },
    completed: {
        label: 'Completed',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        color: 'text-neutral-700 dark:text-neutral-400',
        bgColor: 'bg-neutral-100 dark:bg-neutral-500/20',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                config.bgColor,
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
}
