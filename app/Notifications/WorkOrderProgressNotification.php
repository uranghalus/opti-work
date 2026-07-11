<?php

namespace App\Notifications;

use App\Channels\WahaWhatsAppChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WorkOrderProgressNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $wo;

    protected $status;

    protected $message;

    public function __construct($wo, string $status, string $message)
    {
        $this->wo = $wo;
        $this->status = $status;
        $this->message = $message;
    }

    public function via(object $notifiable): array
    {
        return [WahaWhatsAppChannel::class];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $baseUrl = rtrim(config('app.url'), '/');
        $detailUrl = "{$baseUrl}/work-orders/{$this->wo->id_work_order}";

        $emoji = match ($this->status) {
            'assigned' => '👥',
            'in_progress' => '🔧',
            'pending_verification' => '📋',
            'completed' => '✅',
            'rejected' => '❌',
            default => '🔄',
        };

        $statusLabel = match ($this->status) {
            'assigned' => 'Tim Ditugaskan',
            'in_progress' => 'Sedang Dikerjakan',
            'pending_verification' => 'Menunggu Verifikasi',
            'completed' => 'Selesai',
            'rejected' => 'Ditolak',
            default => 'Diproses',
        };

        $text = "{$emoji} *UPDATE WORK ORDER*".PHP_EOL
            .'━━━━━━━━━━━━━━━━━━'.PHP_EOL.PHP_EOL
            ."*No:* {$this->wo->no_work_order}".PHP_EOL
            ."*Status:* {$statusLabel}".PHP_EOL.PHP_EOL
            ."{$this->message}".PHP_EOL.PHP_EOL
            .'━━━━━━━━━━━━━━━━━━'.PHP_EOL
            ."🔗 *Detail:* {$detailUrl}";

        return [
            'text' => $text,
        ];
    }
}
