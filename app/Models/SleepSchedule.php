<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SleepSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wake_mode',
        'bedtime_mode',
        'wake_same_time',
        'bedtime_same_time',
        'wake_except_days',
        'bedtime_except_days',
    ];

    protected $casts = [
        'wake_except_days' => 'array',
        'bedtime_except_days' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dayTimes(): HasMany
    {
        return $this->hasMany(SleepDayTime::class, 'user_id', 'user_id');
    }

    /**
     * Resolve the effective wake-up time for a given French day name.
     * Handles all three modes: same, different, except.
     */
    public function getWakeTimeForDay(string $day): string
    {
        return match ($this->wake_mode) {
            'same' => $this->wake_same_time,
            'different' => $this->dayTimes()
                ->where('type', 'wake')
                ->where('day_of_week', $day)
                ->value('time') ?? $this->wake_same_time,
            'except' => in_array($day, $this->wake_except_days ?? [])
                ? ($this->dayTimes()->where('type', 'wake')->where('day_of_week', $day)->value('time') ?? $this->wake_same_time)
                : $this->wake_same_time,
        };
    }

    /**
     * Resolve the effective bedtime for a given French day name.
     * Handles all three modes: same, different, except.
     */
    public function getBedtimeForDay(string $day): string
    {
        return match ($this->bedtime_mode) {
            'same' => $this->bedtime_same_time,
            'different' => $this->dayTimes()
                ->where('type', 'bedtime')
                ->where('day_of_week', $day)
                ->value('time') ?? $this->bedtime_same_time,
            'except' => in_array($day, $this->bedtime_except_days ?? [])
                ? ($this->dayTimes()->where('type', 'bedtime')->where('day_of_week', $day)->value('time') ?? $this->bedtime_same_time)
                : $this->bedtime_same_time,
        };
    }
}
