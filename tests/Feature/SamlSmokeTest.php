<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SamlSmokeTest extends TestCase
{
    /**
     * Regression: konfigurasi saml2 (config/services.php) harus cukup untuk
     * membangun AuthnRequest — sebelumnya MissingConfigException karena key
     * 'certficate'/'entityId' tidak sesuai yang dibaca vendor ('certificate'/'entityid').
     */
    public function test_auth_redirect_builds_saml_request_and_points_to_idp(): void
    {
        $response = $this->get(route('authsso'));

        $this->assertSame(302, $response->getStatusCode(), 'auth/redirect harus 302 ke IdP');

        $target = (string) $response->headers->get('Location');
        $this->assertStringContainsString('gate.appdutamall.com', $target);
        $this->assertStringContainsString('SAMLRequest=', $target, 'Redirect harus membawa AuthnRequest');
    }

    /**
     * Vendor membangun SP descriptor dari route sp_acs — route callback
     * harus terdaftar untuk binding POST (standar IdP→SP) maupun GET.
     */
    public function test_saml_callback_routes_are_registered(): void
    {
        $this->assertTrue(Route::has('ssocallback'));
        $this->assertTrue(Route::has('ssocallback.post'));

        // Route harus ter-match (bukan 404); tanpa SAMLResponse handler akan redirect/eror terkontrol
        $status = $this->get('/auth/oidc/callback')->getStatusCode();
        $this->assertNotSame(404, $status);
    }
}
