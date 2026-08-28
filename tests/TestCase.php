<?php

namespace Tests;

use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\TenantSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Schema;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles/permissions for tests (only if tables exist — RefreshDatabase creates them)
        if (Schema::hasTable('permissions')) {
            $this->seed(RoleAndPermissionSeeder::class);
        }

        if (Schema::hasTable('tenants')) {
            $this->seed(TenantSeeder::class);
        }
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
