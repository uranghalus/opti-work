<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Position extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tb_position';

    protected $primaryKey = 'id_position';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id_position',
        'nama_position',
        'id_department',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'id_department', 'id_department');
    }
}
