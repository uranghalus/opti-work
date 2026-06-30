<?php

namespace App\Notifications;

use App\Channels\EvolutionWhatsAppChannel;
use App\Models\WorkOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WorkOrderNotification extends Notification
{
    use Queueable;

    protected $wo;

    public function __construct(WorkOrder $wo)
    {
        $this->wo = $wo;
    }

    public function via(object $notifiable): array
    {
        // Pastikan channel ini diarahkan ke class yang benar
        return [EvolutionWhatsAppChannel::class];
    }

    // METHOD INI WAJIB ADA
    public function toWhatsApp($notifiable)
    {
        return [
            'text' => "🎫 *Work Order Baru: {$this->wo->no_work_order}*",
            'footerText' => 'OptiAssets System',
            'buttons' => [
                ['type' => 'reply', 'reply' => ['id' => "approve_wo_{$this->wo->id_work_order}", 'title' => '✅ Approve']],
                ['type' => 'reply', 'reply' => ['id' => "reject_wo_{$this->wo->id_work_order}", 'title' => '❌ Reject']],
            ],
        ];
    }
}
