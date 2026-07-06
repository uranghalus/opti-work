<?php

namespace App\Http\Controllers\WhatsAppGateway;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConfig;
use App\Models\WhatsappNotificationLog;
use App\Services\WahaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationLogController extends Controller
{
    public function __construct(
        private readonly WahaService $wahaService
    ) {}

    public function index(Request $request): Response
    {
        $query = WhatsappNotificationLog::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->latest()->paginate(20);

        return Inertia::render('WhatsappGateway/NotificationLogs', [
            'logs' => $logs,
            'filters' => $request->only(['status']),
        ]);
    }

    public function retry(int $id): RedirectResponse
    {
        $log = WhatsappNotificationLog::findOrFail($id);

        if ($log->status !== 'FAILED') {
            return back()->with('info', 'Only failed logs can be retried.');
        }

        $config = WhatsappConfig::where('is_active', true)->first();

        if (! $config) {
            return back()->with('error', 'No active WAHA configuration.');
        }

        try {
            $response = $this->wahaService->sendTextMessage(
                $config->default_session ?? 'default',
                $log->phone_number,
                $log->message,
            );

            $log->update([
                'status' => 'SENT',
                'response_payload' => $response,
                'retry_count' => $log->retry_count + 1,
            ]);

            return back()->with('success', 'Notification resent successfully.');
        } catch (\Throwable $e) {
            $log->update([
                'retry_count' => $log->retry_count + 1,
                'response_payload' => ['error' => $e->getMessage()],
            ]);

            return back()->with('error', "Retry failed: {$e->getMessage()}");
        }
    }
}
