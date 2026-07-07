<?php

namespace App\Channels;

use App\Helpers\WahaHelper;
use Illuminate\Notifications\Notification;

class WahaWhatsAppChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $messageArray = $notification->toWhatsApp($notifiable);

        $phoneNumber = $notifiable->routeNotificationFor('WahaWhatsApp')
            ?? $notifiable->routeNotificationFor('WhatsApp')
            ?? $notifiable->routeNotificationFor('EvolutionWhatsApp')
            ?? $notifiable->number;

        if (empty($phoneNumber)) {
            return;
        }

        WahaHelper::sendMessage($phoneNumber, $messageArray['text']);
    }
}
