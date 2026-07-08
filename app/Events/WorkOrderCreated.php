<?php

namespace App\Events;

use App\Models\WorkOrder;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkOrderCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WorkOrder $workOrder
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('work-orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'WorkOrderCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->workOrder->id_work_order,
            'no_work_order' => $this->workOrder->no_work_order,
            'department_tujuan' => $this->workOrder->department_tujuan,
            'lokasi' => $this->workOrder->lokasi,
            'prioritas' => $this->workOrder->prioritas,
            'priority_type' => $this->workOrder->priority_type,
            'rincian_pekerjaan' => $this->workOrder->rincian_pekerjaan,
            'user_requester' => $this->workOrder->user_requester,
            'status_tiket' => $this->workOrder->status_tiket,
            'status_pekerjaan' => $this->workOrder->status_pekerjaan,
            'created_at' => $this->workOrder->created_at,
        ];
    }
}
