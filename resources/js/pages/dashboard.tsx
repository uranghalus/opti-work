import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock,
    FileText,
    Mail,
    MailOpen,
    Package,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { dashboard } from '@/routes';

type Greeting = {
    key: 'morning' | 'afternoon' | 'evening' | 'night';
    first_name: string;
    local_time: string;
};

type StatCard = {
    title: string;
    value: number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: string;
    sparkData: number[];
};

type WeeklyItem = {
    day: string;
    value: number;
};

type DepartmentProgressItem = {
    name: string;
    tasks: number;
    total: number;
};

type RecentActivityItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    status: 'completed' | 'in-progress' | 'pending';
    href: string;
};

type UpcomingScheduleItem = {
    title: string;
    time: string;
    icon: string;
    color: string;
};

type PageProps = {
    greeting: Greeting;
    stats: Record<string, StatCard>;
    weekly: WeeklyItem[];
    departmentProgress: DepartmentProgressItem[];
    recentActivities: RecentActivityItem[];
    upcomingSchedule: UpcomingScheduleItem[];
    pendingApprovals: number;
    urgentTasks: number;
    overdueWorkOrders: number;
};

const iconMap: Record<string, React.ElementType> = {
    ClipboardList,
    CheckCircle2,
    Zap,
    Users,
    FileText,
    MailOpen,
    Package,
    CalendarDays,
    Clock,
};

const greetingLabels: Record<string, string> = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
};

const quickActions = [
    { title: 'New Work Order', description: 'Create work order', icon: ClipboardList },
    { title: 'Daily Report', description: 'Submit report', icon: FileText },
    { title: 'Send Mail', description: 'Outgoing mail', icon: Mail },
    { title: 'Work Planning', description: 'Plan tasks', icon: TrendingUp },
];

const statusConfig = {
    completed: {
        label: 'Completed',
        dot: 'bg-emerald-500',
        badge: 'border-emerald-200/40 bg-emerald-50 text-emerald-700 dark:border-emerald-800/20 dark:bg-emerald-950/20 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    },
    'in-progress': {
        label: 'In Progress',
        dot: 'bg-primary',
        badge: 'border-primary/20 bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-foreground/80',
        iconBg: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80',
    },
    pending: {
        label: 'Pending',
        dot: 'bg-amber-500',
        badge: 'border-amber-200/40 bg-amber-50 text-amber-700 dark:border-amber-800/20 dark:bg-amber-950/20 dark:text-amber-400',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    },
};

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
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} />
        </svg>
    );
}

