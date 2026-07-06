import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: string;
    className?: string;
    size?: 'sm' | 'md';
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; ring: string }> = {
    Pending_HOD: {
        label: 'Pending HOD',
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-500/10',
        ring: 'ring-purple-500/20 dark:ring-purple-500/30',
    },
    Executed: {
        label: 'Executed',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
        ring: 'ring-emerald-500/20 dark:ring-emerald-500/30',
    },
    Rejected: {
        label: 'Rejected',
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-500/10',
        ring: 'ring-red-500/20 dark:ring-red-500/30',
    },
    pending_hod_review: {
        label: 'Pending Review',
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-500/10',
        ring: 'ring-purple-500/20 dark:ring-purple-500/30',
    },
    hod_approved: {
        label: 'Approved',
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        ring: 'ring-blue-500/20 dark:ring-blue-500/30',
    },
    scheduled: {
        label: 'Scheduled',
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        ring: 'ring-blue-500/20 dark:ring-blue-500/30',
    },
    assigned: {
        label: 'Assigned',
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        ring: 'ring-amber-500/20 dark:ring-amber-500/30',
    },
    in_progress: {
        label: 'In Progress',
        color: 'text-orange-700 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-500/10',
        ring: 'ring-orange-500/20 dark:ring-orange-500/30',
    },
    pending_verification: {
        label: 'Pending Verification',
        color: 'text-indigo-700 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
        ring: 'ring-indigo-500/20 dark:ring-indigo-500/30',
    },
    completed: {
        label: 'Completed',
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
        ring: 'ring-emerald-500/20 dark:ring-emerald-500/30',
    },
};

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        color: 'text-neutral-700 dark:text-neutral-400',
        bgColor: 'bg-neutral-100 dark:bg-neutral-500/10',
        ring: 'ring-neutral-500/20',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium ring-1 ring-inset transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                config.bgColor,
                config.color,
                config.ring,
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
                className,
            )}
        >
                            <span className={cn('mr-1.5 size-1.5 rounded-full', 'bg-current opacity-60')} />
            {config.label}
        </span>
    );
}
