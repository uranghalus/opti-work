<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\WorkDaily;
use App\Models\WorkData;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkDaily>
 */
class WorkDailyFactory extends Factory
{
    protected $model = WorkDaily::class;

    public function definition(): array
    {
        return [
            // WorkData belum punya factory — buat manual dengan no_kerja unik.
            'id_work_data' => fn () => WorkData::create([
                'no_kerja' => 'SPK-'.Str::upper(Str::random(10)),
                'tenant_id' => 1,
            ])->id_work_data,
            'id_employee' => Employee::factory(),
            'tanggal_kerja' => fake()->dateTimeBetween('-1 week', 'now'),
            'aktivitas_hari_ini' => fake()->sentence(10),
            'progres_persentase' => fake()->numberBetween(0, 100),
            'kendala_lapangan' => fake()->optional()->sentence(),
            'pelapor' => fake()->name(),
            'status_pekerjaan' => 'open',
            'prioritas' => fake()->randomElement(['low', 'medium', 'high']),
            'level' => 'normal',
            'tenant_id' => 1,
        ];
    }

    public function forEmployee(?Employee $employee = null): static
    {
        return $this->state(fn () => [
            'id_employee' => $employee?->id_employee ?? Employee::factory()->create(['tenant_id' => 1])->id_employee,
        ]);
    }

    public function forWorkData(?WorkData $workData = null): static
    {
        return $this->state(fn () => [
            'id_work_data' => $workData?->id_work_data ?? WorkData::create([
                'no_kerja' => 'SPK-'.Str::upper(Str::random(10)),
                'tenant_id' => 1,
            ])->id_work_data,
        ]);
    }
}
