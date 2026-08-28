<?php

namespace App\Models;

use App\Enums\ExtendRequestStatus;
use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExtendRequest extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_extend_requests';

    protected $primaryKey = 'id_extend_request';

    protected $fillable = [
        'id_work_order',
        'requested_by',
        'extend_days',
        'extend_reason',
        'status',
        'tl_approved_by',
        'tl_approved_at',
        'tl_notes',
        'hod_approved_by',
        'hod_approved_at',
        'hod_notes',
        'new_deadline_date',
        'tenant_id',
    ];

    protected $casts = [
        'status' => ExtendRequestStatus::class,
        'extend_days' => 'integer',
        'tl_approved_at' => 'datetime',
        'hod_approved_at' => 'datetime',
        'new_deadline_date' => 'date',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'id_work_order', 'id_work_order');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function tlApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tl_approved_by');
    }

    public function hodApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hod_approved_by');
    }

    /**
     * Check if department has a Team Leader.
     */
    public function departmentHasTeamLeader(): bool
    {
        $wo = $this->workOrder;
        $dept = $wo?->departmentData;

        return $dept && ! empty($dept->hod_user_id);
    }
}
