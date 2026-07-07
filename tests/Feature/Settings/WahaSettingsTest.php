<?php

namespace Tests\Feature\Settings;

use App\Helpers\WahaHelper;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WahaSettingsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can view WAHA connection settings page.
     */
    public function test_waha_settings_page_is_displayed(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'localhost/api/sessions/default' => Http::response(['status' => 'STOPPED'], 200),
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('waha.edit'));

        $response->assertOk();
    }

    /**
     * Test guest cannot view WAHA connection settings page.
     */
    public function test_guest_cannot_view_waha_settings_page(): void
    {
        $response = $this
            ->get(route('waha.edit'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test WAHA settings can be updated successfully.
     */
    public function test_waha_settings_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('waha.update'), [
                'waha_session' => 'my-custom-session',
                'waha_url' => 'https://waha.example.com',
                'waha_api_key' => 'secret-key-123',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('waha.edit'));

        $this->assertEquals('my-custom-session', Setting::get('waha_session'));
        $this->assertEquals('https://waha.example.com', Setting::get('waha_url'));
        $this->assertEquals('secret-key-123', Setting::get('waha_api_key'));
    }

    /**
     * Test updating WAHA settings requires session name and valid URL.
     */
    public function test_waha_settings_validation_errors(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('waha.update'), [
                'waha_session' => '',
                'waha_url' => 'not-a-valid-url',
                'waha_api_key' => 'secret-key-123',
            ]);

        $response->assertSessionHasErrors(['waha_session', 'waha_url']);
    }

    /**
     * Test WahaHelper when settings are not configured.
     */
    public function test_waha_helper_not_configured(): void
    {
        $this->assertEquals('NOT_CONFIGURED', WahaHelper::getSessionStatus());
    }

    /**
     * Test WahaHelper session status when working successfully.
     */
    public function test_waha_helper_session_status_working(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default' => Http::response(['status' => 'WORKING'], 200),
        ]);

        $this->assertEquals('WORKING', WahaHelper::getSessionStatus());
    }

    /**
     * Test WahaHelper session status when returning error response.
     */
    public function test_waha_helper_session_status_error(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default' => Http::response([], 500),
        ]);

        $this->assertEquals('ERROR', WahaHelper::getSessionStatus());
    }

    /**
     * Test WahaHelper session status when server is unreachable/offline.
     */
    public function test_waha_helper_session_status_unreachable(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default' => function () {
                throw new ConnectionException('Connection refused');
            },
        ]);

        $this->assertEquals('UNREACHABLE', WahaHelper::getSessionStatus());
    }

    /**
     * Test WahaHelper getQrCode method.
     */
    public function test_waha_helper_get_qr_code(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/default/auth/qr?format=image' => Http::response('binary-image-data-here', 200),
        ]);

        $qr = WahaHelper::getQrCode();
        $this->assertEquals('data:image/png;base64,'.base64_encode('binary-image-data-here'), $qr);
    }

    /**
     * Test WahaHelper getMeProfile method.
     */
    public function test_waha_helper_get_me_profile(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/default/profile' => Http::response([
                'id' => '628123456789@c.us',
                'name' => 'John Doe',
                'picture' => 'https://example.com/avatar.jpg',
            ], 200),
        ]);

        $profile = WahaHelper::getMeProfile();
        $this->assertNotNull($profile);
        $this->assertEquals('628123456789@c.us', $profile['id']);
        $this->assertEquals('628123456789', $profile['phone']);
        $this->assertEquals('John Doe', $profile['name']);
        $this->assertEquals('https://example.com/avatar.jpg', $profile['avatar']);
    }

    /**
     * Test WahaHelper requestPairingCode method.
     */
    public function test_waha_helper_request_pairing_code(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/default/auth/request-code' => Http::response(['code' => 'ABCD-1234'], 200),
        ]);

        $code = WahaHelper::requestPairingCode('6281234567890');
        $this->assertEquals('ABCD-1234', $code);
    }

    /**
     * Test requesting pairing code endpoint.
     */
    public function test_controller_request_pairing_code(): void
    {
        $user = User::factory()->create();

        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/default/auth/request-code' => Http::response(['code' => 'ABCD-1234'], 200),
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson(route('waha.pairing-code'), [
                'phone_number' => '6281234567890',
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'code' => 'ABCD-1234',
            ]);
    }

    /**
     * Test WahaHelper logout method.
     */
    public function test_waha_helper_logout(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default/logout' => Http::response([], 200),
        ]);

        $success = WahaHelper::logout();
        $this->assertTrue($success);
    }

    /**
     * Test controller logout endpoint.
     */
    public function test_controller_logout(): void
    {
        $user = User::factory()->create();

        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default/logout' => Http::response([], 200),
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('waha.logout'));

        $response->assertRedirect(route('waha.edit'));
    }

    /**
     * Test WahaHelper session status when returning 404 returns STOPPED.
     */
    public function test_waha_helper_session_status_404_returns_stopped(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sessions/default' => Http::response([], 404),
        ]);

        $this->assertEquals('STOPPED', WahaHelper::getSessionStatus());
    }

    /**
     * Test WahaHelper startSession method.
     */
    public function test_waha_helper_start_session(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');

        Http::fake([
            '*' => Http::response(['name' => 'default', 'status' => 'STARTING'], 200),
        ]);

        $success = WahaHelper::startSession('default');
        $this->assertTrue($success);
    }

    /**
     * Test controller restartSession endpoint.
     */
    public function test_controller_restart_session(): void
    {
        $user = User::factory()->create();

        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            '*' => Http::response(['name' => 'default', 'status' => 'STARTING'], 200),
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson(route('waha.restart'));

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test WahaHelper sending message successfully.
     */
    public function test_waha_helper_send_message(): void
    {
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'default');

        Http::fake([
            'localhost:3000/api/sendText' => Http::response(['id' => 'msg-123'], 200),
        ]);

        $success = WahaHelper::sendMessage('628123456789', 'Hello WhatsApp!');

        $this->assertTrue($success);

        Http::assertSent(function ($request) {
            return $request->url() === 'http://localhost:3000/api/sendText' &&
                $request['chatId'] === '628123456789@c.us' &&
                $request['text'] === 'Hello WhatsApp!' &&
                $request['session'] === 'default';
        });
    }
}
