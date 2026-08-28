<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['users', 'tb_department', 'tb_division', 'tb_employee', 'tb_work_data', 'tb_work_data_pekerja', 'tb_schedule_wd', 'tb_extend_requests'] as $tableName) {
            if (! Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                $column = $table->unsignedBigInteger('tenant_id')->nullable();
                if ($tableName === 'users') {
                    $column->after('id');
                }
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['users', 'tb_department', 'tb_division', 'tb_employee', 'tb_work_data', 'tb_work_data_pekerja', 'tb_schedule_wd', 'tb_extend_requests'] as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'tenant_id')) {
                Schema::table($tableName, function (Blueprint $table): void {
                    $table->dropForeign(['tenant_id']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};
