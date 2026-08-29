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
        Schema::table('tb_work_data', function (Blueprint $table) {
            // Kolom yang hilang di DB tapi ada di Model fillable
            if (! Schema::hasColumn('tb_work_data', 'id_department')) {
                $table->integer('id_department')->nullable()->after('no_kerja');
            }
            if (! Schema::hasColumn('tb_work_data', 'work_department')) {
                $table->string('work_department', 255)->nullable()->after('id_department');
            }
            if (! Schema::hasColumn('tb_work_data', 'create_id_user')) {
                $table->integer('create_id_user')->nullable()->after('modified_user');
            }
            if (! Schema::hasColumn('tb_work_data', 'modified_id_user')) {
                $table->integer('modified_id_user')->nullable()->after('create_id_user');
            }
            if (! Schema::hasColumn('tb_work_data', 'status_hapus')) {
                $table->boolean('status_hapus')->default(false)->after('modified_id_user');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_data', function (Blueprint $table) {
            $table->dropColumn(['id_department', 'work_department', 'create_id_user', 'modified_id_user', 'status_hapus']);
        });
    }
};
