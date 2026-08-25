<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add optional scheduling columns to todo_items.
     *
     * When a user chooses "Add to schedule" for a task, these columns
     * store the day, time, and duration. Tasks without scheduling
     * have these columns as NULL (pure todo items).
     *
     * Also renames the semantics of `priority` from 0-3 (Low/Med/High/Urgent)
     * to difficulty 1-5 (Very Easy → Very Difficult). The column type
     * (tinyInteger) remains the same; only the allowed range changes.
     */
    public function up(): void
    {
        Schema::table('todo_items', function (Blueprint $table) {
            $table->boolean('is_scheduled')->default(false)->after('priority');
            $table->string('scheduled_day', 20)->nullable()->after('is_scheduled');
            $table->string('scheduled_time', 5)->nullable()->after('scheduled_day');
            $table->integer('scheduled_duration')->nullable()->after('scheduled_time')->comment('Duration in minutes');
        });
    }

    public function down(): void
    {
        Schema::table('todo_items', function (Blueprint $table) {
            $table->dropColumn(['is_scheduled', 'scheduled_day', 'scheduled_time', 'scheduled_duration']);
        });
    }
};
