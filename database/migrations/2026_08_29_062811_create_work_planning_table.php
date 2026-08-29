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
        Schema::create('tb_work_planning', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_work_order')->constrained('tb_work_order', 'id_work_order')->onDelete('cascade');
            $table->date('tgl_jadwal')->nullable();
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('jenis_pekerjaan', 100)->nullable();
            $table->string('status_jadwal', 20)->default('planned');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_work_planning');
    }
};
