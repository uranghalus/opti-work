<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_work_daily', function (Blueprint $table): void {
            // FR-22: Status pekerjaan harian, prioritas, dan level
            $table->string('status_pekerjaan', 30)->default('open')->after('progres_persentase');
            $table->string('prioritas', 20)->default('medium')->after('status_pekerjaan');
            $table->string('level', 20)->default('normal')->after('prioritas');

            // FR-21: Assignment oleh HOD (karyawan pelaksana via tb_employee UUID)
            $table->uuid('id_employee')->nullable()->after('id_work_data');
            $table->unsignedBigInteger('assigned_by')->nullable()->after('id_employee');
            $table->timestamp('assigned_at')->nullable()->after('assigned_by');

            $table->foreign('id_employee')->references('id_employee')->on('tb_employee')->nullOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();

            // Isolasi multi-tenant (FR-26)
            $table->unsignedBigInteger('tenant_id')->nullable()->after('assigned_at');
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();

            $table->index(['id_employee', 'tanggal_kerja']);
            $table->index('status_pekerjaan');
        });
    }

    public function down(): void
    {
        Schema::table('tb_work_daily', function (Blueprint $table): void {
            $table->dropForeign(['id_employee']);
            $table->dropForeign(['assigned_by']);
            $table->dropForeign(['tenant_id']);
            $table->dropIndex(['id_employee', 'tanggal_kerja']);
            $table->dropIndex(['status_pekerjaan']);
            $table->dropColumn(['status_pekerjaan', 'prioritas', 'level', 'id_employee', 'assigned_by', 'assigned_at', 'tenant_id']);
        });
    }
};
