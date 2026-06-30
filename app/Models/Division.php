<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Division extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tb_division';

    protected $primaryKey = 'id_division';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id_division',
        'kode_division',
        'nama_division',
        'id_department',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'id_department', 'id_department');
    }
}
