<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * day_of_week was originally NOT NULL, but daily recurring events
     * (is_recurring_daily=true) don't belong to any specific day.
     * The controller stores null for them — MySQL strict mode would reject it.
     */
    public function up(): void
    {
        Schema::table('fixed_events', function (Blueprint $table): void {
            $table->string('day_of_week')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('fixed_events', function (Blueprint $table): void {
            $table->string('day_of_week')->nullable(false)->change();
        });
    }
};
