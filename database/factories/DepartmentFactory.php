<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_department' => 'DEPT-'.fake()->unique()->numerify('###'),
            'nama_department' => fake()->company().' Department',
        ];
    }
}
