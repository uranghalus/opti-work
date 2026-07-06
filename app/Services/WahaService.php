<?php

namespace App\Services;

use App\Exceptions\WahaConnectionException;
use App\Models\WhatsappConfig;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WahaService
{
    private ?WhatsappConfig $config;

    private function getConfig(): WhatsappConfig
    {
        if (! isset($this->config)) {
            $this->config = WhatsappConfig::where('is_active', true)->firstOrFail();
        }

        return $this->config;
    }

    private function client(): PendingRequest
    {
        $config = $this->getConfig();

        $client = Http::baseUrl(rtrim($config->base_url, '/'))
            ->timeout(30)
            ->acceptJson();

        if ($config->api_key) {
            $client->withToken($config->api_key);
        }

        return $client;
    }

    private function log(string $method, string $endpoint, array $payload = [], ?Response $response = null): void
    {
        Log::channel('whatsapp')->info("WAHA {$method} {$endpoint}", [
            'request' => $payload,
            'response_status' => $response?->status(),
            'response_body' => $response?->body(),
        ]);
    }

    private function handleError(string $method, string $endpoint, \Throwable $e): never
    {
        Log::channel('whatsapp')->error("WAHA {$method} {$endpoint} failed: {$e->getMessage()}", [
            'exception' => get_class($e),
        ]);

        throw new WahaConnectionException(
            "WAHA request failed: {$e->getMessage()}",
            $e->getCode(),
            $e
        );
    }

    public function getSessions(): array
    {
        $method = 'GET';
        $endpoint = '/api/sessions/';

        try {
            $response = $this->client()->get($endpoint);
            $this->log($method, $endpoint, [], $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function getSessionStatus(string $session): array
    {
        $method = 'GET';
        $endpoint = "/api/sessions/{$session}";

        try {
            $response = $this->client()->get($endpoint);
            $this->log($method, $endpoint, [], $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function startSession(string $session): array
    {
        $method = 'POST';
        $endpoint = "/api/sessions/{$session}/start";
        $payload = [];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function getQrCode(string $session): array
    {
        $method = 'POST';
        $endpoint = "/api/{$session}/auth/qr";
        $payload = [];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function logoutSession(string $session): array
    {
        $method = 'POST';
        $endpoint = '/api/sessions/logout';
        $payload = ['name' => $session];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function restartSession(string $session): array
    {
        $method = 'POST';
        $endpoint = "/api/sessions/{$session}/restart";
        $payload = [];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function stopSession(string $session): array
    {
        $method = 'POST';
        $endpoint = "/api/sessions/{$session}/stop";
        $payload = [];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function sendTextMessage(string $session, string $phone, string $message): array
    {
        $method = 'POST';
        $endpoint = '/api/sendText';
        $chatId = str_starts_with($phone, '+')
            ? substr($phone, 1).'@c.us'
            : $phone.'@c.us';

        $payload = [
            'session' => $session,
            'chatId' => $chatId,
            'text' => $message,
        ];

        try {
            $response = $this->client()->post($endpoint, $payload);
            $this->log($method, $endpoint, $payload, $response);

            return $response->throw()->json() ?? [];
        } catch (\Throwable $e) {
            $this->handleError($method, $endpoint, $e);
        }
    }

    public function testConnection(): array
    {
        $method = 'GET';
        $endpoint = '/api/sessions/';

        try {
            $response = $this->client()->timeout(10)->get($endpoint);
            $data = $response->throw()->json() ?? [];
            $this->log($method, $endpoint, [], $response);

            return ['success' => true, 'sessions_count' => count($data)];
        } catch (\Throwable $e) {
            $this->log($method, $endpoint, []);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
