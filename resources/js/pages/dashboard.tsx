import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Briefcase,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock,
    FileText,
    Mail,
    MailOpen,
    MoreHorizontal,
    Package,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { dashboard } from '@/routes';

type StatCard = {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    gradient: string;
    ring: string;
    sparkData: number[];
};

const stats: StatCard[] = [
    {
        title: 'Active Work Orders',
        value: '24',
        change: '+3 this week',
        changeType: 'positive',
        icon: ClipboardList,
        gradient: 'from-[#0071b7] to-[#0093dd]',
        ring: 'ring-[#0071b7]/20',
        sparkData: [4, 6, 5, 8, 7, 9, 10],
    },
    {
        title: 'Tasks Completed',
        value: '156',
        change: '+12% this month',
        changeType: 'positive',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-teal-400',
        ring: 'ring-emerald-500/20',
        sparkData: [3, 5, 4, 7, 6, 8, 9],
    },
    {
        title: 'Pending Approvals',
        value: '8',
        change: '3 urgent',
        changeType: 'negative',
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-400',
        ring: 'ring-amber-500/20',
        sparkData: [2, 4, 3, 5, 4, 6, 8],
    },
    {
        title: 'Team Members',
        value: '42',
        change: '+2 this month',
        changeType: 'neutral',
        icon: Users,
        gradient: 'from-violet-500 to-purple-400',
        ring: 'ring-violet-500/20',
        sparkData: [5, 5, 6, 6, 7, 7, 8],
    },
];

type RecentActivity = {
    id: number;
    title: string;
    description: string;
    time: string;
    icon: React.ElementType;
    status: 'completed' | 'in-progress' | 'pending';
    avatar?: string;
};

const recentActivities: RecentActivity[] = [
    {
        id: 1,
        title: 'Work Order #WO-2024-089',
        description: 'Preventive maintenance on Unit A3 completed',
        time: '2h ago',
        icon: ClipboardList,
        status: 'completed',
    },
    {
        id: 2,
        title: 'Daily Work Report',
        description: 'Team Alpha submitted daily progress report',
        time: '3h ago',
        icon: FileText,
        status: 'completed',
    },
    {
        id: 3,
        title: 'Incoming Mail #SM-456',
        description: 'New correspondence from vendor regarding spare parts',
        time: '5h ago',
        icon: MailOpen,
        status: 'pending',
    },
    {
        id: 4,
        title: 'Inventory Alert',
        description: 'Stock level - Bearing SKF 6205 below minimum threshold',
        time: '6h ago',
        icon: Package,
        status: 'in-progress',
    },
    {
        id: 5,
        title: 'Schedule Published',
        description: 'Work schedule for next week has been finalized',
        time: '1d ago',
        icon: CalendarDays,
        status: 'completed',
    },
];

type QuickAction = {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    bgLight: string;
};

const quickActions: QuickAction[] = [
    {
        title: 'New Work Order',
        description: 'Create work order',
        icon: ClipboardList,
        gradient: 'from-[#0071b7] to-[#0093dd]',
        bgLight: 'bg-[#0071b7]/10',
    },
    {
        title: 'Daily Report',
        description: 'Submit report',
        icon: Briefcase,
        gradient: 'from-emerald-500 to-teal-400',
        bgLight: 'bg-emerald-500/10',
    },
    {
        title: 'Send Mail',
        description: 'Outgoing mail',
        icon: Mail,
        gradient: 'from-violet-500 to-purple-400',
        bgLight: 'bg-violet-500/10',
    },
    {
        title: 'Work Planning',
        description: 'Plan tasks',
        icon: TrendingUp,
        gradient: 'from-amber-500 to-orange-400',
        bgLight: 'bg-amber-500/10',
    },
];

