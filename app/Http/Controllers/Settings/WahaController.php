<?php

namespace App\Http\Controllers\Settings;

use App\Helpers\WahaHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\WahaUpdateRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('settings/waha', [
            'waha_session' => Setting::get('waha_session', 'default'),
            'waha_url' => Setting::get('waha_url', ''),
            'waha_api_key' => Setting::get('waha_api_key', ''),
            'waha_status' => $status,
            'waha_qr_code' => $qrCode,
            'waha_profile' => $profile,
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
}
