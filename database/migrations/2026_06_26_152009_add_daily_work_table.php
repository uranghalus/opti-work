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
        Schema::create('tb_work_daily', function (Blueprint $table) {
            $table->id('id_work_daily');

            // Menginduk ke Pusat Eksekusi
            $table->unsignedBigInteger('id_work_data');

            // Data Laporan Harian
            $table->date('tanggal_kerja');
            $table->text('aktivitas_hari_ini');
            $table->integer('progres_persentase')->default(0);
            $table->text('kendala_lapangan')->nullable();
            $table->string('pelapor')->nullable(); // Karyawan yang mengisi log

            $table->timestamps();
            $table->softDeletes();

            // Foreign Key
            $table->foreign('id_work_data')
                ->references('id_work_data')
                ->on('tb_work_data')
                ->onDelete('cascade'); // Hapus log harian jika data eksekusi utama dihapus
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