const statusConfig = {
    completed: {
        label: 'Completed',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    'in-progress': {
        label: 'In Progress',
        dot: 'bg-[#0071b7]',
        bg: 'bg-[#0071b7]/10 text-[#0071b7] dark:bg-[#0093dd]/20 dark:text-[#0093dd]',
    },
    pending: {
        label: 'Pending',
        dot: 'bg-amber-500',
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
};

const weeklyData = [
    { day: 'Mon', value: 12, max: 20 },
    { day: 'Tue', value: 18, max: 20 },
    { day: 'Wed', value: 15, max: 20 },
    { day: 'Thu', value: 20, max: 20 },
    { day: 'Fri', value: 17, max: 20 },
    { day: 'Sat', value: 8, max: 20 },
    { day: 'Sun', value: 4, max: 20 },
];

const departmentProgress = [
    { name: 'Maintenance', tasks: 18, total: 24, color: 'bg-[#0071b7]' },
    { name: 'Operations', tasks: 32, total: 40, color: 'bg-emerald-500' },
    { name: 'Logistics', tasks: 12, total: 20, color: 'bg-violet-500' },
    { name: 'Administration', tasks: 8, total: 12, color: 'bg-amber-500' },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((v - min) / range) * height;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={color}
            />
        </svg>
    );
}

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071b7] via-[#0088cc] to-[#0093dd] p-6 shadow-lg md:p-8">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute right-1/3 top-1/2 size-24 rounded-full bg-white/10 blur-2xl" />
                </div>
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            <Zap className="size-3.5" />
                            Work Management System
                        </div>
                        <h1 className="text-2xl font-bold text-white md:text-3xl">
                            Good morning, Admin!
                        </h1>
                        <p className="mt-1.5 text-sm text-white/80">
                            You have <span className="font-semibold text-white">8 pending approvals</span> and{' '}
                            <span className="font-semibold text-white">3 urgent tasks</span> today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                            <p className="text-2xl font-bold text-white">24</p>
                            <p className="text-[10px] font-medium text-white/70 uppercase">Active</p>
                        </div>
                        <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                            <p className="text-2xl font-bold text-white">156</p>
                            <p className="text-[10px] font-medium text-white/70 uppercase">Done</p>
                        </div>
                        <div className="hidden rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm sm:block">
                            <p className="text-2xl font-bold text-white">98%</p>
                            <p className="text-[10px] font-medium text-white/70 uppercase">Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {stat.changeType === 'positive' && (
                                        <ArrowUpRight className="size-3.5 text-emerald-500" />
                                    )}
                                    {stat.changeType === 'negative' && (
                                        <AlertTriangle className="size-3.5 text-amber-500" />
                                    )}
                                    <span
                                        className={`text-xs font-semibold ${
                                            stat.changeType === 'positive'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : stat.changeType === 'negative'
                                                  ? 'text-amber-600 dark:text-amber-400'
                                                  : 'text-neutral-500 dark:text-neutral-400'
                                        }`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <div
                                className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md ring-4 ${stat.ring}`}
                            >
                                <stat.icon className="size-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Sparkline
                                data={stat.sparkData}
                                color={
                                    stat.changeType === 'positive'
                                        ? 'text-emerald-400'
                                        : stat.changeType === 'negative'
                                          ? 'text-amber-400'
                                          : 'text-[#0071b7]'
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Activity & Chart */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Weekly Overview Chart */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <div>
                                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                    Weekly Overview
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Tasks completed this week
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span className="size-2 rounded-full bg-[#0071b7]" />
                                    Completed
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span className="size-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                    Target
                                </span>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="flex items-end justify-between gap-2">
                                {weeklyData.map((d) => (
                                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            {d.value}
                                        </span>
                                        <div className="relative flex w-full flex-col items-center">
                                            <div className="h-32 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                                <div
                                                    className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-[#0071b7] to-[#0093dd] transition-all duration-500"
                                                    style={{ height: `${(d.value / d.max) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                            {d.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <div>
                                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                    Recent Activity
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Latest updates from your workspace
                                </p>
                            </div>
                            <button className="flex items-center gap-1 text-sm font-medium text-[#0071b7] transition-colors hover:text-[#0071b7]/70 dark:text-[#0093dd]">
                                View all
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                        <div className="p-2">
                            {recentActivities.map((activity, index) => {
                                const config = statusConfig[activity.status];
                                return (
                                    <div
                                        key={activity.id}
                                        className="group relative flex items-start gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                    >
                                        {/* Timeline connector */}
                                        {index < recentActivities.length - 1 && (
                                            <div className="absolute left-[2.35rem] top-12 h-[calc(100%-1.5rem)] w-px bg-neutral-100 dark:bg-neutral-800" />
                                        )}
                                        <div
                                            className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                                                activity.status === 'completed'
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                    : activity.status === 'in-progress'
                                                      ? 'bg-[#0071b7]/10 dark:bg-[#0093dd]/10'
                                                      : 'bg-amber-100 dark:bg-amber-900/30'
                                            }`}
                                        >
                                            <activity.icon
                                                className={`size-4 ${
                                                    activity.status === 'completed'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : activity.status === 'in-progress'
                                                          ? 'text-[#0071b7] dark:text-[#0093dd]'
                                                          : 'text-amber-600 dark:text-amber-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {activity.title}
                                                </p>
                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg}`}
                                                >
                                                    <span className={`size-1.5 rounded-full ${config.dot}`} />
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                            {activity.time}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                Quick Actions
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-4">
                            {quickActions.map((action) => (
                                <button
                                    key={action.title}
                                    className="group relative overflow-hidden rounded-xl border border-neutral-100 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800"
                                >
                                    <div
                                        className={`mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <action.icon className="size-5 text-white" />
                                    </div>
                                    <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                        {action.title}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                        {action.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Department Progress */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                Department Progress
                            </h2>
                            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <MoreHorizontal className="size-4" />
                            </button>
                        </div>
                        <div className="space-y-4 p-5">
                            {departmentProgress.map((dept) => (
                                <div key={dept.name}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            {dept.name}
                                        </span>
                                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                            {dept.tasks}/{dept.total}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            className={`h-full rounded-full ${dept.color} transition-all duration-700`}
                                            style={{ width: `${(dept.tasks / dept.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Schedule */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                                Upcoming Schedule
                            </h2>
                        </div>
                        <div className="space-y-2 p-3">
                            {[
                                {
                                    title: 'Team Meeting',
                                    time: 'Today, 14:00',
                                    icon: CalendarDays,
                                    gradient: 'from-[#0071b7] to-[#0093dd]',
                                    bg: 'bg-[#0071b7]/5 dark:bg-[#0093dd]/5',
                                },
                                {
                                    title: 'Maintenance Review',
                                    time: 'Tomorrow, 09:00',
                                    icon: Clock,
                                    gradient: 'from-amber-500 to-orange-400',
                                    bg: 'bg-amber-50 dark:bg-amber-900/10',
                                },
                                {
                                    title: 'Safety Inspection',
                                    time: 'Friday, 08:00',
                                    icon: CheckCircle2,
                                    gradient: 'from-emerald-500 to-teal-400',
                                    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                                },
                            ].map((event) => (
                                <div
                                    key={event.title}
                                    className={`flex items-center gap-3 rounded-xl ${event.bg} p-3 transition-colors hover:opacity-80`}
                                >
                                    <div
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${event.gradient} shadow-sm`}
                                    >
                                        <event.icon className="size-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                                            {event.title}
                                        </p>
                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                            {event.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
