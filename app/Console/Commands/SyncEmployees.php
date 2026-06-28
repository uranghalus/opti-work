<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\Position;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

#[Signature('app:sync-employees')]
#[Description('Command description')]
class SyncEmployees extends Command
{
    /**
     * Execute the console command.
     */

    // Nama command yang akan dipanggil di terminal/scheduler
    protected $signature = 'sync:employees';

    // Deskripsi command
    protected $description = 'Auto-sync employees data from Optigate Portal API to local database';

    public function handle()
    {
        $url = config('services.optigate_portal.url').'/api/users';
        $token = config('services.optigate_portal.token');

        // Sync positions first
        $positionsUrl = config('services.optigate_portal.url').'/api/positions';
        $this->info('Memulai sinkronisasi position...');
        try {
            $positionsResponse = Http::withToken($token)
                ->timeout(10)
                ->get($positionsUrl);

            if ($positionsResponse->successful()) {
                $positions = $positionsResponse->json('data') ?? $positionsResponse->json();
                foreach ($positions as $pos) {
                    Position::updateOrCreate(
                        ['id_position' => $pos['id']],
                        [
                            'nama_position' => $pos['name'],
                            'id_department' => $pos['department_id'] ?? null,
                        ]
                    );
                }
                $this->info('Sinkronisasi position selesai.');
            } else {
                Log::warning('Gagal sinkronisasi position dari API Portal: '.$positionsResponse->body());
            }
        } catch (\Throwable $th) {
            Log::error('Exception API Position: '.$th->getMessage());
        }

        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);

            if ($response->successful()) {
                $employees = $response->json('data') ?? $response->json();
                $count = 0;

                foreach ($employees as $dept) {
                    // Gunakan updateOrCreate untuk mencegah duplikasi data
                    Employee::updateOrCreate(
                        // Parameter 1: Kondisi pencarian (biasanya ID unik dari API)
                        ['id_employee' => $dept['id']],

                        // Parameter 2: Data yang akan di-update atau di-insert
                        [
                            'nama_employee' => $dept['name'] ?? null,
                            'nik_employee' => $dept['nik'] ?? null,
                            'email' => $dept['email'] ?? null,
                            'number' => $dept['whatsapp_number'] ?? null,
                            'photo_url' => $dept['photo_url'] ?? null,
                            'id_department' => $dept['department'] ?? null,
                            'id_position' => $dept['position'] ?? null,
                            'last_login_ip' => $dept['last_login_ip'] ?? null,
                        ]
                    );
                    $count++;
                }

                $this->info("Sinkronisasi selesai! $count data berhasil diproses.");
                Log::info("Auto-sync Employee berhasil: $count data.");
            } else {
                $errorMsg = 'Gagal mengambil data employee dari API Portal: '.$response->body();
                $this->error($errorMsg);
                Log::error($errorMsg);
            }
        } catch (\Throwable $th) {
            $errorMsg = 'Exception API Employee: '.$th->getMessage();
            $this->error($errorMsg);
            Log::error($errorMsg);
        }
    }
}
