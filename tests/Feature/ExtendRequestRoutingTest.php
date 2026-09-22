<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\ExtendRequest;
use App\Models\User;
use App\Models\WorkOrder;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\TenantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtendRequestRoutingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(TenantSeeder::class);
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createWorkOrderWithDepartment(string $departmentId): WorkOrder
    {
        $department = Department::factory()->create([
            'id_department' => $departmentId,
            'hod_user_id' => null,
        ]);

        return WorkOrder::factory()->create([
            'id_department' => $department->id_department,
        ]);
    }

    public function test_department_with_team_leader_routes_extend_to_tl_approval(): void
    {
        $department = Department::factory()->create(['hod_user_id' => null, 'tenant_id' => 1]);
        $tl = User::factory()->create(['department' => $department->id_department, 'tenant_id' => 1]);
        $tl->assignRole('team_leader');
        $workOrder = WorkOrder::factory()->create(['id_department' => $department->id_department]);
        $user = User::factory()->create(['tenant_id' => 1])->assignRole('karyawan');

        $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 2,
            'extend_reason' => 'Additional time needed for materials',
        ])->assertRedirect();

        $this->assertDatabaseHas('tb_extend_requests', [
            'id_work_order' => $workOrder->id_work_order,
            'status' => 'pending_tl_approval',
        ]);
    }

    public function test_department_without_team_leader_routes_extend_directly_to_hod(): void
    {
        $workOrder = $this->createWorkOrderWithDepartment('DEPT-NO-TL');
        $user = User::factory()->create(['tenant_id' => 1])->assignRole('karyawan');

        $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 1,
            'extend_reason' => 'Additional time needed',
        ])->assertRedirect();

        $this->assertDatabaseHas('tb_extend_requests', [
            'id_work_order' => $workOrder->id_work_order,
            'status' => 'pending_hod_approval',
        ]);
    }

    public function test_department_with_hod_but_no_team_leader_skips_tl_stage(): void
    {
        // Regression: hod_user_id terisi BUKAN tanda ada Team Leader.
        $workOrder = $this->createWorkOrderWithDepartment('DEPT-HOD-ONLY');
        $workOrder->departmentData->update(['hod_user_id' => 999]);
        $user = User::factory()->create(['tenant_id' => 1])->assignRole('karyawan');

        $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 1,
            'extend_reason' => 'Additional time needed',
        ])->assertRedirect();

        $extendRequest = ExtendRequest::where('id_work_order', $workOrder->id_work_order)->firstOrFail();

        $this->assertSame(
            'pending_hod_approval',
            $extendRequest->status->value,
            'Department dengan HOD tapi tanpa Team Leader harus langsung ke approval HOD.'
        );
    }

    public function test_model_method_matches_controller_routing(): void
    {
        $department = Department::factory()->create(['hod_user_id' => 123]);
        $workOrder = WorkOrder::factory()->create(['id_department' => $department->id_department]);

        $requester = User::factory()->create(['tenant_id' => 1]);
        $extendRequest = ExtendRequest::create([
            'id_work_order' => $workOrder->id_work_order,
            'requested_by' => $requester->id,
            'extend_days' => 1,
            'extend_reason' => 'Test reason',
            'status' => 'pending_hod_approval',
        ]);

        $this->assertFalse($extendRequest->departmentHasTeamLeader());

        $tl = User::factory()->create(['department' => $department->id_department]);
        $tl->assignRole('team_leader');

        $this->assertTrue($extendRequest->departmentHasTeamLeader());
    }
}
