<?php

namespace App\Notifications;

use App\Channels\WahaWhatsAppChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WorkOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $wo;

    public function __construct($wo)
    {
        $this->wo = $wo;
    }

    public function via(object $notifiable): array
    {
        return [WahaWhatsAppChannel::class];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $baseUrl = rtrim(config('app.url'), '/');
        $detailUrl = "{$baseUrl}/work-orders/{$this->wo->id_work_order}";

        $emoji = match ($this->wo->prioritas) {
            'low' => "\xF0\x9F\x9F\xA2",
            'medium' => "\xF0\x9F\x9F\xA1",
            'high' => "\xF0\x9F\x94\xB4",
            default => "\xE2\x9A\xAA",
        };

        $priorityLabel = "{$emoji} ".strtoupper($this->wo->priority_type).' / '.ucfirst($this->wo->prioritas);

        $text = "\xF0\x9F\x8E\xAB *WORK ORDER BARU - BUTUH REVIEW*".PHP_EOL
            ."\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81".PHP_EOL.PHP_EOL
            ."*No:* {$this->wo->no_work_order}".PHP_EOL
            ."*Lokasi:* {$this->wo->lokasi}".PHP_EOL
            ."*Departemen:* {$this->wo->department_tujuan}".PHP_EOL
            ."*Prioritas:* {$priorityLabel}".PHP_EOL
            ."*Pemohon:* {$this->wo->user_requester}".PHP_EOL.PHP_EOL
            .'*Rincian Pekerjaan:*'.PHP_EOL
            ."_{$this->wo->rincian_pekerjaan}_".PHP_EOL;

        if ($this->wo->keterangan) {
            $text .= PHP_EOL.'*Catatan:*'.PHP_EOL."_{$this->wo->keterangan}_".PHP_EOL;
        }

        $text .= PHP_EOL
            ."\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81".PHP_EOL
            ."\xF0\x9F\x93\x8B *REVIEW VIA WHATSAPP*".PHP_EOL.PHP_EOL
            .'Balas pesan ini dengan salah satu perintah di bawah:'.PHP_EOL.PHP_EOL
            ."\xE2\x9C\x85 *SETUJU* {$this->wo->no_work_order}".PHP_EOL
            .'  Setujui dan eksekusi segera'.PHP_EOL.PHP_EOL
            ."\xF0\x9F\x93\x85 *JADWALKAN* {$this->wo->no_work_order} YYYY-MM-DD".PHP_EOL
            .'  Setujui & jadwalkan tanggal tertentu'.PHP_EOL.PHP_EOL
            ."\xE2\x9D\x8C *TOLAK* {$this->wo->no_work_order} alasan".PHP_EOL
            .'  Tolak pengajuan dengan alasan'.PHP_EOL.PHP_EOL
            ."\xF0\x9F\x91\x94 *Catatan:*".PHP_EOL
            .'Setelah SETUJU, Anda bisa langsung memilih tim karyawan via WA.'.PHP_EOL.PHP_EOL
            ."\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81\xE2\x94\x81".PHP_EOL
            ."\xF0\x9F\x94\x97 *Detail:* {$detailUrl}";

        return [
            'text' => $text,
        ];
    }
}
