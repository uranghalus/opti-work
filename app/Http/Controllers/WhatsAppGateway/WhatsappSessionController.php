<?php

namespace App\Http\Controllers\WhatsAppGateway;

use App\Exceptions\WahaConnectionException;
use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Services\WahaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappSessionController extends Controller
{
    public function __construct(
        private readonly WahaService $wahaService
    ) {}

    public function index(): Response
    {
        $sessions = collect();
        $localSessions = WhatsappSession::all()->keyBy('session_name');

        try {
            $wahaSessions = $this->wahaService->getSessions();

            foreach ($wahaSessions as $s) {
                $name = $s['name'] ?? 'unknown';
                $status = $s['status'] ?? 'UNKNOWN';
                $me = $s['me'] ?? [];
                $phone = $me['name'] ?? ($me['me']['name'] ?? null);

                WhatsappSession::updateOrCreate(
                    ['session_name' => $name],
                    [
                        'status' => $status,
                        'phone_number' => $phone,
                        'last_connected_at' => $status === 'WORKING' ? now() : ($localSessions->get($name)?->last_connected_at),
                    ]
                );

                $sessions->push([
                    'name' => $name,
                    'status' => $status,
                    'phone_number' => $phone,
                    'qr_code' => null,
                ]);
            }
        } catch (WahaConnectionException) {
            $sessions = $localSessions->map(fn (WhatsappSession $s) => [
                'name' => $s->session_name,
                'status' => $s->status,
                'phone_number' => $s->phone_number,
                'qr_code' => null,
            ]);
        }

        return Inertia::render('WhatsappGateway/Dashboard', [
            'sessions' => $sessions->values()->all(),
        ]);
    }

    public function connect(string $session): JsonResponse|RedirectResponse
    {
        try {
            $this->wahaService->startSession($session);

            $qrResponse = $this->wahaService->getQrCode($session);

            $qrBase64 = $qrResponse['qr'] ?? $qrResponse['data'] ?? null;

            WhatsappSession::updateOrCreate(
                ['session_name' => $session],
                ['status' => 'SCAN_QR_CODE', 'qr_code' => $qrBase64]
            );

            if (request()->wantsJson()) {
                return response()->json([
                    'qr' => $qrBase64,
                    'session' => $session,
                ]);
            }

            return Redirect::back();
        } catch (WahaConnectionException $e) {
            if (request()->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 500);
            }

            return Redirect::back()->with('error', $e->getMessage());
        }
    }

    public function qrCode(string $session): JsonResponse
    {
        try {
            $qrResponse = $this->wahaService->getQrCode($session);
            $qrBase64 = $qrResponse['qr'] ?? $qrResponse['data'] ?? null;

            if ($qrBase64) {
                WhatsappSession::where('session_name', $session)->update(['qr_code' => $qrBase64]);
            }

            return response()->json([
                'qr' => $qrBase64,
                'session' => $session,
            ]);
        } catch (WahaConnectionException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function logout(string $session): RedirectResponse
    {
        try {
            $this->wahaService->logoutSession($session);

            WhatsappSession::where('session_name', $session)->update([
                'status' => 'STOPPED',
                'phone_number' => null,
                'qr_code' => null,
                'last_connected_at' => null,
            ]);

            return Redirect::back()->with('success', "Session {$session} logged out.");
        } catch (WahaConnectionException $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }
    }

    public function restart(string $session): RedirectResponse
    {
        try {
            $this->wahaService->restartSession($session);

            WhatsappSession::where('session_name', $session)->update([
                'status' => 'STARTING',
            ]);

            return Redirect::back()->with('success', "Session {$session} restart initiated.");
        } catch (WahaConnectionException $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }
    }
}
