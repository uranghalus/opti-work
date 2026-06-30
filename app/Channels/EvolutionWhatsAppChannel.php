<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class EvolutionWhatsAppChannel
{
    public function send($notifiable, Notification $notification)
    {
        if (! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        // 1. Ambil array-nya
        $messageArray = $notification->toWhatsApp($notifiable);

        // 2. Ambil nomor HP
        $phoneNumber = $notifiable->routeNotificationFor('EvolutionWhatsApp') ?? $notifiable->number;

        $apiUrl = config('services.evolution.api_url');
        $instance = config('services.evolution.instance_name');
        $apiKey = config('services.evolution.api_key');

        // 3. Kirim sebagai array, tambahkan 'number' ke dalam array tersebut
        Http::withHeaders([
            'apikey' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post("{$apiUrl}/message/sendText/{$instance}", [
            'number' => $phoneNumber,
            'text' => $messageArray['text'], // Mengirim string murni di dalam field 'text'
        ]);
    }
}
