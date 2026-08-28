<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'nik_employee' => fake()->unique()->numerify('##########'),
            'nama_employee' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'number' => fake()->numerify('+62##########'),
            'photo_url' => null,
            'id_department' => null,
            'id_division' => null,
            'id_position' => null,
        ];
    }
}
