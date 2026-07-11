<?php

namespace App\Http\Controllers\Settings;

use App\Helpers\WahaHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\WahaUpdateRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WahaController extends Controller
{
    /**
     * Show the WAHA connection settings page.
     */
    public function edit(Request $request): Response
    {
        $status = WahaHelper::getSessionStatus();
        $qrCode = null;
        $profile = null;

        if ($status === 'SCAN_QR_CODE') {
            $qrCode = WahaHelper::getQrCode();
        } elseif ($status === 'WORKING' || $status === 'CONNECTED') {
            $profile = WahaHelper::getMeProfile();
        }

        $customWebhookUrl = Setting::get('waha_webhook_url', '');
        $resolvedWebhookUrl = $customWebhookUrl ?: url('/api/whatsapp/webhook');

        return Inertia::render('settings/waha', [
            'waha_session' => Setting::get('waha_session', 'default'),
            'waha_url' => Setting::get('waha_url', ''),
            'waha_api_key' => Setting::get('waha_api_key', ''),
            'waha_status' => $status,
            'waha_qr_code' => $qrCode,
            'waha_profile' => $profile,
            'waha_webhook_url' => $customWebhookUrl,
            'webhook_url' => $resolvedWebhookUrl,
        ]);
    }

    /**
     * Update the WAHA connection settings.
     */
    public function update(WahaUpdateRequest $request): RedirectResponse
    {
        Setting::set('waha_session', $request->validated('waha_session'));
        Setting::set('waha_url', $request->validated('waha_url'));
        Setting::set('waha_api_key', $request->validated('waha_api_key'));
        Setting::set('waha_webhook_url', $request->validated('waha_webhook_url') ?? '');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('WAHA connection settings updated.')]);

        return to_route('waha.edit');
    }

    /**
     * Request a WAHA pairing code for the given phone number.
     */
    public function requestPairingCode(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'min:5', 'max:20'],
        ]);

        $code = WahaHelper::requestPairingCode($request->input('phone_number'));

        if ($code) {
            return response()->json([
                'success' => true,
                'code' => $code,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __('Gagal mendapatkan kode pairing dari server WAHA.'),
        ], 400);
    }

    /**
     * Log out of the WAHA session.
     */
    public function logout(Request $request): RedirectResponse
    {
        $success = WahaHelper::logout();

        if ($success) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Sesi WhatsApp berhasil dikeluarkan.')]);
        } else {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Gagal mengeluarkan sesi WhatsApp.')]);
        }

        return to_route('waha.edit');
    }

    /**
     * Restart/Start the WAHA session.
     */
    public function restartSession(Request $request): JsonResponse
    {
        $session = Setting::get('waha_session', 'default');
        $success = WahaHelper::startSession($session);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => __('Sesi WhatsApp berhasil dinyalakan kembali.'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __('Gagal menyalakan sesi WhatsApp.'),
        ], 400);
    }

    /**
     * Test webhook connectivity.
     * Checks URL format, APP_URL, and DNS resolution.
     */
    public function testWebhook(Request $request): JsonResponse
    {
        $appUrl = config('app.url');
        $customUrl = Setting::get('waha_webhook_url', '');
        $webhookUrl = $customUrl ?: url('/api/whatsapp/webhook');
        $session = Setting::get('waha_session', 'default');

        $checks = [];

        // Check 1: APP_URL is set
        $checks[] = [
            'name' => 'APP_URL config',
            'status' => ! empty($appUrl),
            'value' => $appUrl ?: 'KOSONG — set APP_URL di .env',
        ];

        // Check 2: Webhook URL is valid
        $parsedUrl = parse_url($webhookUrl);
        $checks[] = [
            'name' => 'Webhook URL format',
            'status' => $parsedUrl !== false && isset($parsedUrl['scheme'], $parsedUrl['host']),
            'value' => $webhookUrl,
        ];

        // Check 3: Resolve hostname (DNS)
        $host = $parsedUrl['host'] ?? '';
        $dns = gethostbynamel($host);
        $checks[] = [
            'name' => 'DNS resolution',
            'status' => ! empty($dns),
            'value' => $dns ? implode(', ', $dns) : "Host '{$host}' tidak terresolve — cek APP_URL",
        ];

        // Check 4: WAHA session status
        $wahaUrl = Setting::get('waha_url', '');
        $checks[] = [
            'name' => 'WAHA server URL',
            'status' => ! empty($wahaUrl),
            'value' => $wahaUrl ?: 'Belum dikonfigurasi',
        ];

        // Check 5: WAHA webhook config recommendation
        $checks[] = [
            'name' => 'Env yang harus ada di WAHA',
            'status' => true,
            'value' => "WAHA__WEBHOOK__URLS__0={$webhookUrl}\nWAHA__WEBHOOK__EVENTS__0=message\nWAHA__WEBHOOK__EVENTS__1=error",
        ];

        // Test: coba akses endpoint kita via HTTP (optional, mungkin gagal di dev)
        $httpStatus = null;
        $httpOk = false;

        try {
            $ping = Http::timeout(5)
                ->get($webhookUrl);

            $httpStatus = $ping->status();
            $httpOk = $ping->successful();
        } catch (\Throwable $e) {
            $httpStatus = 'Error: '.$e->getMessage();
        }

        $allPassed = collect($checks)->every(fn ($c) => $c['status']);

        return response()->json([
            'success' => $allPassed,
            'webhook_url' => $webhookUrl,
            'app_url' => $appUrl,
            'http_status' => $httpStatus,
            'http_reachable' => $httpOk,
            'session' => $session,
            'checks' => $checks,
            'message' => $allPassed
                ? '✅ Semua check OK. Copy webhook URL ke WAHA server.'
                : '❌ Ada check yang gagal (lihat daftar).',
        ]);
    }

    /**
     * Send a test WhatsApp message to verify connectivity.
     */
    public function sendTestMessage(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'max:20'],
        ]);

        $phone = $request->input('phone_number');
        $text = '🔧 *Test Pesan dari WAHA*'.PHP_EOL
            .'Jika Anda menerima pesan ini, koneksi WAHA berfungsi dengan baik.'.PHP_EOL.PHP_EOL
            .'Balas dengan perintah berikut untuk menguji webhook:'.PHP_EOL
            .'SETUJU WO.TEST.001';

        $success = WahaHelper::sendMessage($phone, $text);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => __('Pesan test berhasil dikirim ke :phone', ['phone' => $phone]),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __('Gagal mengirim pesan test. Periksa konfigurasi WAHA.'),
        ], 400);
    }
}
