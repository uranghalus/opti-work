<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_work_planning', function (Blueprint $table): void {
            $table->unsignedBigInteger('lama_pekerjaan_hari')->nullable()->after('jenis_pekerjaan');
            $table->decimal('budget', 15, 2)->nullable()->after('lama_pekerjaan_hari');
            $table->unsignedInteger('extend_count')->default(0)->after('budget');
            $table->date('original_tgl_jadwal')->nullable()->after('extend_count');
            $table->text('extend_reason')->nullable()->after('original_tgl_jadwal');
            $table->unsignedBigInteger('extend_requested_by')->nullable()->after('extend_reason');
            $table->unsignedBigInteger('extend_approved_by')->nullable()->after('extend_requested_by');
            $table->timestamp('extend_approved_at')->nullable()->after('extend_approved_by');
            $table->text('extend_approval_notes')->nullable()->after('extend_approved_at');
            $table->string('status_jadwal', 20)->default('planned')->change();
            $table->softDeletes()->after('timestamps');
            $table->unsignedBigInteger('tenant_id')->nullable()->after('catatan');
            $table->unsignedBigInteger('create_id_user')->nullable()->after('tenant_id');
            $table->unsignedBigInteger('modified_id_user')->nullable()->after('create_id_user');

            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->foreign('extend_requested_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('extend_approved_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['status_jadwal', 'tgl_jadwal']);
        });
    }

    public function down(): void
    {
        Schema::table('tb_work_planning', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['extend_requested_by']);
            $table->dropForeign(['extend_approved_by']);
            $table->dropIndex(['status_jadwal', 'tgl_jadwal']);
            $table->dropSoftDeletes();
            $table->dropColumn([
                'lama_pekerjaan_hari',
                'budget',
                'extend_count',
                'original_tgl_jadwal',
                'extend_reason',
                'extend_requested_by',
                'extend_approved_by',
                'extend_approved_at',
                'extend_approval_notes',
                'tenant_id',
                'create_id_user',
                'modified_id_user',
            ]);
        });
    }
};
