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
        'tanggal_work_data',
        'id_department',
        'deskripsi',
        'gambar_sebelum',
        'gambar_sesudah',
        'status_pekerjaan',
        'prediksi_penyebab',
        'tindakan',
        'hasil_kesimpulan',
        'saran_solusi',
        'kode_inventory',
        'nama_tenant',
        'work_department',
        'create_id_user',
        'modified_id_user',
        'status_hapus',
        'tenant_id',
    ];

    protected $casts = [
        'tanggal_work_data' => 'date',
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
