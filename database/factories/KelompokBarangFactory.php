<?php

namespace Database\Factories;

use App\Models\KelompokBarang;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KelompokBarang>
 */
class KelompokBarangFactory extends Factory
{
    protected $model = KelompokBarang::class;

    public function definition(): array
    {
        $nama = $this->faker->unique()->randomElement(['Mekanikal', 'Elektrikal', 'Arsip', 'Keselamatan', 'IT', 'Furniture']);

        return [
            'kode_kelompok' => 'KB-'.strtoupper($this->faker->unique()->bothify('??##')),
            'nama_kelompok' => $nama,
            'deskripsi' => $this->faker->sentence(),
            'tenant_id' => 1,
        ];
    }
}
