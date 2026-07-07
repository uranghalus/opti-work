<?php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WahaHelper
{
    /**
     * Get a configured HTTP client for WAHA API.
     */
    public static function client(): ?PendingRequest
    {
        $url = Setting::get('waha_url');
        if (empty($url)) {
            return null;
        }

        $client = Http::timeout(3);

        $apiKey = Setting::get('waha_api_key');
        if (! empty($apiKey)) {
            $client = $client->withHeaders(['X-Api-Key' => $apiKey]);
        }

        return $client->baseUrl(rtrim($url, '/'));
    }

    /**
     * Get the status of the configured WAHA session.
     */
    public static function getSessionStatus(): string
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            return 'NOT_CONFIGURED';
        }

        try {
            // WAHA Endpoint: GET /api/sessions/{name}
            $response = $client->get('/api/sessions/'.$session);

            if ($response->status() === 404) {
                return 'STOPPED';
            }

            if ($response->successful()) {
                return $response->json('status', 'CONNECTED');
            }

            return 'ERROR';
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to get session status: '.$e->getMessage());

            return 'UNREACHABLE';
        }
    }

    /**
     * Start / Create a new WAHA session.
     */
    public static function startSession(string $name): bool
    {
        $client = self::client();

        if (! $client) {
            return false;
        }

        try {
            // Coba nyalakan sesi yang sudah ada terlebih dahulu: POST /api/sessions/{name}/start
            $response = $client->post('/api/sessions/'.$name.'/start');

            if ($response->successful()) {
                return true;
            }

            // Jika gagal (misal belum terbuat / 404), buat sesi baru: POST /api/sessions
            $response = $client->post('/api/sessions', [
                'name' => $name,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to start session: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Get the QR code for authentication if session status is SCAN_QR_CODE.
     */
    public static function getQrCode(): ?string
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            return null;
        }

        try {
            // WAHA Endpoint: GET /api/{session}/auth/qr?format=image
            $response = $client->get('/api/'.$session.'/auth/qr?format=image');

            if ($response->successful()) {
                return 'data:image/png;base64,'.base64_encode($response->body());
            }
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to get QR code: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Get own profile details (phone number, name, avatar) if session is WORKING.
     */
    public static function getMeProfile(): ?array
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            return null;
        }

        try {
            // WAHA Endpoint: GET /api/{session}/profile
            $response = $client->get('/api/'.$session.'/profile');

            if ($response->successful()) {
                $data = $response->json();
                $phoneId = $data['id'] ?? '';
                $phone = str_replace('@c.us', '', $phoneId);

                return [
                    'id' => $phoneId,
                    'phone' => $phone,
                    'name' => $data['name'] ?? null,
                    'avatar' => $data['picture'] ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to get me profile: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Request a pairing code for a phone number.
     */
    public static function requestPairingCode(string $phoneNumber): ?string
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            return null;
        }

        $cleanPhone = preg_replace('/\D/', '', $phoneNumber);

        try {
            // WAHA Endpoint: POST /api/{session}/auth/request-code
            $response = $client->post('/api/'.$session.'/auth/request-code', [
                'phoneNumber' => $cleanPhone,
            ]);

            if ($response->successful()) {
                return $response->json('code');
            }
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to request pairing code: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Log out of the configured WAHA session.
     */
    public static function logout(): bool
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            return false;
        }

        try {
            // WAHA Endpoint: POST /api/sessions/{session}/logout
            $response = $client->post('/api/sessions/'.$session.'/logout');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Failed to logout session: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Send a text message to a specific number.
     *
     * @param  string  $to  Sasarannya (e.g. 628123456789)
     * @param  string  $text  Isi pesan
     */
    public static function sendMessage(string $to, string $text): bool
    {
        $session = Setting::get('waha_session', 'default');
        $client = self::client();

        if (! $client) {
            Log::warning('WAHA Helper - Gagal mengirim pesan, WAHA belum dikonfigurasi.');

            return false;
        }

        $chatId = str_contains($to, '@') ? $to : $to.'@c.us';

        try {
            $response = $client->post('/api/sendText', [
                'session' => $session,
                'chatId' => $chatId,
                'text' => $text,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WAHA Helper - Gagal mengirim pesan: '.$e->getMessage());

            return false;
        }
    }
}
