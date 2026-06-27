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
            if (! Schema::hasColumn('tb_work_order', 'keterangan')) {
                $table->text('keterangan')->nullable()->after('modified_user');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            if (Schema::hasColumn('tb_work_order', 'keterangan')) {
                $table->dropColumn('keterangan');
            }
        });
    }
};
