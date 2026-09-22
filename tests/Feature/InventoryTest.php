<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\KelompokBarang;
use App\Models\User;
use App\Models\WorkData;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\TenantSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(TenantSeeder::class);
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_hod_can_view_inventory_index(): void
    {
        $hod = User::factory()->create(['tenant_id' => 1])->assignRole('hod');
        Inventory::factory()->count(3)->create();

        $response = $this->actingAs($hod)->get(route('inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Inventory/Index')
            ->has('inventories.data', 3)
        );
    }

    public function test_inventory_store_creates_record_with_tenant(): void
    {
        // admin_tenant punya context tenant (super_admin = lintas tenant, tenant_id tidak diisi otomatis)
        $admin = User::factory()->create(['tenant_id' => 1])->assignRole('admin_tenant');

        $response = $this->actingAs($admin)->post(route('inventory.store'), [
            'kode_barang' => 'BRG-TEST-001',
            'kode_inventory' => 'INV-9001',
            'nama_barang' => 'Pompa Air Gedung A',
            'kondisi' => 'baik',
            'lokasi_barang' => 'Gedung A Lt 1',
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tb_inventory', [
            'kode_barang' => 'BRG-TEST-001',
            'kode_inventory' => 'INV-9001',
            'nama_barang' => 'Pompa Air Gedung A',
            'tenant_id' => 1,
        ]);
    }

    public function test_store_validates_required_fields_and_unique_kode(): void
    {
        $admin = User::factory()->create(['tenant_id' => 1])->assignRole('super_admin');
        Inventory::factory()->create(['kode_barang' => 'BRG-DUP']);

        $response = $this->actingAs($admin)->post(route('inventory.store'), [
            'kode_barang' => 'BRG-DUP',
            'nama_barang' => 'Duplikat',
            'kondisi' => 'baik',
        ]);

        $response->assertSessionHasErrors(['kode_barang']);

        $response = $this->actingAs($admin)->post(route('inventory.store'), [
            'nama_barang' => 'Tanpa kode',
            'kondisi' => 'baik',
        ]);

        $response->assertSessionHasErrors(['kode_barang']);
    }

    public function test_dynamic_fields_are_synced_on_store_and_update(): void
    {
        $admin = User::factory()->create(['tenant_id' => 1])->assignRole('super_admin');

        $this->actingAs($admin)->post(route('inventory.store'), [
            'kode_barang' => 'BRG-DYN-01',
            'nama_barang' => 'Genset 500kVA',
            'kondisi' => 'baik',
            'dynamic_fields' => [
                ['field_name' => 'kapasitas', 'field_value' => '500 kVA', 'field_type' => 'text'],
                ['field_name' => 'tahun_pembuatan', 'field_value' => '2020', 'field_type' => 'number'],
            ],
        ]);

        $inventory = Inventory::where('kode_barang', 'BRG-DYN-01')->firstOrFail();

        $this->assertDatabaseHas('tb_inventory_expand_data', [
            'id_inventory' => $inventory->id_inventory,
            'field_name' => 'kapasitas',
            'field_value' => '500 kVA',
        ]);
        $this->assertDatabaseHas('tb_inventory_expand_data', [
            'id_inventory' => $inventory->id_inventory,
            'field_name' => 'tahun_pembuatan',
            'field_value' => '2020',
        ]);

        // Update: ganti satu field, hapus field lain
        $this->actingAs($admin)->put(route('inventory.update', $inventory), [
            'kode_barang' => 'BRG-DYN-01',
            'nama_barang' => 'Genset 500kVA',
            'kondisi' => 'baik',
            'dynamic_fields' => [
                ['field_name' => 'kapasitas', 'field_value' => '750 kVA', 'field_type' => 'text'],
            ],
        ]);

        $this->assertDatabaseHas('tb_inventory_expand_data', [
            'id_inventory' => $inventory->id_inventory,
            'field_name' => 'kapasitas',
            'field_value' => '750 kVA',
        ]);
        $this->assertDatabaseMissing('tb_inventory_expand_data', [
            'id_inventory' => $inventory->id_inventory,
            'field_name' => 'tahun_pembuatan',
        ]);
    }

    public function test_inventory_is_tenant_isolated(): void
    {
        $hodTenant1 = User::factory()->create(['tenant_id' => 1])->assignRole('hod');
        Inventory::factory()->create(['tenant_id' => 1, 'kode_barang' => 'BRG-T1']);
        Inventory::factory()->create(['tenant_id' => 2, 'kode_barang' => 'BRG-T2']);

        $response = $this->actingAs($hodTenant1)->get(route('inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('inventories.data', 1)
            ->where('inventories.data.0.kode_barang', 'BRG-T1')
        );
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $viewer = User::factory()->create(['tenant_id' => 1])->assignRole('karyawan');

        $this->actingAs($viewer)->get(route('inventory.index'))->assertForbidden();
        $this->actingAs($viewer)->get(route('inventory.create'))->assertForbidden();
    }

    public function test_work_data_can_link_to_inventory_via_kode_inventory(): void
    {
        $admin = User::factory()->create(['tenant_id' => 1])->assignRole('admin_tenant');
        Inventory::factory()->create(['tenant_id' => 1, 'kode_inventory' => 'INV-LINK-01']);

        $workData = WorkData::create([
            'no_kerja' => 'SPK-'.Str::upper(Str::random(8)),
            'tenant_id' => 1,
        ]);

        $this->actingAs($admin)
            ->put(route('work-data.update', $workData), [
                'kode_inventory' => 'INV-LINK-01',
            ])
            ->assertSessionHasNoErrors();

        $workData->refresh();
        $this->assertSame('INV-LINK-01', $workData->kode_inventory);

        // Kode inventaris tidak valid harus ditolak
        $this->actingAs($admin)->put(route('work-data.update', $workData), [
            'kode_inventory' => 'INV-TIDAK-ADA',
        ])->assertSessionHasErrors(['kode_inventory']);

        // FR-18: workData() dari sisi Inventory harus menemukan relasi
        $inventory = Inventory::where('kode_inventory', 'INV-LINK-01')->firstOrFail();
        $this->assertTrue($inventory->workData()->whereKey($workData->id_work_data)->exists());
    }

    public function test_kelompok_barang_cannot_be_deleted_while_in_use(): void
    {
        $admin = User::factory()->create(['tenant_id' => 1])->assignRole('super_admin');
        $kelompok = KelompokBarang::factory()->create();
        Inventory::factory()->create(['id_kelompok_barang' => $kelompok->id_kelompok_barang]);

        $this->actingAs($admin)->delete(route('kelompok-barang.destroy', $kelompok))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('tb_kelompok_barang', [
            'id_kelompok_barang' => $kelompok->id_kelompok_barang,
            'deleted_at' => null,
        ]);
    }
}
