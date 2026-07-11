<?php

namespace App\Events;

use App\Models\WorkOrder;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkOrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public WorkOrder $workOrder;

    public string $previousStatus;

    public function __construct(WorkOrder $workOrder, string $previousStatus = '')
    {
        $this->workOrder = $workOrder;
        $this->previousStatus = $previousStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('work-orders'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->workOrder->id_work_order,
            'no_work_order' => $this->workOrder->no_work_order,
            'status_tiket' => $this->workOrder->status_tiket,
            'status_pekerjaan' => $this->workOrder->status_pekerjaan,
            'assigned_employees' => $this->workOrder->assigned_employees,
            'personnel_count' => $this->workOrder->personnel_count,
            'completion_results' => $this->workOrder->completion_results,
            'updated_at' => $this->workOrder->updated_at,
            'previous_status' => $this->previousStatus,
        ];
    }
}
