<?php

namespace Tests\Feature;

use App\Models\ExtendRequest;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtendRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_extend_request_rejects_more_than_three_days(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);
        $workOrder = WorkOrder::factory()->create();

        $response = $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 4,
            'extend_reason' => 'Valid extension reason',
        ]);

        $response->assertSessionHasErrors('extend_days');
    }

    public function test_hod_approval_recalculates_deadline(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);
        $workOrder = WorkOrder::factory()->create([
            'scheduled_date' => '2026-08-28',
            'deadline_date' => '2026-08-28',
            'extend_count' => 0,
        ]);

        $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 1,
            'extend_reason' => 'Additional time is needed',
        ])->assertRedirect();

        $extendRequest = ExtendRequest::firstOrFail();
        $this->actingAs($user)->post(route('extend-requests.approve-hod', $extendRequest))
            ->assertRedirect();

        $this->assertSame('approved', $extendRequest->refresh()->status->value);
        $this->assertSame('2026-08-31', $extendRequest->new_deadline_date->format('Y-m-d'));
        $this->assertSame('2026-08-31', $workOrder->refresh()->deadline_date->format('Y-m-d'));
        $this->assertSame(1, $workOrder->extend_count);
    }

    public function test_hod_can_reject_extend_request(): void
    {
        $user = User::factory()->create(['tenant_id' => 1]);
        $workOrder = WorkOrder::factory()->create();

        $this->actingAs($user)->post(route('work-orders.extend.store', $workOrder), [
            'extend_days' => 1,
            'extend_reason' => 'Additional time is needed',
        ]);
        $extendRequest = ExtendRequest::firstOrFail();

        $this->actingAs($user)->post(route('extend-requests.reject-hod', $extendRequest), [
            'notes' => 'Not approved',
        ])->assertRedirect();

        $this->assertDatabaseHas('tb_extend_requests', [
            'id_extend_request' => $extendRequest->id_extend_request,
            'status' => 'rejected',
            'hod_notes' => 'Not approved',
        ]);
    }
}
