<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\User;
use App\Models\WorkOrder;
use App\Services\BusinessDayCalculator;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeadlineEscalationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_business_day_calculator_skips_weekends(): void
    {
        // Friday 2026-01-02 + 1 business day = Monday 2026-01-05
        $result = BusinessDayCalculator::addBusinessDays(now()->create(2026, 1, 2), 1);
        $this->assertEquals('2026-01-05', $result->format('Y-m-d'));
    }

    public function test_business_day_calculator_skips_holiday(): void
    {
        // 2026-01-01 is New Year holiday. Friday 2026-01-02 + 1 = Monday 2026-01-05
        $result = BusinessDayCalculator::addBusinessDays(now()->create(2026, 1, 2), 1);
        $this->assertEquals('2026-01-05', $result->format('Y-m-d'));
    }

    public function test_work_order_calculate_deadline_normal(): void
    {
        $wo = WorkOrder::factory()->create([
            'priority_type' => 'normal',
            'created_at' => now()->create(2026, 1, 2),
        ]);

        $wo->calculateDeadline();
        $wo->refresh();

        // Normal = 6 business days from Friday 2026-01-02
        // Skip weekend, 6 business days = 2026-01-12
        $this->assertEquals('2026-01-12', $wo->deadline_date->format('Y-m-d'));
    }

    public function test_work_order_calculate_deadline_urgent(): void
    {
        $wo = WorkOrder::factory()->create([
            'priority_type' => 'urgent',
            'created_at' => now()->create(2026, 1, 2),
        ]);

        $wo->calculateDeadline();
        $wo->refresh();

        // Urgent = 3 business days from Friday 2026-01-02 = 2026-01-07
        $this->assertEquals('2026-01-07', $wo->deadline_date->format('Y-m-d'));
    }

    public function test_escalation_h3_notifies_team_leader(): void
    {
        $tl = User::factory()->superAdmin()->create();
        $tl->assignRole('team_leader');

        $wo = WorkOrder::factory()->create([
            'status_pekerjaan' => 'assigned',
            'scheduled_date' => now()->create(2026, 1, 2)->subDays(5), // 5+ business days ago
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $wo->refresh();
        $this->assertNotNull($wo->escalation_h3_sent_at);
        $this->assertNotNull($wo->escalation_h5_sent_at);
        $this->assertEquals('On Progress', $wo->status_pekerjaan);

        $this->assertDatabaseHas('app_notifications', [
            'type' => 'escalation_h3',
        ]);
    }

    public function test_escalation_idempotent(): void
    {
        $wo = WorkOrder::factory()->create([
            'status_pekerjaan' => 'assigned',
            'scheduled_date' => now()->create(2026, 1, 2)->subDays(10),
            'escalation_h3_sent_at' => now()->subDay(),
            'escalation_h5_sent_at' => now()->subDay(),
            'escalation_h6_sent_at' => now()->subDay(),
        ]);

        $countBefore = AppNotification::where('type', 'like', 'escalation_%')->count();

        $this->artisan('deadlines:check')->assertExitCode(0);

        $countAfter = AppNotification::where('type', 'like', 'escalation_%')->count();

        $this->assertEquals($countBefore, $countAfter);
    }
}