export default function Dashboard({
    greeting,
    stats,
    weekly,
    departmentProgress,
    recentActivities,
    upcomingSchedule,
    pendingApprovals,
    urgentTasks,
    overdueWorkOrders,
}: PageProps) {
    const greetingText = `${greetingLabels[greeting.key] ?? 'Good morning'}, ${greeting.first_name}!`;
    const statsArr = Object.values(stats);

    return (
        <div className="w-full space-y-8">
            {/* ---- Hero - Double-Bezel ---- */}
            <div className="animate-fade-in rounded-[2rem] bg-primary/5 p-1.5 ring-1 ring-primary/10">
                <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-primary via-[#0088cc] to-[#0093dd] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] md:px-8 md:py-10">
                    {/* Ambient orbs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-[80px]" />
                        <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-white/10 blur-[60px]" />
                        <div className="absolute right-1/4 top-1/3 size-32 rounded-full bg-white/8 blur-[50px]" />
                    </div>

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-white/90 uppercase backdrop-blur-md">
                                <Zap className="size-3" />
                                Work Management System
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                                    {greetingText}
                                </h1>
                                <p className="mt-1.5 text-sm text-white/75">
                                    You have{' '}
                                    <span className="font-semibold text-white">{pendingApprovals} pending approvals</span> and{' '}
                                    <span className="font-semibold text-white">{urgentTasks} urgent tasks</span> today.{' '}
                                    <span className="font-semibold text-white">{overdueWorkOrders} overdue work orders</span>.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {statsArr.slice(0, 3).map((stat) => (
                                <div
                                    key={stat.title}
                                    className="flex-1 min-w-[70px] rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-center backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/20 sm:flex-initial sm:px-4 sm:py-3"
                                >
                                    <p className="text-lg font-bold text-white md:text-2xl">{stat.value}</p>
                                    <p className="text-[10px] font-semibold tracking-[0.1em] text-white/60 uppercase">
                                        {stat.title === 'Tasks Completed' ? 'Done' : stat.title === 'Team Members' ? 'Team' : stat.title === 'Pending Approvals' ? 'Pending' : stat.title === 'Active Work Orders' ? 'Active' : stat.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Stats Grid — Asymmetrical Bento ---- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsArr.map((stat, i) => {
                    const Icon = iconMap[stat.icon] ?? ClipboardList;

                    return (
                        <div
                            key={stat.title}
                            className={`animate-fade-in animate-delay-${(i + 1) * 100} rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]`}
                        >
                            <div className="group rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2.5">
                                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs font-semibold ${
                                                stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                                                stat.changeType === 'negative' ? 'text-amber-600 dark:text-amber-400' :
                                                'text-muted-foreground'
                                            }`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                                <div className="mt-3.5 opacity-40">
                                    <Sparkline data={stat.sparkData} color={
                                        stat.changeType === 'positive' ? 'text-emerald-400' :
                                        stat.changeType === 'negative' ? 'text-amber-400' : 'text-primary'
                                    } />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ---- Main Grid — Asymmetrical Bento ---- */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* ---- Column: Charts & Activity ---- */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Weekly Overview - Double-Bezel */}
                    <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Weekly Overview</h2>
                                    <p className="text-xs text-muted-foreground">Tasks completed this week</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <span className="size-2 rounded-full bg-primary" />
                                        Completed
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <span className="size-2 rounded-full bg-border" />
                                        Target
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                <div className="flex items-end justify-between gap-2 min-w-[350px] sm:min-w-0">
                                    {weekly.map((d) => {
                                        const maxVal = Math.max(...weekly.map((w) => w.value), 1);

                                        return (
                                            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                                                <span className="text-xs font-semibold text-foreground/70">{d.value}</span>
                                                <div className="relative flex w-full items-end justify-center" style={{ height: 96 }}>
                                                    <div
                                                        className="absolute bottom-0 w-full rounded-lg bg-gradient-to-t from-primary to-[#0093dd] transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                                        style={{ height: `${(d.value / maxVal) * 100}%`, maxHeight: '100%' }}
                                                    />
                                                    <div className="absolute bottom-0 h-full w-full rounded-lg bg-border/30" />
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground/60">{d.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Double-Bezel */}
                    <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
                                    <p className="text-xs text-muted-foreground">Latest updates from your workspace</p>
                                </div>
                                <button className="group flex items-center gap-1 text-sm font-medium text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary/70">
                                    View all
                                    <ChevronRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentActivities.map((activity, index) => {
                                    const config = statusConfig[activity.status];
                                    const Icon = iconMap[activity.icon] ?? ClipboardList;

                                    return (
                                        <div
                                            key={activity.id}
                                            className="group relative flex items-start gap-4 rounded-xl px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent/50"
                                        >
                                            {index < recentActivities.length - 1 && (
                                                <div className="absolute left-[2.1rem] top-12 h-[calc(100%-1.5rem)] w-px bg-border" />
                                            )}
                                            <div className={`relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
                                                <Icon className="size-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                                                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                                                        <span className={`size-1.5 rounded-full ${config.dot}`} />
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 truncate text-sm text-muted-foreground">{activity.description}</p>
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-muted-foreground/60">{activity.time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---- Right Column ---- */}
                <div className="space-y-6">

                    {/* Quick Actions - Double-Bezel */}
                    <div className="animate-fade-in animate-delay-200 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-6">
                            <h2 className="mb-4 text-base font-semibold text-foreground">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.title}
                                        className="group relative overflow-hidden rounded-xl border border-border/40 p-4 text-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
                                    >
                                        <div className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                                            <action.icon className="size-5" />
                                        </div>
                                        <p className="text-xs font-semibold text-foreground">{action.title}</p>
                                        <p className="mt-0.5 text-[10px] text-muted-foreground">{action.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Department Progress - Double-Bezel */}
                    <div className="animate-fade-in animate-delay-300 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-6">
                            <h2 className="mb-5 text-base font-semibold text-foreground">Department Progress</h2>
                            <div className="space-y-4">
                                {departmentProgress.map((dept) => (
                                    <div key={dept.name}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground/70">{dept.name}</span>
                                            <span className="text-xs font-bold text-foreground">{dept.tasks}/{dept.total}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                                style={{ width: `${(dept.tasks / dept.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Schedule - Double-Bezel */}
                    <div className="animate-fade-in animate-delay-400 rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015]">
                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-6">
                            <h2 className="mb-4 text-base font-semibold text-foreground">Upcoming Schedule</h2>
                            <div className="space-y-2">
                                {upcomingSchedule.map((event) => {
                                    const Icon = iconMap[event.icon] ?? CalendarDays;

                                    return (
                                        <div
                                            key={event.title}
                                            className="group flex items-center gap-3 rounded-xl bg-accent/30 p-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent/60"
                                        >
                                            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${event.color} text-white shadow-sm transition-transform duration-500 group-hover:scale-105`}>
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-foreground">{event.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{event.time}</p>
                                            </div>
                                            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-foreground/60" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA — Double-Bezel */}
            <div className="animate-fade-in animate-delay-500 rounded-[2rem] border border-primary/10 bg-primary/[0.02] p-1.5">
                <div className="flex flex-col items-center gap-5 rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-primary/5 to-transparent px-6 py-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] sm:px-8 sm:py-10 md:flex-row md:justify-between md:text-left">
                    <div className="space-y-1">
                        <p className="text-base font-bold text-foreground sm:text-lg">Need to report an issue?</p>
                        <p className="text-sm text-muted-foreground">Submit a work order or contact your supervisor.</p>
                    </div>
                    <Link
                        href={dashboard()}
                        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] sm:w-auto"
                    >
                        Create Work Order
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                            <ArrowRight className="size-3.5" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
    ],
};
