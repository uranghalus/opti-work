<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tb_work_order', 'assigned_at')) {
            Schema::table('tb_work_order', function (Blueprint $table): void {
                // Tanggal assign karyawan — dasar perhitungan deadline & eskalasi (FR-2.1).
                $table->datetime('assigned_at')->nullable()->after('scheduled_date');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tb_work_order', 'assigned_at')) {
            Schema::table('tb_work_order', function (Blueprint $table): void {
                $table->dropColumn('assigned_at');
            });
        }
    }
};
