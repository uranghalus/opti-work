<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\KelompokBarang;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    public function definition(): array
    {
        return [
            'kode_barang' => 'BRG-'.strtoupper($this->faker->unique()->bothify('??####')),
            'kode_inventory' => 'INV-'.$this->faker->unique()->numerify('####'),
            'nama_barang' => $this->faker->randomElement(['Pompa Air', 'Panel Listrik', 'AC Split', 'Genset', 'Lift', 'Extinguisher']).' '.$this->faker->numerify('#'),
            'spesifikasi' => $this->faker->sentence(),
            'penanggung_jawab' => $this->faker->name(),
            'kondisi' => $this->faker->randomElement(['baik', 'rusak_ringan', 'rusak_berat', 'perbaikan']),
            'lokasi_barang' => 'Gedung '.$this->faker->randomElement(['A', 'B', 'C']).' Lt '.$this->faker->numberBetween(1, 5),
            'jenis_barang' => $this->faker->randomElement(['mekanikal', 'elektrikal', 'ARSIP', 'keselamatan']),
            'tenant_id' => 1,
        ];
    }

    public function denganKelompok(): static
    {
        return $this->for(KelompokBarang::factory()->create(), 'kelompokBarang');
    }
}
