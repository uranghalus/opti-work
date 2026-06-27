<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class WorkOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_work_order';

    protected $primaryKey = 'id_work_order';

    protected $fillable = [
        'no_work_order',
        'tgl_work_order',
        'rincian_pekerjaan',
        'department_tujuan',
        'lokasi',
        'tenant_id',
        'priority_type',
        'urgent_sub_type',
        'prioritas',
        'status_tiket',
        'status_pekerjaan',
        'hod_action',
        'scheduled_date',
        'assigned_employees',
        'personnel_count',
        'user_requester',
        'modified_user',
        'keterangan',
        'incident_photos',
        'completion_results',
        'verified_by',
        'verified_at',
        'verification_notes',
    ];

    protected $casts = [
        'tgl_work_order' => 'date',
        'scheduled_date' => 'date',
        'verified_at' => 'datetime',
        'incident_photos' => 'array',
        'assigned_employees' => 'array',
    ];

    /**
     * Menambahkan attribute secara otomatis ke hasil JSON (Inertia/API).
     * Dengan begini, saat Anda mengirim $workOrder ke frontend,
     * incident_photos_urls akan otomatis ada di dalamnya.
     */
    protected $appends = ['incident_photos_urls'];

    /**
     * Mendapatkan URL penuh foto dari S3
     */
    public function getIncidentPhotosUrlsAttribute(): array
    {
        if (empty($this->incident_photos)) {
            return [];
        }

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk('s3');

        return array_map(function ($photoPath) use ($storage) {
            return $storage->url($photoPath);
        }, $this->incident_photos);
    }

    // --- RELASI ---

    public function workData()
    {
        return $this->hasOne(WorkData::class, 'id_work_order', 'id_work_order');
    }

    public function departmentData()
    {
        return $this->belongsTo(Department::class, 'department_tujuan', 'nama_department');
    }

    public function modifier()
    {
        return $this->belongsTo(User::class, 'modified_user', 'id');
    }
}
