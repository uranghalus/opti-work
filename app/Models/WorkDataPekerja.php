<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkDataPekerja extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_work_data_pekerja';

    protected $primaryKey = 'id_work_data_pekerja';

    protected $fillable = [
        'id_work_data',
        'id_employee',
        'id_user',
        'role_pekerja',
        'status_alokasi',
        'catatan',
        'accepted_at',
        'completed_at',
        'tenant_id',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function workData()
    {
        return $this->belongsTo(WorkData::class, 'id_work_data', 'id_work_data');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'id_employee', 'id_employee');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
