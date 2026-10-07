<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\WorkOrder;
use App\Notifications\AppNotificationService;
use App\Notifications\WorkOrderProgressNotification;
use App\Services\BusinessDayCalculator;
use App\Services\EscalationRecipientResolver;
use Illuminate\Console\Command;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Support\Facades\Log;

class CheckWorkOrderDeadlines extends Command implements ShouldBeUnique
{
    protected $signature = 'deadlines:check';

    protected $description = 'Check work order deadlines and send escalation notifications (H+3, H+5, H+6)';

    public int $uniqueFor = 3600;

    public function __construct(
        private readonly BusinessDayCalculator $calculator,
        private readonly EscalationRecipientResolver $resolver,
    ) {
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
            // Eskalasi dihitung dari tanggal assign (FR-2.1 / FR-2.2).
            $startDate = $wo->deadlineStartDate();

            if (! $startDate) {
                continue;
            }

            $elapsedDays = $this->calculator->daysElapsedSince($startDate);

            // H+3 — Team Leader department terkait.
            if ($elapsedDays >= 3 && is_null($wo->escalation_h3_sent_at)) {
                $this->escalate($wo, 3, $elapsedDays);
                $wo->update([
                    'escalation_h3_sent_at' => now(),
                    'status_pekerjaan' => $wo->status_pekerjaan === 'On Progress' ? $wo->status_pekerjaan : 'On Progress',
                ]);
                $escalated++;
            }

            // H+5 — HOD (dengan rantai fallback OQ 6).
            if ($elapsedDays >= 5 && is_null($wo->escalation_h5_sent_at)) {
                $this->escalate($wo, 5, $elapsedDays);
                $wo->update(['escalation_h5_sent_at' => now()]);
                $escalated++;
            }

            // H+6 — DGM/GM.
            if ($elapsedDays >= 6 && is_null($wo->escalation_h6_sent_at)) {
                $this->escalate($wo, 6, $elapsedDays);
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

    private function escalate(WorkOrder $wo, int $level, int $elapsedDays): void
    {
        $recipients = $this->resolver->forLevel($wo, $level);

        if ($recipients->isEmpty()) {
            Log::warning("Escalation H+{$level} for WO {$wo->no_work_order} has no recipients.");

            return;
        }

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

        foreach ($recipients as $recipient) {
            /** @var User $recipient */
            AppNotificationService::createForUser($recipient, 'escalation_h'.$level, $data);

            if ($recipient->phone) {
                $recipient->notify(new WorkOrderProgressNotification($wo, 'in_progress', $message));
            }

            Log::info("Escalation H+{$level} sent for WO {$wo->no_work_order} to {$recipient->name}.");
        }
    }
}
