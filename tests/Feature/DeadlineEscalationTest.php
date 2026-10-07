<?php

namespace Tests\Feature;

use App\Events\NotificationCreated;
use App\Models\AppNotification;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkOrder;
use App\Services\BusinessDayCalculator;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeadlineEscalationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function department(array $attributes = []): Department
    {
        return Department::factory()->create(['tenant_id' => 1] + $attributes);
    }

    private function roleUser(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
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

        // Normal = 6 business days from Friday 2026-01-02 = 2026-01-12
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

    public function test_deadline_is_calculated_from_assignment_date_not_scheduled_date(): void
    {
        $wo = WorkOrder::factory()->create([
            'priority_type' => 'normal',
            'scheduled_date' => now()->create(2026, 1, 1),
            'assigned_at' => now()->create(2026, 1, 2),
        ]);

        $wo->calculateDeadline();
        $wo->refresh();

        // Deadline dihitung dari tanggal assign (Fri 2026-01-02), bukan scheduled_date.
        $this->assertEquals('2026-01-12', $wo->deadline_date->format('Y-m-d'));
    }

    public function test_escalation_h3_notifies_department_team_leader(): void
    {
        $department = $this->department();
        $teamLeader = $this->roleUser('team_leader', [
            'department' => $department->id_department,
            'tenant_id' => 1,
        ]);

        $workOrder = WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $workOrder->refresh();
        $this->assertNotNull($workOrder->escalation_h3_sent_at);
        $this->assertEquals('On Progress', $workOrder->status_pekerjaan);

        $this->assertDatabaseHas('app_notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $teamLeader->id,
            'type' => 'escalation_h3',
        ]);
    }

    public function test_escalation_h3_does_not_notify_team_leader_from_other_department(): void
    {
        $department = $this->department();
        $otherDepartment = $this->department();
        $otherTeamLeader = $this->roleUser('team_leader', [
            'department' => $otherDepartment->id_department,
            'tenant_id' => 1,
        ]);

        WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $this->assertDatabaseMissing('app_notifications', [
            'notifiable_id' => $otherTeamLeader->id,
            'type' => 'escalation_h3',
        ]);
    }

    public function test_escalation_h5_falls_back_to_hod_department(): void
    {
        $department = $this->department();
        $hodUser = $this->roleUser('hod', [
            'department' => $department->id_department,
            'tenant_id' => 1,
        ]);

        WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
            'escalation_h3_sent_at' => now(),
            'escalation_h6_sent_at' => now(),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $this->assertDatabaseHas('app_notifications', [
            'notifiable_id' => $hodUser->id,
            'type' => 'escalation_h5',
        ]);
    }

    public function test_escalation_h5_prefers_hod_user_id_over_department_hods(): void
    {
        $hodUser = $this->roleUser('hod', ['tenant_id' => 1]);
        $employee = Employee::create([
            'id_employee' => (string) Str::uuid(),
            'nik_employee' => 'NIK-HOD-1',
            'nama_employee' => 'HOD Terkait',
            'email' => $hodUser->email,
            'number' => '628111111111',
        ]);
        $department = $this->department(['hod_user_id' => $employee->id_employee]);

        $otherHod = $this->roleUser('hod', [
            'department' => $department->id_department,
            'tenant_id' => 1,
        ]);

        WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
            'escalation_h3_sent_at' => now(),
            'escalation_h6_sent_at' => now(),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $this->assertDatabaseHas('app_notifications', [
            'notifiable_id' => $hodUser->id,
            'type' => 'escalation_h5',
        ]);
        $this->assertDatabaseMissing('app_notifications', [
            'notifiable_id' => $otherHod->id,
            'type' => 'escalation_h5',
        ]);
    }

    public function test_escalation_h5_falls_back_to_admin_tenant_with_critical_log(): void
    {
        Log::spy();

        $department = $this->department();
        $admin = $this->roleUser('admin_tenant', ['tenant_id' => 1]);

        WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'tenant_id' => null,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
            'escalation_h3_sent_at' => now(),
            'escalation_h6_sent_at' => now(),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        $this->assertDatabaseHas('app_notifications', [
            'notifiable_id' => $admin->id,
            'type' => 'escalation_h5',
        ]);

        Log::shouldHaveReceived('critical');
    }

    public function test_escalation_broadcasts_realtime_event(): void
    {
        Event::fake([NotificationCreated::class]);

        $department = $this->department();
        $this->roleUser('team_leader', [
            'department' => $department->id_department,
            'tenant_id' => 1,
        ]);

        WorkOrder::factory()->create([
            'id_department' => $department->id_department,
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
        ]);

        $this->artisan('deadlines:check')->assertExitCode(0);

        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_escalation_idempotent(): void
    {
        $wo = WorkOrder::factory()->create([
            'status_pekerjaan' => 'assigned',
            'assigned_at' => now()->subDays(10),
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
