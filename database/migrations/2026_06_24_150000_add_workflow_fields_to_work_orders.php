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
            if (! Schema::hasColumn('tb_work_order', 'priority_type')) {
                $table->string('priority_type')->default('normal')->after('prioritas'); // 'normal', 'urgent'
            }
            if (! Schema::hasColumn('tb_work_order', 'urgent_sub_type')) {
                $table->string('urgent_sub_type')->nullable()->after('priority_type'); // 'by_accident', 'by_owner'
            }

            // Location/Tenant selection
            if (! Schema::hasColumn('tb_work_order', 'location_type')) {
                $table->string('location_type')->default('location')->after('lokasi'); // 'location', 'tenant'
            }
            if (! Schema::hasColumn('tb_work_order', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('location_type');
            }
            if (! Schema::hasColumn('tb_work_order', 'tenant_name')) {
                $table->string('tenant_name')->nullable()->after('tenant_id');
            }

            // Status Pekerjaan
            if (! Schema::hasColumn('tb_work_order', 'status_pekerjaan')) {
                $table->string('status_pekerjaan')->default('pending_hod_review')->after('status_tiket');
            }

            // HOD workflow
            if (! Schema::hasColumn('tb_work_order', 'hod_action')) {
                $table->string('hod_action')->nullable()->after('status_pekerjaan'); // 'execute_immediately', 'schedule'
            }
            if (! Schema::hasColumn('tb_work_order', 'scheduled_date')) {
                $table->date('scheduled_date')->nullable()->after('hod_action');
            }

            // Employee assignment
            if (! Schema::hasColumn('tb_work_order', 'assigned_employees')) {
                $table->json('assigned_employees')->nullable()->after('pic');
            }
            if (! Schema::hasColumn('tb_work_order', 'personnel_count')) {
                $table->integer('personnel_count')->nullable()->after('assigned_employees');
            }

            // Work completion
            if (! Schema::hasColumn('tb_work_order', 'completion_results')) {
                if (Schema::hasColumn('tb_work_order', 'keterangan')) {
                    $table->text('completion_results')->nullable()->after('keterangan');
                } else {
                    $table->text('completion_results')->nullable()->after('pic');
                }
            }

            // Verification
            if (! Schema::hasColumn('tb_work_order', 'verified_by')) {
                $table->unsignedBigInteger('verified_by')->nullable()->after('completion_results');
            }
            if (! Schema::hasColumn('tb_work_order', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verified_by');
            }
            if (! Schema::hasColumn('tb_work_order', 'verification_notes')) {
                $table->text('verification_notes')->nullable()->after('verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $columns = [
                'status_pekerjaan',
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
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('tb_work_order', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
