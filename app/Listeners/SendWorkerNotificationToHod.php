<?php

namespace App\Listeners;

use App\Events\WorkOrderCreated;
use App\Models\Department;
use App\Models\User;
use App\Models\WhatsappConfig;
use App\Models\WhatsappNotificationLog;
use App\Services\WahaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendWorkerNotificationToHod implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;

    public array $backoff = [60, 300, 900];

    public function handle(WorkOrderCreated $event): void
    {
        $wo = $event->workOrder;

        $dept = Department::where('nama_department', $wo->department_tujuan)->first();

        if (! $dept || ! $dept->hod_user_id) {
            Log::channel('whatsapp')->warning("WorkOrder {$wo->no_work_order}: no HOD found for dept {$wo->department_tujuan}");

            return;
        }

        $hod = User::find($dept->hod_user_id);

        if (! $hod || ! $hod->phone) {
            Log::channel('whatsapp')->warning("WorkOrder {$wo->no_work_order}: HOD user {$dept->hod_user_id} has no phone");

            return;
        }

        $config = WhatsappConfig::where('is_active', true)->first();

        if (! $config) {
            Log::channel('whatsapp')->warning("WorkOrder {$wo->no_work_order}: no active WAHA config");

            return;
        }

        $session = $config->default_session ?? 'default';

        $message = $this->buildMessage($wo);

        try {
            $waha = app(WahaService::class);
            $response = $waha->sendTextMessage($session, $hod->phone, $message);

            WhatsappNotificationLog::create([
                'worker_id' => $wo->id_work_order,
                'hod_id' => $hod->id,
                'phone_number' => $hod->phone,
                'message' => $message,
                'status' => 'SENT',
                'response_payload' => $response,
                'retry_count' => $this->attempts(),
            ]);

            Log::channel('whatsapp')->info("WorkOrder {$wo->no_work_order}: notification sent to HOD {$hod->phone}");
        } catch (\Throwable $e) {
            WhatsappNotificationLog::create([
                'worker_id' => $wo->id_work_order,
                'hod_id' => $hod->id,
                'phone_number' => $hod->phone,
                'message' => $message,
                'status' => 'FAILED',
                'response_payload' => ['error' => $e->getMessage()],
                'retry_count' => $this->attempts(),
            ]);

            Log::channel('whatsapp')->error("WorkOrder {$wo->no_work_order}: notification failed: {$e->getMessage()}");

            throw $e;
        }
    }

    private function buildMessage($wo): string
    {
        $priorityLabel = strtoupper($wo->priority_type).' / '.ucfirst($wo->prioritas);

        return "🎫 WORK ORDER BARU\n"
            ."━━━━━━━━━━━━━━━━━━\n\n"
            ."No: {$wo->no_work_order}\n"
            ."Lokasi: {$wo->lokasi}\n"
            ."Departemen: {$wo->department_tujuan}\n"
            ."Prioritas: {$priorityLabel}\n"
            ."Pemohon: {$wo->user_requester}\n\n"
            ."Rincian Pekerjaan:\n{$wo->rincian_pekerjaan}\n"
            .($wo->keterangan ? "\nKeterangan:\n{$wo->keterangan}\n" : '')
            ."\n━━━━━━━━━━━━━━━━━━";
    }
}
