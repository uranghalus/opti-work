<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $table->date('deadline_date')->nullable()->after('scheduled_date');
            $table->datetime('escalation_h3_sent_at')->nullable()->after('deadline_date');
            $table->datetime('escalation_h5_sent_at')->nullable()->after('escalation_h3_sent_at');
            $table->datetime('escalation_h6_sent_at')->nullable()->after('escalation_h5_sent_at');
            $table->boolean('is_escalated')->default(false)->after('escalation_h6_sent_at');
            $table->integer('extend_count')->default(0)->after('is_escalated');
            $table->text('extend_reason')->nullable()->after('extend_count');
            $table->datetime('extended_at')->nullable()->after('extend_reason');
        });
    }

    public function down(): void
    {
        Schema::table('tb_work_order', function (Blueprint $table) {
            $table->dropColumn([
                'deadline_date',
                'escalation_h3_sent_at',
                'escalation_h5_sent_at',
                'escalation_h6_sent_at',
                'is_escalated',
                'extend_count',
                'extend_reason',
                'extended_at',
            ]);
        });
    }
};
