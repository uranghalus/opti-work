<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkData extends Model
{
    use HasFactory, TenantAware;

    protected $table = 'tb_work_data';

    protected $primaryKey = 'id_work_data';

    protected $fillable = [
        'no_kerja',
        'id_work_order',
        'nama_tenant',
        'tgl_rencana_mulai',
        'tgl_rencana_selesai',
        'jumlah_personel',
        'status_pekerjaan',
        'tgl_mulai_aktual',
        'tgl_selesai_aktual',
        'gambar_sebelum',
        'gambar_sesudah',
        'prediksi_penyebab',
        'tindakan',
        'hasil_kesimpulan',
        'saran_solusi',
        'pic_lead',
        'deskripsi',
        'create_id_user',
        'modified_user',
        'modified_id_user',
        'status_hapus',
        'tenant_id',
        'id_department',
        'work_department',
    ];

    protected $casts = [
        'tgl_rencana_mulai' => 'date',
        'tgl_rencana_selesai' => 'date',
        'tgl_mulai_aktual' => 'date',
        'tgl_selesai_aktual' => 'date',
        'create_date' => 'datetime',
        'modified_date' => 'datetime',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'id_department', 'id_department');
    }

    public function pekerja()
    {
        return $this->hasMany(WorkDataPekerja::class, 'id_work_data', 'id_work_data');
    }

    public function schedules()
    {
        return $this->hasMany(ScheduleWorkData::class, 'id_work_data', 'id_work_data');
    }
}
