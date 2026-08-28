<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\WorkOrder;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $now = CarbonImmutable::now();

        $stats = $this->buildStats();
        $urgentTasks = WorkOrder::where('status_tiket', 'Pending HOD')
            ->where('prioritas', 'like', 'Urgent%')
            ->count();
        $overdueWorkOrders = WorkOrder::whereDate('deadline_date', '<', today())
            ->whereNotIn('status_pekerjaan', ['Selesai', 'completed'])
            ->count();
        $weekly = $this->buildWeeklySeries($now);
        $departmentProgress = $this->buildDepartmentProgress();
        $recentActivities = $this->buildRecentActivities();
        $upcomingSchedule = $this->buildUpcomingSchedule($now);

        $user = $request->user();
        $firstName = $this->extractFirstName($user?->name);

        return Inertia::render('dashboard', [
            'greeting' => [
                'key' => $this->greetingKey($now),
                'first_name' => $firstName,
                'local_time' => $now->toIso8601String(),
            ],
            'stats' => $stats,
            'weekly' => $weekly,
            'departmentProgress' => $departmentProgress,
            'recentActivities' => $recentActivities,
            'upcomingSchedule' => $upcomingSchedule,
            'pendingApprovals' => $stats['pending_approvals']['value'],
            'urgentTasks' => $urgentTasks,
            'overdueWorkOrders' => $overdueWorkOrders,
        ]);
    }

    /**
     * Build the four headline metric cards from real work order data.
     *
     * @return array<string, array{title:string,value:int,change:string,changeType:string,icon:string,sparkData:int[]}>
     */
    private function buildStats(): array
    {
        $activeStatuses = ['Pending HOD', 'hod_approved', 'assigned', 'scheduled', 'in_progress', 'pending_verification'];

        $active = WorkOrder::whereIn('status_tiket', $activeStatuses)
            ->where('status_tiket', '!=', 'Executed')
            ->count();

        $completed = WorkOrder::where('status_tiket', 'Executed')->count();

        $pendingApprovals = WorkOrder::where('status_tiket', 'Pending HOD')->count();
        $urgentPending = WorkOrder::where('status_tiket', 'Pending HOD')
            ->where('prioritas', 'like', 'Urgent%')
            ->count();

        $teamMembers = Employee::count();

        $completedThisWeek = WorkOrder::where('status_tiket', 'Executed')
            ->where('verified_at', '>=', now()->subDays(7))
            ->count();
        $completedPrevWeek = WorkOrder::where('status_tiket', 'Executed')
            ->whereBetween('verified_at', [now()->subDays(14), now()->subDays(7)])
            ->count();
        $weeklyDelta = $this->formatDelta($completedThisWeek, $completedPrevWeek);

        $createdThisWeek = WorkOrder::where('tgl_work_order', '>=', now()->subDays(7)->toDateString())->count();
        $createdPrevWeek = WorkOrder::whereBetween('tgl_work_order', [
            now()->subDays(14)->toDateString(),
            now()->subDays(7)->toDateString(),
        ])->count();
        $activeDelta = $this->formatDelta($createdThisWeek, $createdPrevWeek, suffix: ' this week');

        $newEmployeesThisMonth = Employee::where('created_at', '>=', now()->subDays(30))->count();
        $teamDelta = $newEmployeesThisMonth > 0
            ? '+'.$newEmployeesThisMonth.' this month'
            : 'No new members';

        return [
            'active_work_orders' => [
                'title' => 'Active Work Orders',
                'value' => $active,
                'change' => $activeDelta,
                'changeType' => $createdThisWeek >= $createdPrevWeek ? 'positive' : 'neutral',
                'icon' => 'ClipboardList',
                'sparkData' => $this->buildSparkline('tgl_work_order', 7),
            ],
            'tasks_completed' => [
                'title' => 'Tasks Completed',
                'value' => $completed,
                'change' => $weeklyDelta,
                'changeType' => $completedThisWeek >= $completedPrevWeek ? 'positive' : 'negative',
                'icon' => 'CheckCircle2',
                'sparkData' => $this->buildSparkline('verified_at', 7),
            ],
            'pending_approvals' => [
                'title' => 'Pending Approvals',
                'value' => $pendingApprovals,
                'change' => $urgentPending > 0 ? $urgentPending.' urgent' : 'No urgent',
                'changeType' => $urgentPending > 0 ? 'negative' : 'positive',
                'icon' => 'Zap',
                'sparkData' => $this->buildPendingSparkline(7),
            ],
            'team_members' => [
                'title' => 'Team Members',
                'value' => $teamMembers,
                'change' => $teamDelta,
                'changeType' => 'neutral',
                'icon' => 'Users',
                'sparkData' => $this->buildTeamSparkline(7),
            ],
        ];
    }

    /**
     * Build the 7-day work-order series for the weekly bar chart.
     *
     * @return array<int, array{day:string,value:int}>
     */
    private function buildWeeklySeries(CarbonImmutable $now): array
    {
        $start = $now->subDays(6)->startOfDay();

        $counts = WorkOrder::query()
            ->select(DB::raw('DATE(tgl_work_order) as d'), DB::raw('COUNT(*) as c'))
            ->where('tgl_work_order', '>=', $start->toDateString())
            ->groupBy('d')
            ->pluck('c', 'd')
            ->all();

        $series = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $start->addDays($i);
            $key = $date->toDateString();
            $series[] = [
                'day' => $date->format('D'),
                'value' => (int) ($counts[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Build per-department progress (active vs total work orders).
     *
     * @return array<int, array{name:string,tasks:int,total:int}>
     */
    private function buildDepartmentProgress(): array
    {
        $activeStatuses = ['Pending HOD', 'hod_approved', 'assigned', 'scheduled', 'in_progress', 'pending_verification'];

        $totals = WorkOrder::query()
            ->select('department_tujuan', DB::raw('COUNT(*) as total'))
            ->whereNotNull('department_tujuan')
            ->groupBy('department_tujuan')
            ->pluck('total', 'department_tujuan');

        $actives = WorkOrder::query()
            ->select('department_tujuan', DB::raw('COUNT(*) as active'))
            ->whereNotNull('department_tujuan')
            ->whereIn('status_tiket', $activeStatuses)
            ->where('status_tiket', '!=', 'Executed')
            ->groupBy('department_tujuan')
            ->pluck('active', 'department_tujuan');

        $rows = [];
        foreach ($totals as $name => $total) {
            $active = (int) ($actives[$name] ?? 0);
            $rows[] = [
                'name' => $name,
                'tasks' => $active,
                'total' => (int) $total,
            ];
        }

        usort($rows, fn (array $a, array $b) => $b['total'] <=> $a['total']);

        if (empty($rows)) {
            return Department::orderBy('nama_department')
                ->get(['nama_department'])
                ->map(fn (Department $d) => [
                    'name' => $d->nama_department,
                    'tasks' => 0,
                    'total' => 0,
                ])
                ->all();
        }

        return array_slice($rows, 0, 6);
    }

    /**
     * Build the recent activity feed from the most recently updated work orders.
     *
     * @return array<int, array{id:string,title:string,description:string,time:string,icon:string,status:string,href:string}>
     */
    private function buildRecentActivities(): array
    {
        $items = WorkOrder::query()
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get();

        return $items->map(function (WorkOrder $wo): array {
            $status = $this->resolveActivityStatus($wo);
            $icon = $this->resolveActivityIcon($wo);

            return [
                'id' => (string) $wo->id_work_order,
                'title' => $wo->no_work_order ?? ('WO-'.$wo->id_work_order),
                'description' => $wo->rincian_pekerjaan ?? 'Work order',
                'time' => $wo->updated_at?->diffForHumans() ?? '',
                'icon' => $icon,
                'status' => $status,
                'href' => route('work-orders.show', $wo->id_work_order, false),
            ];
        })->all();
    }

    /**
     * Build the upcoming schedule list (today + next scheduled work).
     *
     * @return array<int, array{title:string,time:string,icon:string,color:string}>
     */
    private function buildUpcomingSchedule(CarbonImmutable $now): array
    {
        $schedule = [];

        $dueToday = WorkOrder::query()
            ->where('scheduled_date', $now->toDateString())
            ->count();
        if ($dueToday > 0) {
            $schedule[] = [
                'title' => 'Scheduled work today',
                'time' => $dueToday.' work order'.($dueToday === 1 ? '' : 's').' due',
                'icon' => 'CalendarDays',
                'color' => 'from-primary to-[#0093dd]',
            ];
        }

        $next = WorkOrder::query()
            ->whereNotNull('scheduled_date')
            ->where('scheduled_date', '>', $now->toDateString())
            ->orderBy('scheduled_date')
            ->limit(2)
            ->get();

        foreach ($next as $wo) {
            $schedule[] = [
                'title' => $wo->no_work_order ?? ('WO-'.$wo->id_work_order),
                'time' => CarbonImmutable::parse($wo->scheduled_date)->format('D, d M'),
                'icon' => 'Clock',
                'color' => 'from-amber-500 to-orange-400',
            ];
        }

        $pending = WorkOrder::where('status_tiket', 'Pending HOD')->count();
        if ($pending > 0) {
            $schedule[] = [
                'title' => 'Approvals waiting',
                'time' => $pending.' work order'.($pending === 1 ? '' : 's').' need HOD',
                'icon' => 'Zap',
                'color' => 'from-rose-500 to-pink-400',
            ];
        }

        if (empty($schedule)) {
            $schedule[] = [
                'title' => 'No upcoming schedule',
                'time' => 'Everything is clear for now',
                'icon' => 'CheckCircle2',
                'color' => 'from-emerald-500 to-teal-400',
            ];
        }

        return $schedule;
    }

    /**
     * Build a 7-point daily sparkline for work orders created per day.
     *
     * @return array<int, int>
     */
    private function buildSparkline(string $column, int $days): array
    {
        $start = now()->subDays($days - 1)->startOfDay();
        $rows = WorkOrder::query()
            ->select(DB::raw('DATE('.$column.') as d'), DB::raw('COUNT(*) as c'))
            ->where($column, '>=', $start)
            ->groupBy('d')
            ->pluck('c', 'd')
            ->all();

        $data = [];
        for ($i = 0; $i < $days; $i++) {
            $key = $start->copy()->addDays($i)->toDateString();
            $data[] = (int) ($rows[$key] ?? 0);
        }

        return $data;
    }

    /**
     * @return array<int, int>
     */
    private function buildPendingSparkline(int $days): array
    {
        $start = now()->subDays($days - 1)->startOfDay();
        $rows = WorkOrder::query()
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as c'))
            ->where('status_tiket', 'Pending HOD')
            ->where('created_at', '>=', $start)
            ->groupBy('d')
            ->pluck('c', 'd')
            ->all();

        $data = [];
        for ($i = 0; $i < $days; $i++) {
            $key = $start->copy()->addDays($i)->toDateString();
            $data[] = (int) ($rows[$key] ?? 0);
        }

        return $data;
    }

    /**
     * @return array<int, int>
     */
    private function buildTeamSparkline(int $days): array
    {
        $start = now()->subDays($days - 1)->startOfDay();
        $rows = Employee::query()
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as c'))
            ->where('created_at', '>=', $start)
            ->groupBy('d')
            ->pluck('c', 'd')
            ->all();

        $data = [];
        for ($i = 0; $i < $days; $i++) {
            $key = $start->copy()->addDays($i)->toDateString();
            $data[] = (int) ($rows[$key] ?? 0);
        }

        return $data;
    }

    private function resolveActivityStatus(WorkOrder $wo): string
    {
        $map = [
            'Executed' => 'completed',
            'Rejected' => 'completed',
            'pending_verification' => 'in-progress',
            'in_progress' => 'in-progress',
            'assigned' => 'in-progress',
            'hod_approved' => 'in-progress',
            'scheduled' => 'pending',
        ];

        return $map[$wo->status_tiket] ?? ($wo->status_pekerjaan === 'completed' ? 'completed' : 'pending');
    }

    private function resolveActivityIcon(WorkOrder $wo): string
    {
        if ($wo->priority_type === 'urgent' || str_starts_with((string) $wo->prioritas, 'Urgent')) {
            return 'Zap';
        }

        return match (true) {
            str_contains((string) $wo->rincian_pekerjaan, 'listrik') => 'Zap',
            str_contains((string) $wo->rincian_pekerjaan, 'lampu') => 'Zap',
            str_contains((string) $wo->rincian_pekerjaan, 'CCTV') => 'MailOpen',
            default => 'ClipboardList',
        };
    }

    private function greetingKey(CarbonImmutable $now): string
    {
        $hour = (int) $now->format('H');

        return match (true) {
            $hour < 12 => 'morning',
            $hour < 17 => 'afternoon',
            $hour < 21 => 'evening',
            default => 'night',
        };
    }

    private function extractFirstName(?string $fullName): string
    {
        if (! $fullName) {
            return 'there';
        }

        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $first = $parts[0] ?? '';

        return $first !== '' ? $first : 'there';
    }

    private function formatDelta(int $current, int $previous, string $suffix = ' this week'): string
    {
        if ($current === 0 && $previous === 0) {
            return 'No activity'.$suffix;
        }

        if ($previous === 0) {
            return '+'.$current.$suffix;
        }

        $percent = (int) round((($current - $previous) / $previous) * 100);
        $sign = $percent >= 0 ? '+' : '';

        return $sign.$percent.'%'.$suffix;
    }
}
