<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = [
            ['id' => 1, 'name' => 'PT Fikri Teknik', 'company_name' => 'PT Fikri Teknik Mandiri', 'status' => 'active', 'type' => 'general', 'area' => 'Jakarta'],
            ['id' => 2, 'name' => 'PT Fikri Jaya', 'company_name' => 'PT Fikri Jaya Abadi', 'status' => 'active', 'type' => 'general', 'area' => 'Bandung'],
            ['id' => 3, 'name' => 'PT Fikri Prima', 'company_name' => 'PT Fikri Prima Solusi', 'status' => 'active', 'type' => 'general', 'area' => 'Surabaya'],
            ['id' => 4, 'name' => 'PT Fikri Nusantara', 'company_name' => 'PT Fikri Nusantara Bersama', 'status' => 'active', 'type' => 'general', 'area' => 'Medan'],
            ['id' => 5, 'name' => 'PT Fikri Utama', 'company_name' => 'PT Fikri Utama Sejahtera', 'status' => 'active', 'type' => 'general', 'area' => 'Makassar'],
        ];

        DB::table('tenants')->upsert($tenants, ['id'], ['name', 'company_name', 'status', 'type', 'area']);
    }
}
