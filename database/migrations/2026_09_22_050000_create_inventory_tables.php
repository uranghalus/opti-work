<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FR-23 (tb_inventory, tb_kelompok_barang) & FR-24 (tb_inventory_expand_data).
     */
    public function up(): void
    {
        Schema::create('tb_kelompok_barang', function (Blueprint $table): void {
            $table->id('id_kelompok_barang');
            $table->string('kode_kelompok', 30)->unique();
            $table->string('nama_kelompok', 150);
            $table->text('deskripsi')->nullable();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tb_inventory', function (Blueprint $table): void {
            $table->id('id_inventory');
            $table->string('kode_barang', 50)->unique();
            $table->string('nama_barang', 255);
            $table->unsignedBigInteger('id_kelompok_barang')->nullable();
            $table->foreign('id_kelompok_barang')->references('id_kelompok_barang')->on('tb_kelompok_barang')->nullOnDelete();
            $table->text('spesifikasi')->nullable();
            $table->string('kode_inventory', 50)->nullable();
            $table->string('penanggung_jawab', 150)->nullable();
            $table->string('kondisi', 30)->default('baik'); // baik, rusak_ringan, rusak_berat, perbaikan
            $table->string('lokasi_barang', 255)->nullable();
            $table->string('jenis_barang', 100)->nullable();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['kode_inventory', 'tenant_id']);
            $table->index('id_kelompok_barang');
        });

        Schema::create('tb_inventory_expand_data', function (Blueprint $table): void {
            $table->id('id_expand');
            $table->unsignedBigInteger('id_inventory');
            $table->foreign('id_inventory')->references('id_inventory')->on('tb_inventory')->cascadeOnDelete();
            $table->string('field_name', 150);
            $table->string('field_value');
            $table->string('field_type', 30)->default('text'); // text, number, date, boolean
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->timestamps();

            $table->unique(['id_inventory', 'field_name']);
            $table->index('field_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_inventory_expand_data');
        Schema::dropIfExists('tb_inventory');
        Schema::dropIfExists('tb_kelompok_barang');
    }
};
