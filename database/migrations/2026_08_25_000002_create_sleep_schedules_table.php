<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sleep_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->string('wake_mode')->default('same');
            $table->string('bedtime_mode')->default('same');
            $table->time('wake_same_time')->default('07:00:00');
            $table->time('bedtime_same_time')->default('22:00:00');
            $table->json('wake_except_days')->nullable();
            $table->json('bedtime_except_days')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sleep_schedules');
    }
};
