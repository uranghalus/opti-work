<?php

namespace App\Console\Commands;

use App\Models\AppNotification;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkOrder;
use App\Notifications\AppNotificationService;
use App\Notifications\WorkOrderProgressNotification;
use App\Services\BusinessDayCalculator;
use Illuminate\Console\Command;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CheckWorkOrderDeadlines extends Command implements ShouldBeUnique
{
    protected $signature = 'deadlines:check';

    protected $description = 'Check work order deadlines and send escalation notifications (H+3, H+5, H+6)';

    public int $uniqueFor = 3600;

    public function __construct(private readonly BusinessDayCalculator $calculator)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $workOrders = WorkOrder::whereNotIn('status_pekerjaan', ['Selesai', 'Dibatalkan', 'completed', 'rejected'])
            ->whereNotIn('status_tiket', ['Selesai', 'Dibatalkan', 'Executed', 'Rejected'])
            ->get();

        $this->info("Checking {$workOrders->count()} active work orders...");

        $escalated = 0;

        foreach ($workOrders as $wo) {
            // Need assignment date — use scheduled_date or created_at
            $startDate = $wo->scheduled_date ?? $wo->created_at;
            if (! $startDate) {
                continue;
            }

            $elapsedDays = $this->calculator->daysElapsedSince($startDate);

            // H+3 Escalation — notify Team Leader
            if ($elapsedDays >= 3 && is_null($wo->escalation_h3_sent_at)) {
                $this->escalate($wo, 3, $startDate, $elapsedDays);
                $wo->update([
                    'escalation_h3_sent_at' => now(),
                    'status_pekerjaan' => $wo->status_pekerjaan === 'On Progress' ? $wo->status_pekerjaan : 'On Progress',
                ]);
                $escalated++;
            }

            // H+5 Escalation — notify HOD
            if ($elapsedDays >= 5 && is_null($wo->escalation_h5_sent_at)) {
                $this->escalate($wo, 5, $startDate, $elapsedDays);
                $wo->update(['escalation_h5_sent_at' => now()]);
                $escalated++;
            }

            // H+6 Escalation — notify DGM/GM
            if ($elapsedDays >= 6 && is_null($wo->escalation_h6_sent_at)) {
                $this->escalate($wo, 6, $startDate, $elapsedDays);
                $wo->update([
                    'escalation_h6_sent_at' => now(),
                    'is_escalated' => true,
                ]);
                $escalated++;
            }
        }

        $this->info("Escalation check complete. Escalated: {$escalated}");
        Log::info("Deadline escalation check: {$workOrders->count()} WOs checked, {$escalated} escalations sent.");

        return self::SUCCESS;
    }

    private function escalate(WorkOrder $wo, int $level, $startDate, int $elapsedDays): void
    {
        $dept = $wo->id_department ? Department::find($wo->id_department) : null;

        $recipients = match ($level) {
            3 => $this->getTeamLeaders($wo),
            5 => $this->getHods($wo, $dept),
            6 => $this->getDgmGm(),
            default => collect(),
        };

        foreach ($recipients as $recipient) {
            $message = "⚠️ ESCALATION H+{$level}: Work Order {$wo->no_work_order} telah mencapai hari ke-{$elapsedDays}. "
                ."Department: {$wo->department_tujuan}. "
                ."Lokasi: {$wo->lokasi}. "
                ."Prioritas: {$wo->prioritas}. "
                .'Segera tindak lanjuti!';

            $data = [
                'title' => "Escalation H+{$level}",
                'work_order_id' => $wo->id_work_order,
                'no_work_order' => $wo->no_work_order,
                'level' => $level,
                'elapsed_days' => $elapsedDays,
                'message' => $message,
                'url' => "/work-orders/{$wo->id_work_order}",
            ];

            if ($recipient instanceof Employee) {
                AppNotificationService::create($recipient, 'escalation_h'.$level, $data);
                $recipient->notify(new WorkOrderProgressNotification($wo, 'in_progress', $message));
            } else {
                AppNotification::create([
                    'notifiable_type' => User::class,
                    'notifiable_id' => $recipient->id,
                    'type' => 'escalation_h'.$level,
                    'data' => $data,
                ]);
            }

            Log::info("Escalation H+{$level} sent for WO {$wo->no_work_order} to ".($recipient->name ?? 'unknown'));
        }
    }

    private function getTeamLeaders(WorkOrder $wo): Collection
    {
        $ids = collect($wo->assigned_employees ?? [])->map(fn ($employee) => is_array($employee) ? ($employee['id'] ?? null) : $employee)->filter();
        $employees = Employee::whereIn('id_employee', $ids)->get();

        return $employees->isNotEmpty() ? $employees : User::whereHas('roles', fn ($q) => $q->where('name', 'team_leader'))->get();
    }

    private function getHods(WorkOrder $wo, ?Department $dept): Collection
    {
        if ($dept && $dept->hod_user_id) {
            $hod = Employee::find($dept->hod_user_id);
            if ($hod) {
                $user = User::where('email', $hod->email)->first();

                return $user ? collect([$user]) : collect();
            }
        }

        return User::whereHas('roles', fn ($q) => $q->where('name', 'hod'))->get();
    }

    private function getDgmGm(): Collection
    {
        return User::whereHas('roles', fn ($q) => $q->whereIn('name', ['deputy_general_manager', 'general_manager']))->get();
    }
}
