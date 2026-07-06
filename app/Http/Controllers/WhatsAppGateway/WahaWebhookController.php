<?php

namespace App\Http\Controllers\WhatsAppGateway;

use App\Events\SessionStatusUpdated;
use App\Models\WhatsappConfig;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WahaWebhookController
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        $event = $payload['event'] ?? null;

        Log::channel('whatsapp')->info('WAHA webhook received', ['payload' => $payload]);

        if (! $this->validateHmac($request)) {
            Log::channel('whatsapp')->warning('WAHA webhook HMAC validation failed');

            return response()->json(['status' => 'invalid_signature'], 401);
        }

        if ($event === 'session.status') {
            $this->handleSessionStatus($payload);
        }

        return response()->json(['status' => 'ok']);
    }

    private function handleSessionStatus(array $payload): void
    {
        $sessionName = $payload['session'] ?? $payload['payload']['name'] ?? null;
        $status = $payload['payload']['status'] ?? null;

        if (! $sessionName || ! $status) {
            Log::channel('whatsapp')->warning('WAHA webhook: missing session/status', ['payload' => $payload]);

            return;
        }

        $me = $payload['payload']['me'] ?? [];
        $phone = $me['name'] ?? null;

        WhatsappSession::updateOrCreate(
            ['session_name' => $sessionName],
            [
                'status' => $status,
                'phone_number' => $phone,
                'last_connected_at' => $status === 'WORKING' ? now() : null,
            ]
        );

        $qrCode = null;
        if ($status === 'SCAN_QR_CODE') {
            $session = WhatsappSession::where('session_name', $sessionName)->first();
            $qrCode = $session?->qr_code;
        }

        broadcast(new SessionStatusUpdated(
            session: $sessionName,
            status: $status,
            qrCode: $qrCode,
            phoneNumber: $phone,
        ));
    }

    private function validateHmac(Request $request): bool
    {
        $config = WhatsappConfig::where('is_active', true)->first();

        if (! $config || ! $config->webhook_secret) {
            return true;
        }

        $hmac = $request->header('X-Webhook-Hmac');
        $algorithm = $request->header('X-Webhook-Hmac-Algorithm', 'sha512');

        if (! $hmac) {
            return false;
        }

        $rawBody = $request->getContent();
        $expectedHash = hash_hmac($algorithm, $rawBody, $config->webhook_secret);

        return hash_equals($expectedHash, $hmac);
    }
}
