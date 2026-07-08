<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\AppNotification;
use App\Models\Employee;

class AppNotificationService
{
    public static function create(
        Employee $employee,
        string $type,
        array $data
    ): AppNotification {
        $notification = AppNotification::create([
            'notifiable_type' => Employee::class,
            'notifiable_id' => $employee->id_employee,
            'type' => $type,
            'data' => $data,
        ]);

        broadcast(new NotificationCreated($notification));

        return $notification;
    }

    public static function workOrderCreated(Employee $employee, $workOrder): AppNotification
    {
        return self::create($employee, 'work_order.created', [
            'title' => 'Work Order Baru',
            'message' => "WO {$workOrder->no_work_order} dari {$workOrder->user_requester}",
            'work_order_id' => $workOrder->id_work_order,
            'no_work_order' => $workOrder->no_work_order,
            'department' => $workOrder->department_tujuan,
            'priority' => $workOrder->prioritas,
            'url' => "/work-orders/{$workOrder->id_work_order}",
        ]);
    }

    public static function workOrderStatusChanged(Employee $employee, $workOrder, string $oldStatus): AppNotification
    {
        $statusLabel = match ($workOrder->status_pekerjaan) {
            'hod_approved' => 'Disetujui HOD',
            'rejected' => 'Ditolak',
            'scheduled' => 'Dijadwalkan',
            'assigned' => 'Tim Ditugaskan',
            'in_progress' => 'Sedang Dikerjakan',
            'pending_verification' => 'Menunggu Verifikasi',
            'completed' => 'Selesai',
            default => $workOrder->status_pekerjaan,
        };

        return self::create($employee, 'work_order.status_changed', [
            'title' => 'Status Work Order Berubah',
            'message' => "WO {$workOrder->no_work_order} → {$statusLabel}",
            'work_order_id' => $workOrder->id_work_order,
            'no_work_order' => $workOrder->no_work_order,
            'old_status' => $oldStatus,
            'new_status' => $workOrder->status_pekerjaan,
            'url' => "/work-orders/{$workOrder->id_work_order}",
        ]);
    }
}
