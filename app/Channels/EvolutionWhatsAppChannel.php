<?php

namespace App\Channels;

use App\Notifications\WorkOrderNotification;
use Illuminate\Support\Facades\Http;

class EvolutionWhatsAppChannel
{
    public function send($notifiable, WorkOrderNotification $notification)
    {
        // Memanggil method toWhatsApp yang ada di dalam class Notification
        $messageData = $notification->toWhatsApp($notifiable);

        $apiUrl = env('EVOLUTION_API_URL');
        $instance = env('EVOLUTION_INSTANCE_NAME');
        $apiKey = env('EVOLUTION_API_KEY');

        // Pastikan model User memiliki kolom phone_number
        $phoneNumber = $notifiable->phone_number;

        if (! $phoneNumber) {
            return;
        }

        Http::withHeaders([
            'apikey' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post("{$apiUrl}/message/sendButtons/{$instance}", [
            'number' => $phoneNumber,
            'buttonMessage' => $messageData,
        ]);
    }
}
