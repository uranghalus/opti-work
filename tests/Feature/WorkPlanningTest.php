<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkPlanning;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\TenantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WorkPlanningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
        $this->seed(TenantSeeder::class);
    }

    private function hodUser(): User
    {
        return User::factory()->create(['tenant_id' => 1])->assignRole('hod');
    }

    private function gmUser(): User
    {
        return User::factory()->create(['tenant_id' => 1])->assignRole('general_manager');
    }

    private function validPayload(WorkOrder $workOrder): array
    {
        return [
            'id_work_order' => $workOrder->id_work_order,
            'tgl_jadwal' => now()->addWeek()->toDateString(),
            'jam_mulai' => '08:00',
            'jam_selesai' => '12:00',
            'jenis_pekerjaan' => 'Preventive',
            'lama_pekerjaan_hari' => 2,
            'budget' => 1500000,
            'catatan' => 'Scheduled maintenance',
        ];
    }

    public function test_hod_can_create_work_planning_for_normal_work_order(): void
    {
        $user = $this->hodUser();
        $workOrder = WorkOrder::factory()->create([
            'priority_type' => 'normal',
            'status_pekerjaan' => 'hod_approved',
            'tenant_id' => 1,
        ]);

        $response = $this->actingAs($user)->post(route('work-planning.store'), $this->validPayload($workOrder));

        $response->assertRedirect();

        $this->assertDatabaseHas('tb_work_planning', [
            'id_work_order' => $workOrder->id_work_order,
            'status_jadwal' => 'planned',
            'budget' => 1500000,
            'tenant_id' => 1,
        ]);

        $workOrder->refresh();
        $this->assertSame(now()->addWeek()->toDateString(), $workOrder->scheduled_date->toDateString());
    }

    public function test_urgent_work_order_cannot_be_scheduled(): void
    {
        $user = $this->hodUser();
        $workOrder = WorkOrder::factory()->urgent()->create(['tenant_id' => 1]);

        $response = $this->actingAs($user)->post(route('work-planning.store'), $this->validPayload($workOrder));

        $response->assertSessionHasErrors('id_work_order');
        $this->assertDatabaseMissing('tb_work_planning', [
            'id_work_order' => $workOrder->id_work_order,
        ]);
    }

    public function test_user_without_work_planning_create_permission_is_forbidden(): void
    {
        $user = User::factory()->create(['tenant_id' => 1])->assignRole('viewer');
        $workOrder = WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1]);

        $response = $this->actingAs($user)->post(route('work-planning.store'), $this->validPayload($workOrder));

        $response->assertForbidden();
    }

    public function test_index_shows_plannings_for_same_tenant_only(): void
    {
        $user = $this->hodUser();
        $own = WorkPlanning::factory()->forWorkOrder()->create(['tenant_id' => 1]);
        WorkPlanning::factory()->forWorkOrder()->create(['tenant_id' => 2]);

        $response = $this->actingAs($user)->get(route('work-planning.index'));

        $response->assertOk();
        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('WorkPlanning/Index')
                ->has('plannings.data', 1)
                ->where('plannings.data.0.id', $own->getKey())
        );
    }

    public function test_hod_can_request_extend_and_gm_approval_reschedules(): void
    {
        $hod = $this->hodUser();
        $gm = $this->gmUser();
        $workOrder = WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1]);
        $planning = WorkPlanning::factory()->create([
            'id_work_order' => $workOrder->id_work_order,
            'tgl_jadwal' => now()->addDays(5)->toDateString(),
            'original_tgl_jadwal' => now()->addDays(5)->toDateString(),
            'status_jadwal' => 'planned',
            'tenant_id' => 1,
        ]);

        $newDate = now()->addDays(12)->toDateString();

        $this->actingAs($hod)->post(route('work-planning.extend', $planning), [
            'tgl_jadwal' => $newDate,
            'extend_reason' => 'Material pengadaan terlambat',
        ])->assertRedirect();

        $planning->refresh();
        $this->assertSame('pending_extend_approval', $planning->status_jadwal);
        $this->assertSame($hod->id, $planning->extend_requested_by);
        // Tanggal proposal tersimpan, jadwal awal tetap tercatat di original_tgl_jadwal
        $this->assertSame($newDate, $planning->tgl_jadwal->toDateString());
        $this->assertSame($planning->original_tgl_jadwal->toDateString(), now()->addDays(5)->toDateString());

        $this->actingAs($gm)->post(route('work-planning.extend.approve', $planning), [
            'notes' => 'Disetujui karena kendala material',
        ])->assertRedirect();

        $planning->refresh();
        $this->assertSame('rescheduled', $planning->status_jadwal);
        $this->assertSame($newDate, $planning->tgl_jadwal->toDateString());
        $this->assertSame(1, $planning->extend_count);
        $this->assertSame($gm->id, $planning->extend_approved_by);

        $workOrder->refresh();
        $this->assertSame($newDate, $workOrder->scheduled_date->toDateString());
    }

    public function test_gm_can_reject_extend_request(): void
    {
        $gm = $this->gmUser();
        $workOrder = WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1]);
        $planning = WorkPlanning::factory()->create([
            'id_work_order' => $workOrder->id_work_order,
            'tgl_jadwal' => now()->addDays(5)->toDateString(),
            'status_jadwal' => 'pending_extend_approval',
            'extend_reason' => 'Kendala material',
            'tenant_id' => 1,
        ]);

        $this->actingAs($gm)->post(route('work-planning.extend.reject', $planning), [
            'notes' => 'Tidak dapat diperpanjang',
        ])->assertRedirect();

        $planning->refresh();
        $this->assertSame('scheduled', $planning->status_jadwal);
        $this->assertSame(0, $planning->extend_count);
    }

    public function test_hod_cannot_approve_extend(): void
    {
        $hod = $this->hodUser();
        $workOrder = WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1]);
        $planning = WorkPlanning::factory()->create([
            'id_work_order' => $workOrder->id_work_order,
            'tgl_jadwal' => now()->addDays(5)->toDateString(),
            'status_jadwal' => 'pending_extend_approval',
            'tenant_id' => 1,
        ]);

        $this->actingAs($hod)->post(route('work-planning.extend.approve', $planning))
            ->assertForbidden();

        $this->assertDatabaseHas('tb_work_planning', [
            'id' => $planning->getKey(),
            'status_jadwal' => 'pending_extend_approval',
        ]);
    }

    public function test_extend_requires_reason(): void
    {
        $hod = $this->hodUser();
        $workOrder = WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1]);
        $planning = WorkPlanning::factory()->create([
            'id_work_order' => $workOrder->id_work_order,
            'tgl_jadwal' => now()->addDays(5)->toDateString(),
            'status_jadwal' => 'planned',
            'tenant_id' => 1,
        ]);

        $this->actingAs($hod)->post(route('work-planning.extend', $planning), [
            'tgl_jadwal' => now()->addDays(12)->toDateString(),
        ])->assertSessionHasErrors('extend_reason');
    }
}
