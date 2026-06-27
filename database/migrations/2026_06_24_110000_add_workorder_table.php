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
        Schema::create('tb_work_order', function (Blueprint $table) {
            $table->id('id_work_order');
            $table->string('no_work_order')->unique();
            $table->date('tgl_work_order')->nullable(); // Tanggal user request

            // Data Permintaan
            $table->text('rincian_pekerjaan')->nullable();
            $table->string('department_tujuan')->nullable();

            $table->string('lokasi')->nullable(); // Untuk teks bebas atau nama tenant
            $table->string('tenant_id')->nullable();

            $table->string('priority_type')->default('normal');
            $table->string('urgent_sub_type')->nullable();
            $table->string('prioritas')->default('medium'); // Normal, Urgent - Accident, Urgent - Owner

            // Status Tiket: 'Pending HOD', 'Executed', 'Rejected'
            $table->string('status_tiket')->default('Pending HOD');
            $table->string('user_requester')->nullable();

            $table->unsignedBigInteger('modified_user')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('tb_work_order');
    }
};
