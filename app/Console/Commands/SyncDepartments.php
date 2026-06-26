<?php

namespace App\Console\Commands;

use App\Models\Department;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

#[Signature('app:sync-departments')]
#[Description('Command description')]
class SyncDepartments extends Command
{
    /**
     * Execute the console command.
     */

    // Nama command yang akan dipanggil di terminal/scheduler
    protected $signature = 'sync:departments';

    // Deskripsi command
    protected $description = 'Auto-sync departments data from Optigate Portal API to local database';
    public function handle()
    {
        $url = config('services.optigate_portal.url') . '/api/departments';
        $token = config('services.optigate_portal.token');

        $this->info('Memulai sinkronisasi department...');

        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);

            if ($response->successful()) {
                $departments = $response->json('data') ?? $response->json();
                $count = 0;

                foreach ($departments as $dept) {
                    // Gunakan updateOrCreate untuk mencegah duplikasi data
                    Department::updateOrCreate(
                        // Parameter 1: Kondisi pencarian (biasanya ID unik dari API)
                        ['id_department' => $dept['id']],

                        // Parameter 2: Data yang akan di-update atau di-insert
                        [
                            'nama_department' => $dept['name'],
                            'kode_department' => $dept['code'] ?? null,
                            // Tambahkan mapping field lain sesuai struktur tabel Anda
                        ]
                    );
                    $count++;
                }

                $this->info("Sinkronisasi selesai! $count data berhasil diproses.");
                Log::info("Auto-sync Department berhasil: $count data.");
            } else {
                $errorMsg = 'Gagal mengambil data department dari API Portal: ' . $response->body();
                $this->error($errorMsg);
                Log::error($errorMsg);
            }
        } catch (\Throwable $th) {
            $errorMsg = 'Exception API Department: ' . $th->getMessage();
            $this->error($errorMsg);
            Log::error($errorMsg);
        }
    }
}
