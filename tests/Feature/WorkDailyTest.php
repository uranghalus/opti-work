<?php

namespace Tests\Feature;

use App\Enums\WorkDailyStatus;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkDaily;
use App\Models\WorkData;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\TenantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class WorkDailyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(TenantSeeder::class);
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createWorkData(int $tenantId = 1): WorkData
    {
        return WorkData::create([
            'no_kerja' => 'SPK-'.Str::upper(Str::random(10)),
            'tenant_id' => $tenantId,
        ]);
    }

    public function test_hod_can_assign_daily_work_to_employee(): void
    {
        $hod = User::factory()->create(['tenant_id' => 1])->assignRole('hod');
        $employee = Employee::factory()->create(['tenant_id' => 1]);
        $workData = $this->createWorkData();

        $response = $this->actingAs($hod)->post(route('work-daily.store'), [
            'id_work_data' => $workData->id_work_data,
            'id_employee' => $employee->id_employee,
            'tanggal_kerja' => now()->toDateString(),
            'aktivitas_hari_ini' => 'Pemeriksaan rutin panel listrik gedung A',
            'prioritas' => 'high',
            'level' => 'normal',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('tb_work_daily', [
            'id_work_data' => $workData->id_work_data,
            'id_employee' => $employee->id_employee,
            'status_pekerjaan' => 'open',
            'prioritas' => 'high',
            'assigned_by' => $hod->id,
            'pelapor' => $employee->nama_employee,
        ]);
    }

    public function test_store_requires_valid_employee_and_work_data(): void
    {
        $hod = User::factory()->create(['tenant_id' => 1])->assignRole('hod');

        $this->actingAs($hod)->post(route('work-daily.store'), [
            'id_work_data' => 999999,
            'id_employee' => 'invalid-uuid',
            'tanggal_kerja' => now()->toDateString(),
            'aktivitas_hari_ini' => 'Aktivitas',
            'prioritas' => 'medium',
        ])->assertSessionHasErrors(['id_work_data', 'id_employee']);
    }

    public function test_karyawan_can_update_own_daily_work_status(): void
    {
        $workDaily = WorkDaily::factory()->forEmployee()->create([
            'status_pekerjaan' => WorkDailyStatus::Open,
            'progres_persentase' => 0,
            'tenant_id' => 1,
        ]);

        $karyawan = User::factory()->create([
            'tenant_id' => 1,
            'email' => $workDaily->employee->email,
        ])->assignRole('karyawan');

        $response = $this->actingAs($karyawan)->patch(route('work-daily.update-status', $workDaily), [
            'status_pekerjaan' => 'on_progress',
            'aktivitas_hari_ini' => 'Sudah 50% panel diperiksa',
            'progres_persentase' => 50,
            'kendala_lapangan' => 'Menunggu sparepart',
        ]);

        $response->assertRedirect();

        $workDaily->refresh();
        $this->assertSame(WorkDailyStatus::OnProgress, $workDaily->status_pekerjaan);
        $this->assertSame(50, $workDaily->progres_persentase);
        $this->assertSame('Menunggu sparepart', $workDaily->kendala_lapangan);
    }

    public function test_progress_is_forced_to_100_when_selesai(): void
    {
        $workDaily = WorkDaily::factory()->forEmployee()->create([
            'status_pekerjaan' => WorkDailyStatus::OnProgress,
            'progres_persentase' => 40,
            'tenant_id' => 1,
        ]);

        $karyawan = User::factory()->create([
            'tenant_id' => 1,
            'email' => $workDaily->employee->email,
        ])->assignRole('karyawan');

        $this->actingAs($karyawan)->patch(route('work-daily.update-status', $workDaily), [
            'status_pekerjaan' => 'selesai',
            'aktivitas_hari_ini' => 'Semua panel diperiksa dan selesai',
            'progres_persentase' => 60,
        ])->assertRedirect();

        $this->assertSame(100, $workDaily->refresh()->progres_persentase);
    }

    public function test_other_karyawan_cannot_update_someone_elses_daily_work(): void
    {
        $workDaily = WorkDaily::factory()->forEmployee()->create(['tenant_id' => 1]);
        $other = User::factory()->create(['tenant_id' => 1])->assignRole('karyawan');

        $this->actingAs($other)->patch(route('work-daily.update-status', $workDaily), [
            'status_pekerjaan' => 'selesai',
            'aktivitas_hari_ini' => 'claimed by others',
            'progres_persentase' => 100,
        ]);

        $this->assertNotSame('selesai', $workDaily->refresh()->status_pekerjaan->value);
    }

    public function test_user_without_daily_work_read_permission_cannot_index(): void
    {
        // Role tanpa daily-work.read pada seeder: hanya melalui role kustom,
        // gunakan viewer? viewer punya read. Karyawan kini punya read juga.
        // Gunakan user tanpa role sama sekali.
        $user = User::factory()->create(['tenant_id' => 1]);

        $this->actingAs($user)->get(route('work-daily.index'))->assertForbidden();
    }

    public function test_index_scopes_to_same_tenant(): void
    {
        $hod = User::factory()->create(['tenant_id' => 1])->assignRole('hod');
        $own = WorkDaily::factory()->forEmployee()->forWorkData()->create(['tenant_id' => 1]);
        WorkDaily::factory()->forEmployee()->forWorkData()->create(['tenant_id' => 2]);

        $response = $this->actingAs($hod)->get(route('work-daily.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('WorkDaily/Index')
                ->has('workDailies.data', 1)
                ->where('workDailies.data.0.id_work_daily', $own->id_work_daily)
        );
    }

    public function test_karyawan_index_only_sees_own_daily_work(): void
    {
        $mine = WorkDaily::factory()->forEmployee()->create(['tenant_id' => 1]);
        WorkDaily::factory()->forEmployee()->create(['tenant_id' => 1]);

        $karyawan = User::factory()->create([
            'tenant_id' => 1,
            'email' => $mine->employee->email,
        ])->assignRole('karyawan');

        $response = $this->actingAs($karyawan)->get(route('work-daily.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->has('workDailies.data', 1)
                ->where('workDailies.data.0.id_work_daily', $mine->id_work_daily)
        );
    }

    public function test_hod_can_delete_daily_work(): void
    {
        $hod = User::factory()->create(['tenant_id' => 1])->assignRole('hod');
        $workDaily = WorkDaily::factory()->forEmployee()->forWorkData()->create(['tenant_id' => 1]);

        $this->actingAs($hod)->delete(route('work-daily.destroy', $workDaily))->assertRedirect();

        $this->assertSoftDeleted('tb_work_daily', [
            'id_work_daily' => $workDaily->id_work_daily,
        ]);
    }
}
