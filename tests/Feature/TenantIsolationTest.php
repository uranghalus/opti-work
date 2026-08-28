<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_only_see_work_orders_for_their_tenant(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);
        WorkOrder::factory()->create(['tenant_id' => 1]);
        WorkOrder::factory()->create(['tenant_id' => 2]);

        $this->actingAs($user);

        $this->assertCount(1, WorkOrder::all());
    }

    public function test_super_admin_can_see_all_work_orders(): void
    {
        $user = User::factory()->superAdmin()->create(['tenant_id' => null]);
        WorkOrder::factory()->create(['tenant_id' => 1]);
        WorkOrder::factory()->create(['tenant_id' => 2]);

        $this->actingAs($user);

        $this->assertCount(2, WorkOrder::all());
    }

    public function test_new_work_order_uses_current_tenant(): void
    {
        $user = User::factory()->create(['tenant_id' => 2]);

        $this->actingAs($user);
        $workOrder = WorkOrder::factory()->create(['tenant_id' => null]);

        $this->assertSame(2, (int) $workOrder->tenant_id);
    }

    public function test_users_without_tenant_are_blocked(): void
    {
        $user = User::factory()->create(['tenant_id' => null]);

        $this->actingAs($user)->get(route('dashboard'))->assertForbidden();
    }
}
