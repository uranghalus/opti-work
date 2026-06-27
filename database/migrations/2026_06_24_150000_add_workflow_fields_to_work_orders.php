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
        Schema::table('tb_work_order', function (Blueprint $table) {
            // Priority system
            $table->string('priority_type')->default('normal')->after('prioritas'); // 'normal', 'urgent'
            $table->string('urgent_sub_type')->nullable()->after('priority_type'); // 'by_accident', 'by_owner'

            // Location/Tenant selection
            $table->string('location_type')->default('location')->after('lokasi'); // 'location', 'tenant'
            $table->unsignedBigInteger('tenant_id')->nullable()->after('location_type');
            $table->string('tenant_name')->nullable()->after('tenant_id');

            // HOD workflow
            $table->string('hod_action')->nullable()->after('status_pekerjaan'); // 'execute_immediately', 'schedule'
            $table->date('scheduled_date')->nullable()->after('hod_action');

            // Employee assignment
            $table->json('assigned_employees')->nullable()->after('pic');
            $table->integer('personnel_count')->nullable()->after('assigned_employees');

            // Work completion
            $table->text('completion_results')->nullable()->after('keterangan');

            // Verification
            $table->unsignedBigInteger('verified_by')->nullable()->after('completion_results');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->text('verification_notes')->nullable()->after('verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $table->dropColumn([
                'priority_type',
                'urgent_sub_type',
                'location_type',
                'tenant_id',
                'tenant_name',
                'hod_action',
                'scheduled_date',
                'assigned_employees',
                'personnel_count',
                'completion_results',
                'verified_by',
                'verified_at',
                'verification_notes',
            ]);
        });
    }
};
