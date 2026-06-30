<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_department', function (Blueprint $table) {
            $table->string('hod_user_id', 36)->nullable()->after('nama_department');
            $table->string('manager_user_id', 36)->nullable()->after('hod_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('tb_department', function (Blueprint $table) {
            $table->dropColumn(['hod_user_id', 'manager_user_id']);
        });
    }
};
