<?php

namespace Tests\Unit;

use Tests\TestCase;

class OIDCConfigTest extends TestCase
{
    public function test_oidc_service_config_includes_guzzle_verify_option()
    {
        $guzzleConfig = config('services.oidc.guzzle');

        $this->assertIsArray($guzzleConfig);
        $this->assertArrayHasKey('http_errors', $guzzleConfig);
        $this->assertArrayHasKey('verify', $guzzleConfig);
        $this->assertTrue(
            is_bool($guzzleConfig['verify']) || is_string($guzzleConfig['verify']),
            'OIDC guzzle verify option should be present and boolean or string.'
        );
    }
}
