<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Database\Factories\WorkPlanningFactory;
use Illuminate\Database\Eloquent\Attributes\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Factory(WorkPlanningFactory::class)]
class WorkPlanning extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_work_planning';

    protected $fillable = [
        'id_work_order',
        'tgl_jadwal',
        'jam_mulai',
        'jam_selesai',
        'jenis_pekerjaan',
        'lama_pekerjaan_hari',
        'budget',
        'status_jadwal',
        'catatan',
        'original_tgl_jadwal',
        'extend_count',
        'extend_reason',
        'extend_requested_by',
        'extend_approved_by',
        'extend_approved_at',
        'extend_approval_notes',
        'tenant_id',
        'create_id_user',
        'modified_id_user',
    ];

    protected $casts = [
        'tgl_jadwal' => 'date',
        'original_tgl_jadwal' => 'date',
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'lama_pekerjaan_hari' => 'integer',
        'budget' => 'decimal:2',
        'extend_count' => 'integer',
        'extend_approved_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'id_work_order', 'id_work_order');
    }

    public function extendRequester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'extend_requested_by');
    }

    public function extendApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'extend_approved_by');
    }

    /**
     * FR-13: Whether this planning still may be extended.
     */
    public function canBeExtended(): bool
    {
        return in_array($this->status_jadwal, ['planned', 'scheduled', 'rescheduled'], true);
    }
}
