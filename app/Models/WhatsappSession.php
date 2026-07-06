<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappSession extends Model
{
    protected $fillable = [
        'session_name',
        'status',
        'phone_number',
        'qr_code',
        'last_connected_at',
    ];

    protected function casts(): array
    {
        return [
            'last_connected_at' => 'datetime',
            'qr_code' => 'encrypted',
        ];
    }
}
