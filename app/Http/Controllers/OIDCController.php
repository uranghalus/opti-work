<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class OIDCController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('oidc')->redirect();
    }

    public function callback(Request $request)
    {
        try {
            // 1. Ambil profil user dari OIDC Perusahaan
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver('oidc');
            $ssoUser = $driver->stateless()->user();
            // Data mentah (raw) dari SSO disimpan di $ssoUser->user (array)
            $rawData = $ssoUser->user ?? [];
            Log::info('OIDC Raw Data:', $rawData);

            $department = is_array($rawData['department'] ?? null)
                ? ($rawData['department']['name'] ?? $rawData['department']['id'] ?? json_encode($rawData['department']))
                : ($rawData['department'] ?? null);

            $position = is_array($rawData['position'] ?? null)
                ? ($rawData['position']['name'] ?? $rawData['position']['id'] ?? json_encode($rawData['position']))
                : ($rawData['position'] ?? null);

            // 2. Cari user berdasarkan email, atau buat baru jika belum ada (Upsert)
            $user = User::updateOrCreate(
                ['email' => $ssoUser->getEmail()],
                [
                    'name' => $ssoUser->getName(),
                    'email' => $ssoUser->getEmail(),
                    'password' => null, // SSO user tidak memiliki password lokal
                    'phone' => $rawData['whatsapp_number'] ?? null,
                    'department' => $department,
                    'position' => $position,
                    'last_login_at' => $rawData['last_login_at'] ?? now(),
                    'last_login_ip' => $rawData['last_login_ip'] ?? request()->ip(),
                ]
            );

            // 3. Login user ke dalam session Laravel
            Auth::login($user);

            // 4. Regenerasi session untuk keamanan (mencegah session fixation)
            $request->session()->regenerate();

            // 5. Redirect ke dashboard
            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            Log::error('OIDC SSO Callback Error: '.$e->getMessage());

            return redirect('/')->with('error', 'Terjadi kesalahan saat login SSO: '.$e->getMessage());
        }
    }

    /**
     * (Opsional) Fungsi untuk Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
