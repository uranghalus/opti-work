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
            $table->string('status_pekerjaan')->default('pending_hod_review')->after('status_tiket');
            $table->string('hod_action')->nullable()->after('status_pekerjaan');
            $table->date('scheduled_date')->nullable()->after('hod_action');
            $table->json('assigned_employees')->nullable()->after('scheduled_date');
            $table->integer('personnel_count')->nullable()->after('assigned_employees');
            $table->text('completion_results')->nullable()->after('keterangan');
            $table->integer('verified_by')->nullable()->after('completion_results');
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
                'status_pekerjaan',
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
