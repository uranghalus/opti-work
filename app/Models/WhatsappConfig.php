<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappConfig extends Model
{
    protected $fillable = [
        'base_url',
        'api_key',
        'default_session',
        'webhook_url',
        'webhook_secret',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'webhook_secret' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }
}
