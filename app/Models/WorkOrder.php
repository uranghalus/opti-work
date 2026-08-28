<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use App\Services\BusinessDayCalculator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class WorkOrder extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_work_order';

    protected $primaryKey = 'id_work_order';

    protected $fillable = [
        'id_department',
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
        'deadline_date',
        'escalation_h3_sent_at',
        'escalation_h5_sent_at',
        'escalation_h6_sent_at',
        'is_escalated',
        'extend_count',
        'extend_reason',
        'extended_at',
    ];

    protected $casts = [
        'tgl_work_order' => 'date',
        'scheduled_date' => 'date',
        'verified_at' => 'datetime',
        'deadline_date' => 'date',
        'escalation_h3_sent_at' => 'datetime',
        'escalation_h5_sent_at' => 'datetime',
        'escalation_h6_sent_at' => 'datetime',
        'is_escalated' => 'boolean',
        'extend_count' => 'integer',
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

    public function workData(): HasOne
    {
        return $this->hasOne(WorkData::class, 'id_work_order', 'id_work_order');
    }

    public function departmentData(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'id_department', 'id_department');
    }

    public function modifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modified_user', 'id');
    }

    /**
     * Calculate and set deadline based on priority type.
     * Normal WO = 6 business days, Urgent WO = 3 business days.
     */
    public function calculateDeadline(): void
    {
        $businessDays = $this->priority_type === 'urgent' ? 3 : 6;
        $startDate = $this->scheduled_date ?? $this->created_at;

        $this->update([
            'deadline_date' => BusinessDayCalculator::addBusinessDays($startDate, $businessDays),
        ]);
    }

    /**
     * Check if this work order is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->deadline_date && $this->deadline_date->isPast() && ! in_array($this->status_pekerjaan, ['completed', 'rejected']);
    }
}
