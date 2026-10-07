<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_redirects_guests_to_the_saml_identity_provider()
    {
        $response = $this->get(route('home'));

        $response->assertRedirect(route('saml.redirect'));
    }

    public function test_home_redirects_authenticated_users_to_the_dashboard()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertRedirect(route('dashboard'));
    }
}
