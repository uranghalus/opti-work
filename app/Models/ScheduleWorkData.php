<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleWorkData extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_schedule_wd';

    protected $primaryKey = 'id_schedule_wd';

    protected $fillable = [
        'id_work_data',
        'tgl_jadwal',
        'jam_mulai',
        'jam_selesai',
        'jenis_pekerjaan',
        'deskripsi_pekerjaan',
        'lokasi',
        'status_jadwal',
        'catatan',
        'rescheduled_from',
        'tenant_id',
    ];

    protected $casts = [
        'tgl_jadwal' => 'date',
    ];

    public function workData()
    {
        return $this->belongsTo(WorkData::class, 'id_work_data', 'id_work_data');
    }

    public function rescheduledFrom()
    {
        return $this->belongsTo(ScheduleWorkData::class, 'rescheduled_from', 'id_schedule_wd');
    }

    public function rescheduledTo()
    {
        return $this->hasOne(ScheduleWorkData::class, 'rescheduled_from');
    }
}
