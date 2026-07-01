<?php

namespace App\Channels;

use App\Services\EvolutionApiService;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class EvolutionWhatsAppChannel
{
    protected $service;

    public function __construct(EvolutionApiService $service)
    {
        $this->service = $service;
    }

    public function send($notifiable, Notification $notification)
    {
        if (! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);
        $phoneNumber = $notifiable->routeNotificationFor('EvolutionWhatsApp')
            ?? $notifiable->phone
            ?? $notifiable->number;

        if (! $phoneNumber) {
            Log::error('EvolutionWhatsAppChannel: No phone number found for '.get_class($notifiable));

            return;
        }

        // Gunakan Service yang sudah kita buat agar lebih bersih
        try {
            $response = $this->service->sendText($phoneNumber, $message['text']);

            if ($response->failed()) {
                Log::error('EvolutionWhatsAppChannel failed: '.$response->body());
            }
        } catch (\Exception $e) {
            Log::error('EvolutionWhatsAppChannel Exception: '.$e->getMessage());
        }
    }
}
