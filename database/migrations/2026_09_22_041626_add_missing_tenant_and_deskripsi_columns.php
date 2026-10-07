<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Koreksi hasil audit migrasi vs PRD/ERD (FR-26 tenant isolation & FR-15 work data).
     * Kolom-kolom ini tertinggal karena tabel dibuat setelah migrasi pembanding jalan.
     */
    public function up(): void
    {
        Schema::table('tb_schedule_wd', function (Blueprint $table): void {
            if (! Schema::hasColumn('tb_schedule_wd', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('rescheduled_from');
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
                $table->index('tenant_id');
            }
        });

        Schema::table('tb_work_data_pekerja', function (Blueprint $table): void {
            if (! Schema::hasColumn('tb_work_data_pekerja', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('role_pekerja');
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
                $table->index('tenant_id');
            }
        });

        Schema::table('tb_work_data', function (Blueprint $table): void {
            if (! Schema::hasColumn('tb_work_data', 'deskripsi')) {
                $table->string('deskripsi')->nullable()->after('no_kerja');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tb_schedule_wd', function (Blueprint $table): void {
            if (Schema::hasColumn('tb_schedule_wd', 'tenant_id')) {
                $table->dropForeign(['tenant_id']);
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
            }
        });

        Schema::table('tb_work_data_pekerja', function (Blueprint $table): void {
            if (Schema::hasColumn('tb_work_data_pekerja', 'tenant_id')) {
                $table->dropForeign(['tenant_id']);
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
            }
        });

        Schema::table('tb_work_data', function (Blueprint $table): void {
            if (Schema::hasColumn('tb_work_data', 'deskripsi')) {
                $table->dropColumn('deskripsi');
            }
        });
    }
};
