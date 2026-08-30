<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store the interactive onboarding tutorial state for each user.
     *
     * Kept as a single nullable JSON column on the existing per-user
     * preferences record — no new table for one simple flag.
     *
     * Expected keys:
     *   version    int   tutorial revision (currently 1)
     *   started    bool  the guide has been started
     *   completed  bool  the guide was finished
     *   skipped    bool  the guide was explicitly skipped
     *   step       int   last reached step (simple resume helper)
     */
    public function up(): void
    {
        Schema::table('preferences', function (Blueprint $table) {
            $table->json('tutorial')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('preferences', function (Blueprint $table) {
            $table->dropColumn('tutorial');
        });
    }
};
