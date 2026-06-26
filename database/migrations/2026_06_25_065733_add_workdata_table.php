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
        //
        Schema::create('tb_work_data', function (Blueprint $table) {
            $table->id('id_work_data');
            $table->string('no_kerja', 50)->unique();
            $table->date('tanggal_work_data')->nullable();
            $table->unsignedBigInteger('id_department')->nullable();

            // Detail Pekerjaan
            $table->text('deskripsi')->nullable();
            $table->string('gambar_sebelum')->nullable();
            $table->string('gambar_sesudah')->nullable();
            $table->string('status_pekerjaan', 50)->nullable();

            // Analisis & Hasil
            $table->text('prediksi_penyebab')->nullable();
            $table->text('tindakan')->nullable();
            $table->text('hasil_kesimpulan')->nullable();
            $table->text('saran_solusi')->nullable();

            // Relasi Tambahan (Berdasarkan ERD)
            $table->string('kode_inventory', 50)->nullable();
            $table->string('nama_tenant')->nullable();
            $table->string('work_department')->nullable();

            // Timestamps & Tracking
            $table->timestamp('create_date')->useCurrent();
            $table->unsignedBigInteger('create_id_user')->nullable();
            $table->timestamp('modified_date')->nullable()->useCurrentOnUpdate();
            $table->unsignedBigInteger('modified_id_user')->nullable();
            $table->string('status_hapus', 10)->nullable();

            // Foreign Keys
            $table->foreign('id_department')
                ->references('id_department')
                ->on('tb_department')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('tb_work_data');
    }
};
