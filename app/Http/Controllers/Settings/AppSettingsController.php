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
