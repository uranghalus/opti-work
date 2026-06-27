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
            if (! Schema::hasColumn('tb_work_order', 'status_pekerjaan')) {
                $table->string('status_pekerjaan')->default('pending_hod_review')->after('status_tiket');
            }
            if (! Schema::hasColumn('tb_work_order', 'hod_action')) {
                $table->string('hod_action')->nullable()->after('status_pekerjaan');
            }
            if (! Schema::hasColumn('tb_work_order', 'scheduled_date')) {
                $table->date('scheduled_date')->nullable()->after('hod_action');
            }
            if (! Schema::hasColumn('tb_work_order', 'assigned_employees')) {
                $table->json('assigned_employees')->nullable()->after('scheduled_date');
            }
            if (! Schema::hasColumn('tb_work_order', 'personnel_count')) {
                $table->integer('personnel_count')->nullable()->after('assigned_employees');
            }
            if (! Schema::hasColumn('tb_work_order', 'completion_results')) {
                $table->text('completion_results')->nullable()->after('keterangan');
            }
            if (! Schema::hasColumn('tb_work_order', 'verified_by')) {
                $table->integer('verified_by')->nullable()->after('completion_results');
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
