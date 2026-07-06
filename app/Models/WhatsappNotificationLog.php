<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappNotificationLog extends Model
{
    protected $fillable = [
        'worker_id',
        'hod_id',
        'phone_number',
        'message',
        'status',
        'response_payload',
        'retry_count',
    ];

    protected function casts(): array
    {
        return [
            'response_payload' => 'json',
            'retry_count' => 'integer',
        ];
    }
}
