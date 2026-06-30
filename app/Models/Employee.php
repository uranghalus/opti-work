<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tb_employee';

    protected $primaryKey = 'id_employee';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id_employee',
        'nik_employee',
        'nama_employee',
        'email',
        'number',
        'photo_url',
        'id_department',
        'id_division',
        'id_position',
        'last_login_ip',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'id_department', 'id_department');
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'id_division', 'id_division');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'id_position', 'id_position');
    }
}
