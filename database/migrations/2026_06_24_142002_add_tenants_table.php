<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();

            // Informasi Utama
            $table->string('name')->comment('Nama perwakilan atau entitas penyewa');
            $table->string('company_name')->nullable()->comment('Nama perusahaan/badan usaha');

            // Status dan Tipe
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->string('type')->nullable()->comment('Misal: Internal, Eksternal, Vendor');

            // Kontak & Lokasi
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('area')->nullable()->comment('Zona atau region operasional');
            $table->text('location')->nullable()->comment('Alamat lengkap atau titik lokasi');

            // File & Keterangan Ekstra
            $table->string('logo_path')->nullable()->comment('Path penyimpanan logo tenant');
            $table->text('description')->nullable();

            // Audit & Tracking bawaan Laravel
            $table->timestamps();
            $table->softDeletes(); // Mencegah data terhapus permanen agar riwayat work order tidak error
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
