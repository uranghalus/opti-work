<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaGatewayController extends Controller
{
    public function __construct(
        protected EvolutionApiService $evolutionApi
    ) {}

    public function index(): Response
    {
        $settings = Setting::getGroup('wa_gateway');

        return Inertia::render('settings/wa-gateway', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'api_url' => 'nullable|url|max:255',
            'api_key' => 'nullable|string|max:255',
            'global_api_key' => 'nullable|string|max:255',
            'instance_name' => 'nullable|string|max:100',
            'instance_token' => 'nullable|string|max:255',
            'sender_number' => 'nullable|string|max:20',
            'webhook_url' => 'nullable|url|max:255',
            'webhook_events' => 'nullable|array',
            'webhook_events.*' => 'string|max:50',
            'enabled' => 'boolean',
            'app_name' => 'nullable|string|max:100',
            'max_retries' => 'nullable|integer|min:0|max:10',
            'autostart_instance' => 'boolean',
            'mark_read' => 'boolean',
        ]);

        Setting::setValue('api_url', $validated['api_url'] ?? '', 'wa_gateway', true);
        Setting::setValue('api_key', $validated['api_key'] ?? '', 'wa_gateway', true);
        Setting::setValue('global_api_key', $validated['global_api_key'] ?? '', 'wa_gateway', true);
        Setting::setValue('instance_name', $validated['instance_name'] ?? 'optiwork-wa', 'wa_gateway');
        Setting::setValue('instance_token', $validated['instance_token'] ?? '', 'wa_gateway', true);
        Setting::setValue('sender_number', $validated['sender_number'] ?? '', 'wa_gateway');
        Setting::setValue('webhook_url', $validated['webhook_url'] ?? '', 'wa_gateway');
        Setting::setValue('webhook_events', $validated['webhook_events'] ?? [], 'wa_gateway');
        Setting::setValue('enabled', $validated['enabled'] ?? false, 'wa_gateway');
        Setting::setValue('app_name', $validated['app_name'] ?? 'Optiwork', 'wa_gateway');
        Setting::setValue('max_retries', $validated['max_retries'] ?? 3, 'wa_gateway');
        Setting::setValue('autostart_instance', $validated['autostart_instance'] ?? false, 'wa_gateway');
        Setting::setValue('mark_read', $validated['mark_read'] ?? true, 'wa_gateway');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('WhatsApp Gateway settings updated.')]);

        return to_route('settings.wa-gateway');
    }

    public function connectionState(): JsonResponse
    {
        try {
            $state = $this->evolutionApi->getConnectionState();

            return response()->json([
                'success' => true,
                'data' => $state,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function getQrCode(): JsonResponse
    {
        try {
            $qrData = $this->evolutionApi->getQrCode();

            return response()->json([
                'success' => true,
                'data' => $qrData,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function testConnection(): JsonResponse
    {
        try {
            $state = $this->evolutionApi->getConnectionState();

            return response()->json([
                'success' => true,
                'message' => 'Connection successful',
                'data' => $state,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: '.$th->getMessage(),
            ], 500);
        }
    }

    public function restartInstance(): JsonResponse
    {
        try {
            $result = $this->evolutionApi->restartInstance();

            return response()->json([
                'success' => true,
                'message' => 'Instance restarted successfully',
                'data' => $result,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function logoutInstance(): JsonResponse
    {
        try {
            $result = $this->evolutionApi->logoutInstance();

            return response()->json([
                'success' => true,
                'message' => 'Instance logged out successfully',
                'data' => $result,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
}
