<?php

namespace Tests\Feature;

use Tests\TestCase;

class WorkOrderCrudTest extends TestCase
{
    /**
     * Tanpa halaman welcome, guest yang membuka root diarahkan ke SSO.
     */
    public function test_guests_are_redirected_to_sso_from_the_root(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('saml.redirect'));
    }
}
