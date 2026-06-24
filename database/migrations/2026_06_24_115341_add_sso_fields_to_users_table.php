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
        Schema::table('users', function (Blueprint $table) {
            //
            // Mengubah kolom password bawaan menjadi nullable untuk user SSO
            $table->string('password')->nullable()->change();

            // Menambahkan kolom-kolom baru
            $table->string('phone')->nullable()->after('password');
            $table->string('department')->nullable()->after('phone');
            $table->string('position')->nullable()->after('department');
            $table->timestamp('last_login_at')->nullable()->after('position');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->string('password')->nullable(false)->change();

            // Menghapus kolom jika di-rollback
            $table->dropColumn([
                'phone',
                'department',
                'position',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
