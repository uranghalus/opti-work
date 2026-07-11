<?php

namespace App\Http\Controllers;

use App\Events\WorkOrderStatusChanged;
use App\Helpers\WahaHelper;
use App\Models\Department;
use App\Models\Employee;
use App\Models\WorkOrder;
use App\Notifications\AppNotificationService;
use App\Notifications\WorkOrderProgressNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // Handle GET as health check
        if ($request->isMethod('get')) {
            return response()->json([
                'status' => 'ok',
                'message' => 'WAHA webhook endpoint is ready',
                'instructions' => 'Configure this URL as the webhook in your WAHA server settings (HTTP -> Webhooks)',
            ]);
        }

        $payload = $request->all();

        Log::info('WAHA webhook received', ['payload' => $payload]);

        $event = $payload['event'] ?? '';
        if ($event !== 'message') {
            return response()->json(['status' => 'ignored']);
        }

        // WAHA v1: payload.body, payload.from
        // WAHA v2: payload.message.conversation, payload.key.remoteJid
        $messageBody = '';
        $senderId = '';

        if (! empty($payload['payload']['body'])) {
            $messageBody = trim($payload['payload']['body']);
        } elseif (! empty($payload['payload']['message']['conversation'])) {
            $messageBody = trim($payload['payload']['message']['conversation']);
        } elseif (! empty($payload['payload']['message']['extendedTextMessage']['text'])) {
            $messageBody = trim($payload['payload']['message']['extendedTextMessage']['text']);
        } elseif (! empty($payload['body'])) {
            $messageBody = trim($payload['body']);
        }

        // Priority: SenderAlt (real phone) > from > key.remoteJid
        if (! empty($payload['payload']['_data']['Info']['SenderAlt'])) {
            $senderId = $payload['payload']['_data']['Info']['SenderAlt'];
        } elseif (! empty($payload['payload']['from'])) {
            $senderId = $payload['payload']['from'];
        } elseif (! empty($payload['payload']['key']['remoteJid'])) {
            $senderId = $payload['payload']['key']['remoteJid'];
        } elseif (! empty($payload['from'])) {
            $senderId = $payload['from'];
        }

        if (empty($messageBody) || empty($senderId)) {
            Log::warning('WAHA webhook ignored - missing body or sender', ['payload' => $payload]);

            return response()->json(['status' => 'ignored']);
        }

        $phoneNumber = str_replace('@c.us', '', $senderId);
        $phoneNumber = str_replace('@s.whatsapp.net', '', $phoneNumber);
        $phoneNumber = str_replace('@lid', '', $phoneNumber);
        $phoneNumber = preg_replace('/\D/', '', $phoneNumber);

        Log::info("WAHA webhook parsed: from={$phoneNumber}, body={$messageBody}");

        // Cari employee dengan normalisasi nomor (handle 0 prefix vs 62 prefix)
        $hod = $this->findEmployeeByPhone($phoneNumber);
        if (! $hod) {
            Log::warning("WAHA webhook - employee not found for phone: {$phoneNumber}");
            $this->sendReply($phoneNumber, 'Nomor Anda tidak terdaftar sebagai karyawan.');

            return response()->json(['status' => 'unknown_sender']);
        }

        // Cek apakah ini balasan untuk pemilihan employee (angka atau angka dipisah koma)
        if (preg_match('/^[\d,\s]+$/', $messageBody)) {
            $result = $this->handleEmployeeSelection($phoneNumber, $messageBody);
            if ($result !== null) {
                return $result;
            }
        }

        // Parse command utama
        if (! preg_match('/^(SETUJU|TOLAK|JADWALKAN|TUGASKAN)\s+(\S+)(?:\s+(.+))?$/i', $messageBody, $matches)) {
            // Cek apakah ada pending assignment
            if ($this->hasPendingAssignment($phoneNumber)) {
                $this->sendReply($phoneNumber,
                    'Balas dengan nomor karyawan yang ingin ditugaskan, pisahkan dengan koma.'.PHP_EOL.
                    'Contoh: 1,3,5'
                );

                return response()->json(['status' => 'awaiting_selection']);
            }

            $this->sendReply($phoneNumber,
                'Format tidak dikenali. Balas dengan:'.PHP_EOL.
                'SETUJU NO_WO'.PHP_EOL.
                'TOLAK NO_WO alasan'.PHP_EOL.
                'JADWALKAN NO_WO YYYY-MM-DD'
            );

            return response()->json(['status' => 'unrecognized']);
        }

        $command = strtoupper($matches[1]);
        $woNumber = $matches[2];
        $argument = $matches[3] ?? null;

        $workOrder = WorkOrder::where('no_work_order', $woNumber)->first();
        if (! $workOrder) {
            $this->sendReply($phoneNumber, "Work Order {$woNumber} tidak ditemukan.");

            return response()->json(['status' => 'not_found']);
        }

        if (! in_array($workOrder->status_pekerjaan, ['pending_hod_review', null]) && $workOrder->status_tiket !== 'Pending HOD') {
            $this->sendReply($phoneNumber, "Work Order {$woNumber} sudah tidak memerlukan review HOD.");

            return response()->json(['status' => 'wrong_state']);
        }

        $department = Department::find($workOrder->id_department);
        if (! $department || $department->hod_user_id !== $hod->id_employee) {
            $this->sendReply($phoneNumber, "Anda bukan HOD untuk departemen Work Order {$woNumber}.");

            return response()->json(['status' => 'not_authorized']);
        }

        return match ($command) {
            'SETUJU' => $this->processApprove($workOrder, $hod, $phoneNumber, $argument),
            'TOLAK' => $this->processReject($workOrder, $hod, $phoneNumber, $argument),
            'JADWALKAN' => $this->processSchedule($workOrder, $hod, $phoneNumber, $argument),
            default => response()->json(['status' => 'unknown_command']),
        };
    }

    private function processApprove(WorkOrder $workOrder, Employee $hod, string $phoneNumber, ?string $notes): JsonResponse
    {
        $isUrgent = $workOrder->urgent_sub_type === 'by_accident';

        $previousStatus = $workOrder->status_pekerjaan;

        $workOrder->update([
            'hod_action' => 'execute_immediately',
            'status_pekerjaan' => 'hod_approved',
            'status_tiket' => 'Pending HOD',
            'keterangan' => trim('Disetujui via WhatsApp. '.($notes ?? '')),
        ]);

        WorkOrderStatusChanged::dispatch($workOrder, $previousStatus);

        // Notify requester
        $requester = Employee::where('nama_employee', $workOrder->user_requester)->first();
        if ($requester) {
            AppNotificationService::workOrderStatusChanged($requester, $workOrder, $previousStatus);
        }

        $department = Department::find($workOrder->id_department);
        $employees = Employee::with('position')
            ->where('id_department', $department?->id_department)
            ->orderBy('nama_employee')
            ->get();

        if ($employees->isEmpty()) {
            $msg = "✅ Work Order {$workOrder->no_work_order} DISETUJUI.".PHP_EOL;
            if ($isUrgent) {
                $msg .= 'Karena urgensi by-accident, pekerjaan harus segera dilaksanakan.'.PHP_EOL;
            }
            $msg .= PHP_EOL.'Tidak ada karyawan di departemen ini. Silakan tugaskan melalui web.';
            $this->sendReply($phoneNumber, $msg);

            return response()->json(['status' => 'approved']);
        }

        // Simpan pending assignment ke cache
        $cacheKey = "waha_assign_{$phoneNumber}";
        $employeeList = $employees->map(function ($e) {
            return [
                'id' => $e->id_employee,
                'name' => $e->nama_employee,
                'position' => $e->position?->nama_position,
            ];
        })->toArray();

        Cache::put($cacheKey, [
            'work_order_id' => $workOrder->id_work_order,
            'work_order_number' => $workOrder->no_work_order,
            'employees' => $employeeList,
        ], now()->addMinutes(30));

        // Bangun daftar employee
        $listText = '';
        foreach ($employeeList as $i => $emp) {
            $num = $i + 1;
            $pos = $emp['position'] ? " ({$emp['position']})" : '';
            $listText .= "{$num}. {$emp['name']}{$pos}".PHP_EOL;
        }

        $urgentNote = $isUrgent
            ? PHP_EOL.'⚠️ By-accident — pekerjaan harus segera dikerjakan setelah ditugaskan.'.PHP_EOL
            : '';

        $this->sendReply($phoneNumber,
            "✅ Work Order {$workOrder->no_work_order} DISETUJUI.".$urgentNote.PHP_EOL.
            '📋 *Pilih Tim:*'.PHP_EOL.
            $listText.PHP_EOL.
            'Balas dengan nomor karyawan yang ingin ditugaskan (pisahkan dengan koma).'.PHP_EOL.
            'Contoh: 1,3,5'.PHP_EOL.
            'Ketik 0 jika akan menugaskan nanti melalui web.'
        );

        return response()->json(['status' => 'approved_awaiting_team']);
    }

    private function handleEmployeeSelection(string $phoneNumber, string $messageBody): ?JsonResponse
    {
        $cacheKey = "waha_assign_{$phoneNumber}";
        $pending = Cache::get($cacheKey);

        if (! $pending) {
            return null;
        }

        $selectedNumbers = array_filter(array_map('trim', explode(',', $messageBody)));
        $selectedNumbers = array_map('intval', $selectedNumbers);

        // User ketik 0 — skip assignment
        if (in_array(0, $selectedNumbers)) {
            Cache::forget($cacheKey);
            $this->sendReply($phoneNumber,
                'Penugasan tim ditunda. Silakan tugaskan melalui web.'.PHP_EOL.
                '🔗 '.url("/work-orders/{$pending['work_order_id']}/assign")
            );

            return response()->json(['status' => 'assign_skipped']);
        }

        // Validasi nomor yang dipilih
        $totalEmployees = count($pending['employees']);
        $invalidNumbers = array_filter($selectedNumbers, fn ($n) => $n < 1 || $n > $totalEmployees);

        if (! empty($invalidNumbers)) {
            $this->sendReply($phoneNumber,
                'Nomor tidak valid: '.implode(', ', $invalidNumbers).'.'.PHP_EOL.
                "Pilih nomor 1-{$totalEmployees} atau ketik 0 untuk menunda."
            );

            return response()->json(['status' => 'invalid_numbers']);
        }

        // Ambil employee yang dipilih
        $assignedEmployees = [];
        foreach ($selectedNumbers as $num) {
            $idx = $num - 1;
            if (isset($pending['employees'][$idx])) {
                $assignedEmployees[] = $pending['employees'][$idx];
            }
        }

        if (empty($assignedEmployees)) {
            $this->sendReply($phoneNumber, 'Tidak ada karyawan yang dipilih. Silakan coba lagi.');

            return response()->json(['status' => 'no_selection']);
        }

        // Update work order
        $workOrder = WorkOrder::find($pending['work_order_id']);
        if ($workOrder) {
            $previousStatus = $workOrder->status_pekerjaan;

            $workOrder->update([
                'assigned_employees' => $assignedEmployees,
                'personnel_count' => count($assignedEmployees),
                'status_pekerjaan' => 'assigned',
                'keterangan' => trim(($workOrder->keterangan ?? '').' Tim ditugaskan via WhatsApp.'),
            ]);

            WorkOrderStatusChanged::dispatch($workOrder, $previousStatus);

            // Notifikasi ke requester bahwa WO sedang diproses
            $requester = $workOrder->user_requester
                ? Employee::where('nama_employee', $workOrder->user_requester)->first()
                : null;

            if ($requester && $requester->number) {
                $requester->notify(new WorkOrderProgressNotification(
                    $workOrder,
                    'assigned',
                    'Tim telah ditugaskan dan pekerjaan sedang diproses.'
                ));
            }

            Cache::forget($cacheKey);

            $names = collect($assignedEmployees)->pluck('name')->implode(', ');
            $this->sendReply($phoneNumber,
                "✅ Tim berhasil ditugaskan untuk {$pending['work_order_number']}:".PHP_EOL.
                $names.PHP_EOL.PHP_EOL.
                '🔗 Detail: '.url("/work-orders/{$workOrder->id_work_order}")
            );

            return response()->json(['status' => 'assigned']);
        }

        Cache::forget($cacheKey);
        $this->sendReply($phoneNumber, 'Terjadi kesalahan. Silakan coba lagi.');

        return response()->json(['status' => 'error']);
    }

    private function hasPendingAssignment(string $phoneNumber): bool
    {
        return Cache::has("waha_assign_{$phoneNumber}");
    }

    /**
     * Cari employee berdasarkan nomor telepon dengan normalisasi format.
     * Handle perbedaan: 0 prefix vs 62 prefix.
     */
    private function findEmployeeByPhone(string $phone): ?Employee
    {
        // Coba exact match dulu
        $employee = Employee::where('number', $phone)->first();
        if ($employee) {
            return $employee;
        }

        // Coba dengan 0 prefix (misal DB: 0812xxx, WAHA: 62812xxx)
        if (str_starts_with($phone, '62')) {
            $withZero = '0'.substr($phone, 2);
            $employee = Employee::where('number', $withZero)->first();
            if ($employee) {
                return $employee;
            }
        }

        // Coba dengan 62 prefix (misal DB: 62812xxx, WAHA: 0812xxx)
        if (str_starts_with($phone, '0')) {
            $with62 = '62'.substr($phone, 1);
            $employee = Employee::where('number', $with62)->first();
            if ($employee) {
                return $employee;
            }
        }

        // Coba dengan 8 prefix (cocokkan 10 digit terakhir)
        $last10 = substr($phone, -10);
        if (strlen($last10) === 10) {
            $employee = Employee::where('number', 'like', '%'.$last10)->first();
            if ($employee) {
                return $employee;
            }
        }

        return null;
    }

    private function processReject(WorkOrder $workOrder, Employee $hod, string $phoneNumber, ?string $reason): JsonResponse
    {
        $previousStatus = $workOrder->status_pekerjaan;

        $workOrder->update([
            'status_pekerjaan' => 'rejected',
            'status_tiket' => 'Rejected',
            'keterangan' => trim('Ditolak via WhatsApp. Alasan: '.($reason ?? 'Tidak diberikan')),
        ]);

        WorkOrderStatusChanged::dispatch($workOrder, $previousStatus);

        // Notify requester
        $requester = Employee::where('nama_employee', $workOrder->user_requester)->first();
        if ($requester) {
            AppNotificationService::workOrderStatusChanged($requester, $workOrder, $previousStatus);
        }

        $this->sendReply($phoneNumber,
            "❌ Work Order {$workOrder->no_work_order} DITOLAK.".PHP_EOL.
            ($reason ? "Alasan: {$reason}" : '')
        );

        return response()->json(['status' => 'rejected']);
    }

    private function processSchedule(WorkOrder $workOrder, Employee $hod, string $phoneNumber, ?string $dateStr): JsonResponse
    {
        if (empty($dateStr)) {
            $this->sendReply($phoneNumber,
                'Format: JADWALKAN '.$workOrder->no_work_order.' YYYY-MM-DD'.PHP_EOL.
                'Contoh: JADWALKAN '.$workOrder->no_work_order.' '.now()->addDay()->format('Y-m-d')
            );

            return response()->json(['status' => 'need_date']);
        }

        if ($workOrder->urgent_sub_type === 'by_accident') {
            $this->sendReply($phoneNumber,
                "Work Order {$workOrder->no_work_order} bersifat by-accident dan harus segera dikerjakan. Gunakan SETUJU untuk menyetujui."
            );

            return response()->json(['status' => 'must_execute_immediately']);
        }

        try {
            $scheduledDate = Carbon::parse($dateStr);
        } catch (\Throwable $e) {
            $this->sendReply($phoneNumber, 'Format tanggal tidak valid. Gunakan YYYY-MM-DD (contoh: '.now()->addDay()->format('Y-m-d').')');

            return response()->json(['status' => 'invalid_date']);
        }

        if ($scheduledDate->isBefore(now()->startOfDay())) {
            $this->sendReply($phoneNumber, 'Tanggal tidak boleh di masa lalu.');

            return response()->json(['status' => 'past_date']);
        }

        $previousStatus = $workOrder->status_pekerjaan;

        $workOrder->update([
            'hod_action' => 'schedule',
            'scheduled_date' => $scheduledDate,
            'status_pekerjaan' => 'scheduled',
            'status_tiket' => 'Pending HOD',
        ]);

        WorkOrderStatusChanged::dispatch($workOrder, $previousStatus);

        // Notify requester
        $requester = Employee::where('nama_employee', $workOrder->user_requester)->first();
        if ($requester) {
            AppNotificationService::workOrderStatusChanged($requester, $workOrder, $previousStatus);
        }

        $this->sendReply($phoneNumber,
            "📅 Work Order {$workOrder->no_work_order} DIJADWALKAN.".PHP_EOL.
            "Tanggal: {$scheduledDate->format('d M Y')}"
        );

        return response()->json(['status' => 'scheduled']);
    }

    private function sendReply(string $to, string $text): void
    {
        WahaHelper::sendMessage($to, $text);
    }
}
