<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DivisionSyncTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.optigate_portal.url' => 'https://optigate.test']);
        $this->user = User::factory()->create();
    }

    public function test_guests_cannot_access_divisions_index(): void
    {
        $response = $this->get(route('divisions.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_guests_cannot_trigger_divisions_sync(): void
    {
        $response = $this->post(route('divisions.sync'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_divisions_index(): void
    {
        Division::factory()->count(3)->create();

        $response = $this->actingAs($this->user)->get(route('divisions.index'));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Divisions/Index')
                ->has('divisions.data', 3)
                ->has('filters')
        );
    }

    public function test_server_side_search_filters_divisions(): void
    {
        Division::factory()->create(['kode_division' => 'DIV-01', 'nama_division' => 'Division One']);
        Division::factory()->create(['kode_division' => 'DIV-02', 'nama_division' => 'Division Two']);

        $response = $this->actingAs($this->user)
            ->get(route('divisions.index', ['search' => 'DIV-01']));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Divisions/Index')
                ->has('divisions.data', 1)
                ->where('divisions.data.0.nama_division', 'Division One')
        );
    }

    public function test_sync_pulls_divisions_from_optigate_api(): void
    {
        // Mock Optigate Portal API
        Http::fake([
            '*/api/divisions' => Http::response([
                [
                    'id' => '01j123456789abcdef0123456789',
                    'name' => 'Division One',
                    'code' => 'DIV-01',
                    'department_id' => '019ee92a-a014-7067-9a2c-e7eb71f9c0c3',
                ],
                [
                    'id' => '01j123456789abcdef012345678a',
                    'name' => 'Division Two',
                    'code' => 'DIV-02',
                    'department_id' => '019ee92a-a014-7067-9a2c-e7eb71f9c0c3',
                ],
            ], 200),
        ]);

        $this->assertDatabaseCount('tb_division', 0);

        $response = $this->actingAs($this->user)
            ->post(route('divisions.sync'));

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('toast', [
            'type' => 'success',
            'message' => 'Sinkronisasi divisi berhasil dilakukan.',
        ]);

        $this->assertDatabaseCount('tb_division', 2);
        $this->assertDatabaseHas('tb_division', [
            'id_division' => '01j123456789abcdef0123456789',
            'nama_division' => 'Division One',
            'kode_division' => 'DIV-01',
            'id_department' => '019ee92a-a014-7067-9a2c-e7eb71f9c0c3',
        ]);
    }
}
