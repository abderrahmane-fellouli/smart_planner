<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sleep_day_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // 'wake' or 'bedtime'
            $table->string('day_of_week'); // French canonical: Lundi..Dimanche
            $table->time('time');
            $table->timestamps();

            $table->unique(['user_id', 'type', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sleep_day_times');
    }
};
