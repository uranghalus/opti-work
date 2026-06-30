<?php

namespace App\Console\Commands;

use App\Models\Division;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

#[Signature('app:sync-divisions')]
#[Description('Auto-sync divisions data from Optigate Portal API to local database')]
class SyncDivisions extends Command
{
    protected $signature = 'sync:divisions';

    protected $description = 'Auto-sync divisions data from Optigate Portal API to local database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $url = config('services.optigate_portal.url').'/api/divisions';
        $token = config('services.optigate_portal.token');

        $this->info('Memulai sinkronisasi division...');

        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);

            if ($response->successful()) {
                $divisions = $response->json('data') ?? $response->json();
                $count = 0;

                foreach ($divisions as $div) {
                    Division::updateOrCreate(
                        ['id_division' => $div['id']],
                        [
                            'nama_division' => $div['name'],
                            'kode_division' => $div['code'] ?? null,
                            'id_department' => $div['department_id'] ?? null,
                        ]
                    );
                    $count++;
                }

                $this->info("Sinkronisasi selesai! $count data berhasil diproses.");
                Log::info("Auto-sync Division berhasil: $count data.");
            } else {
                $errorMsg = 'Gagal mengambil data division dari API Portal: '.$response->body();
                $this->error($errorMsg);
                Log::error($errorMsg);
            }
        } catch (\Throwable $th) {
            $errorMsg = 'Exception API Division: '.$th->getMessage();
            $this->error($errorMsg);
            Log::error($errorMsg);
        }
    }
}
