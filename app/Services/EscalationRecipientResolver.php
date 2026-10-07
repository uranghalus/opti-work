<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Menentukan penerima notifikasi eskalasi keterlambatan WO (FR-2.2 & OQ 6).
 *
 * - H+3 : Team Leader pada department terkait (jika ada).
 * - H+5 : HOD dengan rantai fallback hod_user_id → manager_user_id → semua role hod
 *         di department → Admin Tenant cabang (+ log kritikal).
 * - H+6 : DGM/GM.
 */
class EscalationRecipientResolver
{
    /**
     * @return Collection<int, User>
     */
    public function forLevel(WorkOrder $workOrder, int $level): Collection
    {
        return match ($level) {
            3 => $this->teamLeaders($workOrder),
            5 => $this->hods($workOrder),
            6 => $this->dgmGm(),
            default => collect(),
        };
    }

    /**
     * @return Collection<int, User>
     */
    public function teamLeaders(WorkOrder $workOrder): Collection
    {
        $department = $workOrder->departmentData;

        if (! $department) {
            return collect();
        }

        return User::query()
            ->where('department', $department->id_department)
            ->whereHas('roles', fn ($query) => $query->where('name', 'team_leader'))
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    public function hods(WorkOrder $workOrder): Collection
    {
        $department = $workOrder->departmentData;

        if ($department) {
            foreach ([$department->hod_user_id, $department->manager_user_id] as $employeeId) {
                $user = $this->userForEmployeeId($employeeId);

                if ($user) {
                    return collect([$user]);
                }
            }

            $departmentHods = User::query()
                ->where('department', $department->id_department)
                ->whereHas('roles', fn ($query) => $query->where('name', 'hod'))
                ->get();

            if ($departmentHods->isNotEmpty()) {
                return $departmentHods;
            }
        }

        return $this->adminTenants($workOrder, $department);
    }

    /**
     * @return Collection<int, User>
     */
    public function dgmGm(): Collection
    {
        return User::query()
            ->whereHas('roles', fn ($query) => $query->whereIn('name', ['deputy_general_manager', 'general_manager']))
            ->get();
    }

    /**
     * Fallback terakhir: Admin Tenant cabang + catat log kritikal (OQ 6).
     *
     * @return Collection<int, User>
     */
    private function adminTenants(WorkOrder $workOrder, ?Department $department): Collection
    {
        $admins = User::query()
            ->when($workOrder->tenant_id, fn ($query) => $query->where('tenant_id', $workOrder->tenant_id))
            ->whereHas('roles', fn ($query) => $query->where('name', 'admin_tenant'))
            ->get();

        Log::critical('Eskalasi H+5: tidak ada HOD yang bisa dihubungi, notifikasi dialihkan ke Admin Tenant.', [
            'work_order_id' => $workOrder->id_work_order,
            'no_work_order' => $workOrder->no_work_order,
            'department_id' => $department?->id_department,
            'admin_tenant_count' => $admins->count(),
        ]);

        return $admins;
    }

    private function userForEmployeeId(?string $employeeId): ?User
    {
        if (empty($employeeId)) {
            return null;
        }

        $employee = Employee::find($employeeId);

        if (! $employee || empty($employee->email)) {
            return null;
        }

        return User::where('email', $employee->email)->first();
    }
}
