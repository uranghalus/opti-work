<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use App\Models\WorkPlanning;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkPlanning>
 */
class WorkPlanningFactory extends Factory
{
    protected $model = WorkPlanning::class;

    public function definition(): array
    {
        $tglJadwal = fake()->dateTimeBetween('+1 week', '+1 month');

        return [
            'id_work_order' => WorkOrder::factory(),
            'tgl_jadwal' => $tglJadwal,
            'jam_mulai' => '08:00',
            'jam_selesai' => '12:00',
            'jenis_pekerjaan' => fake()->randomElement(['Preventive', 'Corrective', 'Renovasi']),
            'lama_pekerjaan_hari' => fake()->numberBetween(1, 5),
            'budget' => fake()->numberBetween(500000, 20000000),
            'status_jadwal' => 'planned',
            'catatan' => fake()->optional()->sentence(),
            'original_tgl_jadwal' => $tglJadwal,
            'extend_count' => 0,
            'tenant_id' => 1,
        ];
    }

    public function forWorkOrder(?WorkOrder $workOrder = null): static
    {
        return $this->state(fn () => [
            'id_work_order' => $workOrder?->id_work_order ?? WorkOrder::factory()->create(['priority_type' => 'normal', 'tenant_id' => 1])->id_work_order,
        ]);
    }
}
