<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMessageTemplate extends Model
{
    protected $fillable = [
        'code',
        'template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
