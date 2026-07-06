<?php

namespace App\Console\Commands;

use App\Events\SessionStatusUpdated;
use App\Models\WhatsappConfig;
use App\Models\WhatsappSession;
use App\Services\WahaService;
use Illuminate\Console\Command;

class PollWahaSessions extends Command
{
    protected $signature = 'whatsapp:poll-sessions';

    protected $description = 'Poll WAHA API sessions as fallback sync when webhook fails';

    public function handle(WahaService $wahaService): int
    {
        $config = WhatsappConfig::where('is_active', true)->first();

        if (! $config) {
            $this->warn('No active WAHA config found.');

            return self::SUCCESS;
        }

        try {
            $wahaSessions = $wahaService->getSessions();
        } catch (\Throwable $e) {
            $this->error("Failed to poll WAHA sessions: {$e->getMessage()}");

            return self::FAILURE;
        }

        foreach ($wahaSessions as $s) {
            $name = $s['name'] ?? null;
            $status = $s['status'] ?? null;

            if (! $name || ! $status) {
                continue;
            }

            $me = $s['me'] ?? [];
            $phone = $me['name'] ?? $me['me']['name'] ?? null;

            $local = WhatsappSession::where('session_name', $name)->first();

            if (! $local || $local->status !== $status) {
                WhatsappSession::updateOrCreate(
                    ['session_name' => $name],
                    [
                        'status' => $status,
                        'phone_number' => $phone,
                        'last_connected_at' => $status === 'WORKING' ? now() : null,
                    ]
                );

                broadcast(new SessionStatusUpdated(
                    session: $name,
                    status: $status,
                    phoneNumber: $phone,
                ));

                $this->info("Session {$name} updated to {$status}");

                if ($status === 'WORKING') {
                    WhatsappSession::where('session_name', $name)
                        ->whereNull('qr_code')
                        ->update(['qr_code' => null]);
                }
            }
        }

        $this->info('WAHA sessions polled successfully.');

        return self::SUCCESS;
    }
}
