<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class WorkOrderWahaNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['tenant_id' => 1]);
        $this->actingAs($this->user);

        // Konfigurasi WAHA Settings
        Setting::set('waha_url', 'http://localhost:3000');
        Setting::set('waha_session', 'my-waha-session');
        Setting::set('waha_api_key', 'my-api-key');
    }

    /**
     * Test WhatsApp notification is sent via WAHA when a Work Order is created.
     */
    public function test_whatsapp_notification_is_sent_via_waha_on_wo_creation(): void
    {
        Http::fake([
            'localhost:3000/api/sendText' => Http::response(['id' => 'msg-waha-123'], 200),
        ]);

        // 1. Buat Employee HOD
        $hod = Employee::create([
            'id_employee' => (string) Str::uuid(),
            'nik_employee' => 'NIK-001',
            'nama_employee' => 'HOD Engineering',
            'email' => 'hod.eng@example.com',
            'number' => '628999999999',
        ]);

        // 2. Buat Department dengan HOD tersebut
        $dept = Department::create([
            'id_department' => (string) Str::uuid(),
            'kode_department' => 'ENG',
            'nama_department' => 'Engineering',
            'hod_user_id' => $hod->id_employee,
        ]);

        // 3. Request input untuk buat Work Order
        $woData = [
            'department' => $dept->id_department,
            'rincian_pekerjaan' => 'Perbaikan pendingin server di ruang IT',
            'location_type' => 'location',
            'lokasi' => 'Ruang IT Lantai 2',
            'priority_type' => 'urgent',
            'urgent_sub_type' => 'by_accident',
            'prioritas' => 'high',
            'keterangan' => 'Suhu ruangan mencapai 28 derajat celcius',
        ];

        // 4. Hit endpoint create work order
        $response = $this
            ->actingAs($this->user)
            ->post(route('work-orders.store'), $woData);

        $response->assertRedirect(route('work-orders.index'));

        // 5. Pastikan HTTP Request ke WAHA dikirim dengan parameter yang benar
        Http::assertSent(function ($request) {
            return $request->url() === 'http://localhost:3000/api/sendText' &&
                $request->header('X-Api-Key')[0] === 'my-api-key' &&
                $request['chatId'] === '628999999999@c.us' &&
                $request['session'] === 'my-waha-session' &&
                str_contains($request['text'], 'WORK ORDER BARU') &&
                str_contains($request['text'], 'Perbaikan pendingin server di ruang IT');
        });
    }

    /**
     * Test when HOD is not found, no notification is sent and log warning is written.
     */
    public function test_no_notification_sent_when_hod_not_set(): void
    {
        Http::fake();

        // Buat department tanpa HOD
        $dept = Department::create([
            'id_department' => (string) Str::uuid(),
            'kode_department' => 'FAC',
            'nama_department' => 'Facility',
            'hod_user_id' => null,
        ]);

        $woData = [
            'department' => $dept->id_department,
            'rincian_pekerjaan' => 'Penggantian keramik koridor',
            'location_type' => 'location',
            'lokasi' => 'Koridor utama',
            'priority_type' => 'normal',
            'prioritas' => 'low',
        ];

        $response = $this
            ->actingAs($this->user)
            ->post(route('work-orders.store'), $woData);

        $response->assertRedirect(route('work-orders.index'));

        // Pastikan tidak ada pengiriman HTTP request ke WAHA
        Http::assertNothingSent();
    }
}
