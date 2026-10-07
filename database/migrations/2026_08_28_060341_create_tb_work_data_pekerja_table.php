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
        Schema::create('tb_work_data_pekerja', function (Blueprint $table) {
            $table->id('id_work_data_pekerja');
            $table->unsignedBigInteger('id_work_data');
            $table->foreign('id_work_data')->references('id_work_data')->on('tb_work_data')->cascadeOnDelete();
            $table->uuid('id_employee')->nullable();
            $table->foreign('id_employee')->references('id_employee')->on('tb_employee')->nullOnDelete();
            $table->foreignId('id_user')->nullable();
            $table->foreign('id_user')->references('id')->on('users')->nullOnDelete();
            $table->string('role_pekerja', 50)->default('pelaksana'); // pelaksana, koordinator, pengawas
            $table->string('status_alokasi', 50)->default('assigned'); // assigned, accepted, in_progress, completed
            $table->string('catatan', 255)->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['id_work_data', 'id_employee'], 'unique_work_data_employee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_work_data_pekerja');
    }
};
