<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $session,
        public string $status,
        public ?string $qrCode = null,
        public ?string $phoneNumber = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("whatsapp.session.{$this->session}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'session' => $this->session,
            'status' => $this->status,
            'qr_code' => $this->qrCode,
            'phone_number' => $this->phoneNumber,
        ];
    }
}
