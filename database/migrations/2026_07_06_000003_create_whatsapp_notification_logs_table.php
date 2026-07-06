<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('worker_id')->nullable();
            $table->unsignedBigInteger('hod_id')->nullable();
            $table->string('phone_number')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('PENDING');
            $table->json('response_payload')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_notification_logs');
    }
};
