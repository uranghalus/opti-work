<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWhatsappConfigRequest;
use App\Models\WhatsappConfig;
use App\Services\WahaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappConfigController extends Controller
{
    public function __construct(
        private readonly WahaService $wahaService
    ) {}

    public function index(): Response
    {
        $config = WhatsappConfig::where('is_active', true)->first();

        return Inertia::render('settings/whatsapp-config', [
            'config' => $config ? $config->makeHidden(['api_key', 'webhook_secret']) : null,
            'hasApiKey' => $config ? ! empty($config->api_key) : false,
            'hasWebhookSecret' => $config ? ! empty($config->webhook_secret) : false,
        ]);
    }

    public function store(StoreWhatsappConfigRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $config = WhatsappConfig::where('is_active', true)->first();

        if ($config) {
            unset($validated['api_key'], $validated['webhook_secret']);

            if ($request->filled('api_key')) {
                $config->api_key = $request->api_key;
            }
            if ($request->filled('webhook_secret')) {
                $config->webhook_secret = $request->webhook_secret;
            }

            $config->fill($validated);
            $config->save();
        } else {
            $config = WhatsappConfig::create($validated);
        }

        return Redirect::back()->with('success', 'WhatsApp configuration saved.');
    }

    public function testConnection(): JsonResponse
    {
        $result = $this->wahaService->testConnection();

        return response()->json($result);
    }
}
