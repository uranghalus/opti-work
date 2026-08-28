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
        Schema::create('tb_schedule_wd', function (Blueprint $table) {
            $table->id('id_schedule_wd');
            $table->foreignId('id_work_data')->constrained('tb_work_data', 'id_work_data')->cascadeOnDelete();
            $table->date('tgl_jadwal');
            $table->string('jam_mulai', 10)->nullable(); // HH:MM
            $table->string('jam_selesai', 10)->nullable(); // HH:MM
            $table->string('jenis_pekerjaan', 100)->nullable(); // Preventive, Corrective, Emergency
            $table->string('deskripsi_pekerjaan')->nullable();
            $table->string('lokasi', 255)->nullable();
            $table->string('status_jadwal', 50)->default('scheduled'); // scheduled, in_progress, completed, cancelled, rescheduled
            $table->text('catatan')->nullable();
            $table->foreignId('rescheduled_from')->nullable()->constrained('tb_schedule_wd', 'id_schedule_wd')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_schedule_wd');
    }
};
