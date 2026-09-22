<?php

namespace App\Models;

use App\Enums\WorkDailyStatus;
use App\Models\Traits\TenantAware;
use Database\Factories\WorkDailyFactory;
use Illuminate\Database\Eloquent\Attributes\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Factory(WorkDailyFactory::class)]
class WorkDaily extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_work_daily';

    protected $primaryKey = 'id_work_daily';

    protected $fillable = [
        'id_work_data',
        'id_employee',
        'tanggal_kerja',
        'aktivitas_hari_ini',
        'progres_persentase',
        'kendala_lapangan',
        'pelapor',
        'status_pekerjaan',
        'prioritas',
        'level',
        'assigned_by',
        'assigned_at',
        'tenant_id',
    ];

    protected $casts = [
        'tanggal_kerja' => 'date',
        'progres_persentase' => 'integer',
        'assigned_at' => 'datetime',
        'status_pekerjaan' => WorkDailyStatus::class,
    ];

    public function workData(): BelongsTo
    {
        return $this->belongsTo(WorkData::class, 'id_work_data', 'id_work_data');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'id_employee', 'id_employee');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
