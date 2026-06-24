<?php

namespace Database\Seeders;

use App\Models\Tenants;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $tenants = [
            [
                'name' => 'Kopi Kenangan',
                'company_name' => 'PT Bumi Berkah Boga',
                'status' => 'active',
                'type' => 'F&B',
                'email' => 'store.dutamall@kopikenangan.com',
                'phone' => '081234567801',
                'area' => 'Lantai Dasar (GF)',
                'location' => 'Unit GF-12',
                'description' => 'Kedai kopi susu kekinian.',
            ],
            [
                'name' => 'Matahari Department Store',
                'company_name' => 'PT Matahari Department Store Tbk',
                'status' => 'active',
                'type' => 'Retail',
                'email' => 'cs.dutamall@matahari.co.id',
                'phone' => '02198765432',
                'area' => 'Lantai 1 & 2',
                'location' => 'Blok A-Utama',
                'description' => 'Toko ritel pakaian dan kebutuhan gaya hidup.',
            ],
            [
                'name' => 'Cinema XXI',
                'company_name' => 'PT Nusantara Sejahtera Raya',
                'status' => 'active',
                'type' => 'Entertainment',
                'email' => 'dutamall@21cineplex.com',
                'phone' => '081234567803',
                'area' => 'Lantai 4',
                'location' => 'Unit 4F-01',
                'description' => 'Bioskop dan cafe.',
            ],
            [
                'name' => 'Erafone',
                'company_name' => 'PT Erajaya Swasembada Tbk',
                'status' => 'suspended',
                'type' => 'Electronics',
                'email' => 'sales@erafone.com',
                'phone' => '081234567804',
                'area' => 'Lantai 3',
                'location' => 'Unit 3F-45',
                'description' => 'Toko handphone dan aksesoris. Ditangguhkan karena masa sewa habis.',
            ],
            [
                'name' => 'Solaria',
                'company_name' => 'PT Solaria Indonesia',
                'status' => 'active',
                'type' => 'F&B',
                'email' => 'dutamall@solaria.com',
                'phone' => '081234567805',
                'area' => 'Lantai 2',
                'location' => 'Unit 2F-10',
                'description' => 'Restoran keluarga.',
            ],
            [
                'name' => 'Bank BCA (KCP)',
                'company_name' => 'PT Bank Central Asia Tbk',
                'status' => 'inactive',
                'type' => 'Services',
                'email' => 'kcp_dutamall@bca.co.id',
                'phone' => '02145678901',
                'area' => 'Lantai Dasar (GF)',
                'location' => 'Unit GF-05',
                'description' => 'Kantor Cabang Pembantu BCA. Sedang renovasi (inactive).',
            ],
            [
                'name' => 'Optik Melawai',
                'company_name' => 'PT Optik Melawai Prima',
                'status' => 'active',
                'type' => 'Health & Beauty',
                'email' => 'cs@optikmelawai.com',
                'phone' => '081234567807',
                'area' => 'Lantai 1',
                'location' => 'Unit 1F-22',
                'description' => 'Kacamata dan lensa kontak.',
            ],
        ];

        foreach ($tenants as $tenant) {
            Tenants::create($tenant);
        }
    }
}
