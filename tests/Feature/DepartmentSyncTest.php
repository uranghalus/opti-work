<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DepartmentSyncTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.optigate_portal.url' => 'https://optigate.test']);
        $this->user = User::factory()->create();
    }

    public function test_guests_cannot_access_departments_index(): void
    {
        $response = $this->get(route('departments.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_guests_cannot_trigger_departments_sync(): void
    {
        $response = $this->post(route('departments.sync'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_departments_index(): void
    {
        Department::factory()->count(3)->create();

        $response = $this->actingAs($this->user)->get(route('departments.index'));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Departments/Index')
                ->has('departments.data', 3)
                ->has('filters')
        );
    }

    public function test_server_side_search_filters_departments(): void
    {
        Department::factory()->create(['kode_department' => 'ITD', 'nama_department' => 'IT Department']);
        Department::factory()->create(['kode_department' => 'HRD', 'nama_department' => 'HR Department']);

        $response = $this->actingAs($this->user)
            ->get(route('departments.index', ['search' => 'ITD']));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Departments/Index')
                ->has('departments.data', 1)
                ->where('departments.data.0.nama_department', 'IT Department')
        );
    }

    public function test_sync_pulls_departments_from_optigate_api(): void
    {
        // Mock Optigate Portal API
        Http::fake([
            '*/api/departments' => Http::response([
                'data' => [
                    [
                        'id' => '01j123456789abcdef0123456789',
                        'name' => 'IT Department',
                        'code' => 'ITD',
                    ],
                    [
                        'id' => '01j123456789abcdef012345678a',
                        'name' => 'HR Department',
                        'code' => 'HRD',
                    ],
                ],
            ], 200),
        ]);

        $this->assertDatabaseCount('tb_department', 0);

        $response = $this->actingAs($this->user)
            ->post(route('departments.sync'));

        $response->assertRedirect(route('departments.index'));
        $response->assertSessionHas('toast', [
            'type' => 'success',
            'message' => 'Sinkronisasi departemen berhasil dilakukan.',
        ]);

        $this->assertDatabaseCount('tb_department', 2);
        $this->assertDatabaseHas('tb_department', [
            'id_department' => '01j123456789abcdef0123456789',
            'nama_department' => 'IT Department',
            'kode_department' => 'ITD',
        ]);
    }
}
