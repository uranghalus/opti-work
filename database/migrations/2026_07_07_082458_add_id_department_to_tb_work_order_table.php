<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $table->uuid('id_department')->nullable()->after('no_work_order');
            $table->foreign('id_department')
                ->references('id_department')
                ->on('tb_department')
                ->onDelete('set null');
        });

        // Migrate existing string data to UUID
        DB::statement('UPDATE tb_work_order SET id_department = (SELECT id_department FROM tb_department WHERE tb_department.nama_department = tb_work_order.department_tujuan LIMIT 1) WHERE id_department IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $table->dropForeign(['id_department']);
            $table->dropColumn('id_department');
        });
    }
};
