<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    protected $model = WorkOrder::class;

    public function definition(): array
    {
        $priority = fake()->randomElement(['low', 'medium', 'high']);
        $isUrgent = fake()->boolean(20);
        $prioritas = $isUrgent
            ? fake()->randomElement(['Urgent - Accident', 'Urgent - Owner'])
            : 'Normal';

        return [
            'no_work_order' => 'WO-'.now()->format('dmY').'-'.fake()->unique()->numerify('###'),
            'tgl_work_order' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'rincian_pekerjaan' => fake()->sentence(8),
            'department_tujuan' => fake()->randomElement(['Engineering', 'Facility', 'HSE', 'Security', 'Plumbing']),
            'lokasi' => 'Lokasi '.fake()->word(),
            'tenant_id' => '1',
            'priority_type' => $isUrgent ? 'urgent' : 'normal',
            'urgent_sub_type' => $isUrgent ? fake()->randomElement(['by_accident', 'by_owner']) : null,
            'prioritas' => $prioritas,
            'status_tiket' => 'Pending HOD',
            'status_pekerjaan' => 'pending_hod_review',
            'user_requester' => fake()->name(),
            'modified_user' => null,
            'keterangan' => null,
        ];
    }

    public function executed(): static
    {
        return $this->state(fn () => [
            'status_tiket' => 'Executed',
            'status_pekerjaan' => 'completed',
            'verified_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'verified_by' => 1,
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn () => [
            'priority_type' => 'urgent',
            'prioritas' => 'Urgent - Accident',
            'urgent_sub_type' => 'by_accident',
        ]);
    }
}
