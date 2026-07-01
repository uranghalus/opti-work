<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class EvolutionApiService
{
    /**
     * Create a new class instance.
     */
    protected $baseUrl;

    protected $globalApiKey;

    // Properti Instance yang dipanggil dinamis dari Database Settings
    protected $instanceName;

    protected $instanceToken;

    public function __construct()
    {
        $this->baseUrl = config('services.evolution.api_url');
        $this->globalApiKey = config('services.evolution.global_api_key');

        // Memastikan instance yang dipakai selalu yang terbaru dari konfigurasi user
        $this->instanceName = Setting::getValue('instance_name', 'wa_gateway');
        $this->instanceToken = Setting::getValue('instance_token', 'wa_gateway');
    }
    /* =========================================================
        1. HTTP CLIENT FACTORY
        ========================================================= */

    /**
     * Digunakan KHUSUS untuk memanipulasi Instance (Create, Restart, Delete)
     */
    private function adminClient()
    {
        return Http::withHeaders([
            'apikey' => $this->globalApiKey,
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }

    /**
     * Digunakan untuk operasi harian WhatsApp (Kirim Pesan, Baca Chat, QR)
     */
    private function instanceClient()
    {
        return Http::withHeaders([
            'apikey' => $this->instanceToken,
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }
    /* =========================================================
       2. INSTANCE MANAGEMENT (Menggunakan Admin Client)
       ========================================================= */

    public function createInstance($payloadOverride = [])
    {
        // ... (Gunakan logika payload v2 lengkap dari jawaban saya sebelumnya di sini)
        // return $this->adminClient()->post('/instance/create', $payload)->json();
    }

    public function restartInstance()
    {
        return $this->adminClient()->put("/instance/restart/{$this->instanceName}")->json();
    }

    public function deleteInstance()
    {
        return $this->adminClient()->delete("/instance/delete/{$this->instanceName}")->json();
    }

    /* =========================================================
       3. INSTANCE OPERATIONS (Menggunakan Instance Client)
       ========================================================= */

    public function getConnectionState()
    {
        return $this->instanceClient()->get("/instance/connectionState/{$this->instanceName}")->json();
    }

    public function getQrCode()
    {
        return $this->instanceClient()->get("/instance/connect/{$this->instanceName}")->json();
    }

    public function logoutInstance()
    {
        return $this->instanceClient()->delete("/instance/logout/{$this->instanceName}")->json();
    }

    /* =========================================================
       4. MESSAGING SERVICES
       ========================================================= */

    /**
     * Mengirim pesan teks biasa
     */
    public function sendText($number, $text, $delay = 1200)
    {
        return $this->instanceClient()->post("/message/sendText/{$this->instanceName}", [
            'number' => $number,
            'text' => $text,
            'delay' => $delay, // Efek "sedang mengetik..." sebelum pesan masuk
        ])->json();
    }

    /**
     * Mengirim media (Gambar, Dokumen PDF, Video)
     * $mediaType: 'image' | 'video' | 'audio' | 'document'
     */
    public function sendMedia($number, $mediaUrl, $mediaType = 'image', $caption = '')
    {
        return $this->instanceClient()->post("/message/sendMedia/{$this->instanceName}", [
            'number' => $number,
            'mediatype' => $mediaType,
            'mimetype' => '', // Kosongkan agar Evolution API otomatis menebak dari ekstensi URL
            'media' => $mediaUrl,
            'caption' => $caption,
        ])->json();
    }

    /* =========================================================
       5. UTILITIES
       ========================================================= */

    /**
     * Memeriksa apakah nomor tersebut terdaftar di WhatsApp.
     * Sangat berguna untuk divalidasi sebelum mengirim pesan penting.
     */
    public function checkNumberOnWhatsApp($number)
    {
        return $this->instanceClient()->post("/chat/whatsappNumbers/{$this->instanceName}", [
            'numbers' => [$number],
        ])->json();
    }
}
