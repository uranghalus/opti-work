<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingsController extends Controller
{
    public function waGateway(): Response
    {
        return Inertia::render('settings/wa-gateway', [
            'settings' => Setting::getGroup('wa_gateway'),
        ]);
    }

    public function updateWaGateway(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'api_url' => 'nullable|url|max:255',
            'api_key' => 'nullable|string|max:255',
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

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Evolution API settings updated.')]);

        return to_route('settings.wa-gateway');
    }

    public function general(): Response
    {
        return Inertia::render('settings/general', [
            'settings' => Setting::getGroup('general'),
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => 'nullable|string|max:255',
            'app_description' => 'nullable|string|max:500',
            'language' => 'nullable|string|in:id,en|max:5',
            'timezone' => 'nullable|string|max:50',
            'date_format' => 'nullable|string|max:20',
            'items_per_page' => 'nullable|integer|min:10|max:100',
            'enable_notifications' => 'boolean',
            'maintenance_mode' => 'boolean',
        ]);

        Setting::setValue('app_name', $validated['app_name'] ?? config('app.name'), 'general');
        Setting::setValue('app_description', $validated['app_description'] ?? '', 'general');
        Setting::setValue('language', $validated['language'] ?? 'id', 'general');
        Setting::setValue('timezone', $validated['timezone'] ?? 'Asia/Jakarta', 'general');
        Setting::setValue('date_format', $validated['date_format'] ?? 'd/m/Y', 'general');
        Setting::setValue('items_per_page', $validated['items_per_page'] ?? 25, 'general');
        Setting::setValue('enable_notifications', $validated['enable_notifications'] ?? true, 'general');
        Setting::setValue('maintenance_mode', $validated['maintenance_mode'] ?? false, 'general');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('General settings updated.')]);

        return to_route('settings.general');
    }
}
