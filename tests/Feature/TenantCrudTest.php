<?php

namespace Tests\Feature;

use App\Models\Tenants;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TenantCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Storage::fake('s3');
    }

    public function test_guests_cannot_access_tenants_index(): void
    {
        $response = $this->get(route('tenants.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_tenants_index(): void
    {
        Tenants::factory()->count(3)->create();

        $response = $this->actingAs($this->user)->get(route('tenants.index'));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Index')
                ->has('tenants.data', 3)
                ->has('filters')
        );
    }

    public function test_server_side_search_filters_tenants(): void
    {
        Tenants::factory()->create(['name' => 'John Doe']);
        Tenants::factory()->create(['name' => 'Jane Smith']);
        Tenants::factory()->create(['company_name' => 'Acme Corp']);

        $response = $this->actingAs($this->user)
            ->get(route('tenants.index', ['search' => 'John']));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Index')
                ->has('tenants.data', 1)
        );
    }

    public function test_status_filter_works(): void
    {
        Tenants::factory()->active()->count(2)->create();
        Tenants::factory()->inactive()->create();

        $response = $this->actingAs($this->user)
            ->get(route('tenants.index', ['status' => 'active']));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Index')
                ->has('tenants.data', 2)
        );
    }

    public function test_authenticated_users_can_view_create_page(): void
    {
        $response = $this->actingAs($this->user)->get(route('tenants.create'));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Create')
        );
    }

    public function test_authenticated_users_can_create_a_tenant(): void
    {
        $data = [
            'name' => 'Test Tenant',
            'company_name' => 'Test Company',
            'status' => 'active',
            'type' => 'Vendor',
            'email' => 'test@example.com',
            'phone' => '123456789',
            'area' => 'Jakarta',
            'location' => 'Jl. Sudirman No. 1',
            'description' => 'A test tenant.',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('tenants.store'), $data);

        $response->assertRedirect(route('tenants.index'));
        $this->assertDatabaseHas('tenants', ['name' => 'Test Tenant']);
    }

    public function test_creating_tenant_with_logo_upload(): void
    {
        $data = [
            'name' => 'Tenant With Logo',
            'status' => 'active',
            'logo' => UploadedFile::fake()->create('logo.png', 100, 'image/png'),
        ];

        $response = $this->actingAs($this->user)
            ->post(route('tenants.store'), $data);

        $response->assertRedirect(route('tenants.index'));

        $tenant = Tenants::where('name', 'Tenant With Logo')->first();
        $this->assertNotNull($tenant);
        $this->assertNotNull($tenant->logo_path);
        Storage::disk('s3')->assertExists($tenant->logo_path);
    }

    public function test_validation_fails_with_missing_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('tenants.store'), []);

        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_validation_fails_with_invalid_email(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('tenants.store'), [
                'name' => 'Test',
                'status' => 'active',
                'email' => 'not-an-email',
            ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_validation_fails_with_duplicate_email(): void
    {
        Tenants::factory()->create(['email' => 'taken@example.com']);

        $response = $this->actingAs($this->user)
            ->post(route('tenants.store'), [
                'name' => 'Test',
                'status' => 'active',
                'email' => 'taken@example.com',
            ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_authenticated_users_can_view_edit_page(): void
    {
        $tenant = Tenants::factory()->create();

        $response = $this->actingAs($this->user)->get(route('tenants.edit', $tenant));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Edit')
                ->has('tenant')
        );
    }

    public function test_authenticated_users_can_update_a_tenant(): void
    {
        $tenant = Tenants::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->user)
            ->put(route('tenants.update', $tenant), [
                'name' => 'Updated Name',
                'status' => 'inactive',
            ]);

        $response->assertRedirect(route('tenants.index'));
        $this->assertDatabaseHas('tenants', [
            'id' => $tenant->id,
            'name' => 'Updated Name',
            'status' => 'inactive',
        ]);
    }

    public function test_authenticated_users_can_delete_a_tenant(): void
    {
        $tenant = Tenants::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete(route('tenants.destroy', $tenant));

        $response->assertRedirect(route('tenants.index'));
        $this->assertSoftDeleted('tenants', ['id' => $tenant->id]);
    }

    public function test_deleting_tenant_removes_logo_from_s3(): void
    {
        $tenant = Tenants::factory()->create();
        $file = UploadedFile::fake()->create('logo.png', 100, 'image/png');
        $path = $file->store('tenants/logos', 's3');
        $tenant->update(['logo_path' => $path]);

        $this->actingAs($this->user)
            ->delete(route('tenants.destroy', $tenant));

        Storage::disk('s3')->assertMissing($path);
    }

    public function test_pagination_returns_correct_number_of_items(): void
    {
        Tenants::factory()->count(15)->create();

        $response = $this->actingAs($this->user)->get(route('tenants.index'));

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Tenants/Index')
                ->has('tenants.data', 12)
                ->where('tenants.total', 15)
                ->where('tenants.last_page', 2)
        );
    }
}
