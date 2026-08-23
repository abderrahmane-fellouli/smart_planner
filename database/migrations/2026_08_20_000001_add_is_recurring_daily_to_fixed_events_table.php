<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixed_events', function (Blueprint $table) {
            // When true, this fixed event applies to every weekday (Mon-Sat).
            // day_of_week is nullable when is_recurring_daily is true,
            // allowing a single DB row to represent a daily constraint.
            $table->boolean('is_recurring_daily')->default(false)->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('fixed_events', function (Blueprint $table) {
            $table->dropColumn('is_recurring_daily');
        });
    }
};
