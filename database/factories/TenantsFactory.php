<?php

namespace Database\Factories;

use App\Models\Tenants;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenants>
 */
class TenantsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'company_name' => fake()->company(),
            'status' => fake()->randomElement(['active', 'inactive', 'suspended']),
            'type' => fake()->randomElement(['Internal', 'External', 'Vendor']),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'area' => fake()->city(),
            'location' => fake()->address(),
            'description' => fake()->paragraph(),
        ];
    }

    /**
     * Indicate that the tenant is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the tenant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
