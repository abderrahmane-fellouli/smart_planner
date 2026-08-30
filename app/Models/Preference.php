<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'wake_up_time', 'sleep_time', 'study_preference',
        'concentration_hours', 'desired_free_time', 'priorities', 'theme',
        'tutorial'
    ];

    protected $casts = [
        'tutorial' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}