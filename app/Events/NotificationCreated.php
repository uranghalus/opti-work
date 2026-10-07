<?php

namespace App\Events;

use App\Models\AppNotification;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AppNotification $notification
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.'.$this->recipientUserId()),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NotificationCreated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
            'created_at' => $this->notification->created_at,
        ];
    }

    /**
     * Channel realtime selalu di-scope ke user id. Notifikasi bisa ditujukan ke
     * User (penerima berbasis role) atau Employee (field worker), dan Employee
     * dipetakan ke User lewat email.
     */
    private function recipientUserId(): int|string
    {
        $notifiable = $this->notification->notifiable;

        if ($notifiable instanceof User) {
            return $notifiable->id;
        }

        if ($notifiable instanceof Employee) {
            $userId = User::where('email', $notifiable->email)->value('id');

            if ($userId) {
                return $userId;
            }

            return $notifiable->id_employee;
        }

        return $this->notification->notifiable_id;
    }
}
