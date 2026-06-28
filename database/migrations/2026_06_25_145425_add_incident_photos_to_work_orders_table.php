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
            if (! Schema::hasColumn('tb_work_order', 'incident_photos')) {
                if (Schema::hasColumn('tb_work_order', 'keterangan')) {
                    $table->json('incident_photos')->nullable()->after('keterangan');
                } else {
                    $table->json('incident_photos')->nullable()->after('pic');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            if (Schema::hasColumn('tb_work_order', 'incident_photos')) {
                $table->dropColumn('incident_photos');
            }
        });
    }
};
