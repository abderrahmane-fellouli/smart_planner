<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixed_events', function (Blueprint $table): void {
            $table->string('teacher')->nullable()->after('title');
            $table->text('description')->nullable()->after('teacher');
        });
    }

    public function down(): void
    {
        Schema::table('fixed_events', function (Blueprint $table): void {
            $table->dropColumn(['teacher', 'description']);
        });
    }
};
