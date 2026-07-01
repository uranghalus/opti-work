<?php

namespace App\Notifications;

use App\Channels\EvolutionWhatsAppChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

// Gunakan ShouldQueue agar pengiriman WA tidak membuat loading web menjadi lambat
class WorkOrderNotification extends Notification
{
    use Queueable;

    protected $wo;

    public function __construct($wo)
    {
        $this->wo = $wo;
    }

    public function via(object $notifiable): array
    {
        return [EvolutionWhatsAppChannel::class];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $baseUrl = config('services.evolution.base_url');
        $detailUrl = "{$baseUrl}/work-orders/{$this->wo->id_work_order}";

        $emoji = match ($this->wo->prioritas) {
            'low' => '🟢',
            'medium' => '🟡',
            'high' => '🔴',
            default => '⚪',
        };

        $priorityLabel = "{$emoji} ".strtoupper($this->wo->priority_type).' / '.ucfirst($this->wo->prioritas);

        $text = "🎫 *WORK ORDER BARU*\n"
            ."━━━━━━━━━━━━━━━━━━\n\n"
            ."*No:* {$this->wo->no_work_order}\n"
            ."*Lokasi:* {$this->wo->lokasi}\n"
            ."*Departemen:* {$this->wo->department_tujuan}\n"
            ."*Prioritas:* {$priorityLabel}\n"
            ."*Pemohon:* {$this->wo->user_requester}\n\n"
            ."*Rincian Pekerjaan:*\n_{$this->wo->rincian_pekerjaan}_\n";

        if ($this->wo->keterangan) {
            $text .= "\n*Keterangan:*\n_{$this->wo->keterangan}_\n";
        }

        // Pastikan URL dipisah dengan spasi atau baris baru yang jelas
        $text .= "\n━━━━━━━━━━━━━━━━━━\n"
            ."🔗 *Detail pekerjaan:* \n"
            .$detailUrl; //

        return [
            'text' => $text,
        ];
    }
}
