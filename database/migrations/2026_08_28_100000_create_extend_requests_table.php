<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tb_extend_requests')) {
            return;
        }

        Schema::create('tb_extend_requests', function (Blueprint $table) {
            $table->id('id_extend_request');
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->unsignedBigInteger('id_work_order');
            $table->foreign('id_work_order')->references('id_work_order')->on('tb_work_order')->cascadeOnDelete();
            $table->unsignedBigInteger('requested_by');
            $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
            $table->integer('extend_days')->default(1);
            $table->text('extend_reason');
            $table->enum('status', ['pending_tl_approval', 'pending_hod_approval', 'approved', 'rejected'])->default('pending_tl_approval');
            $table->unsignedBigInteger('tl_approved_by')->nullable();
            $table->foreign('tl_approved_by')->references('id')->on('users')->nullOnDelete();
            $table->datetime('tl_approved_at')->nullable();
            $table->text('tl_notes')->nullable();
            $table->unsignedBigInteger('hod_approved_by')->nullable();
            $table->foreign('hod_approved_by')->references('id')->on('users')->nullOnDelete();
            $table->datetime('hod_approved_at')->nullable();
            $table->text('hod_notes')->nullable();
            $table->date('new_deadline_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_extend_requests');
    }
};
