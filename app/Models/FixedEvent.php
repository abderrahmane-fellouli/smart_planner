<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FixedEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'teacher', 'description', 'category', 'is_recurring_daily', 'day_of_week', 'start_time', 'end_time', 'location'
    ];

    protected $casts = [
        'is_recurring_daily' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}