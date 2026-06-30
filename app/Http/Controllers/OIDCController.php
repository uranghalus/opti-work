<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Socialite;
use SocialiteProviders\Manager\OAuth2\AbstractProvider as SocialiteOAuth2AbstractProvider;

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
            /** @var SocialiteOAuth2AbstractProvider $driver */
            $driver = Socialite::driver('oidc');
            $ssoUser = $driver->stateless()->user();
            // dd($ssoUser);

            // Data mentah (raw) dari SSO disimpan di $ssoUser->user (array)
            $rawData = $ssoUser->user ?? [];
            Log::info('OIDC Raw Data:', $rawData);

            // 2. Ekstrak HANYA String Nama Department dari SSO
            $ssoDepartmentName = is_array($rawData['department'] ?? null)
                ? ($rawData['department']['name'] ?? $rawData['department']['id'] ?? null)
                : ($rawData['department'] ?? null);

            // 3. Cari ID Department di database lokal berdasarkan nama
            $departmentId = null;
            if (! empty($ssoDepartmentName)) {
                // Asumsi nama kolom di tabel tb_department adalah 'nama_department'
                $localDepartment = Department::where('nama_department', $ssoDepartmentName)->first();

                if ($localDepartment) {
                    $departmentId = $localDepartment->id_department; // Ambil Primary Key-nya
                } else {
                    Log::warning("SSO Callback: Department '{$ssoDepartmentName}' tidak ditemukan di tabel lokal.");
                    // Opsi: Anda bisa melakukan Department::create(...) di sini jika ingin auto-insert
                }
            }

            // 4. Ekstrak Position
            $position = is_array($rawData['position'] ?? null)
                ? ($rawData['position']['name'] ?? $rawData['position']['id'] ?? json_encode($rawData['position']))
                : ($rawData['position'] ?? null);

            // 5. Cari user berdasarkan email, atau buat baru jika belum ada (Upsert)
            $user = User::updateOrCreate(
                ['email' => $ssoUser->getEmail()],
                [
                    'name' => $ssoUser->getName(),
                    'email' => $ssoUser->getEmail(),
                    'password' => null, // SSO user tidak memiliki password lokal
                    'phone' => $rawData['whatsapp_number'] ?? null,

                    // Masukkan ID hasil pencarian ke kolom department tabel user
                    'department' => $departmentId,

                    'position' => $position,
                    'last_login_at' => $rawData['last_login_at'] ?? now(),
                    'last_login_ip' => $rawData['last_login_ip'] ?? request()->ip(),
                ]
            );

            // 6. Login user ke dalam session Laravel
            Auth::login($user);

            // 7. Regenerasi session untuk keamanan (mencegah session fixation)
            $request->session()->regenerate();

            // 8. Redirect ke dashboard
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
