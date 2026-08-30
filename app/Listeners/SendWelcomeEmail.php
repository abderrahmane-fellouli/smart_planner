<?php

namespace App\Listeners;

use App\Mail\WelcomeMail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Sends the welcome/onboarding email only once, right after the user's email
 * address has been verified. This is the single appropriate moment: the user
 * has just completed a meaningful, expected step and won't receive a confusing
 * duplicate (i.e. it is NOT sent on registration).
 */
class SendWelcomeEmail
{
    public function handle(Verified $event): void
    {
        try {
            Mail::to($event->user)->send(new WelcomeMail($event->user));
        } catch (\Throwable $e) {
            Log::error('Welcome email failed to send: ' . $e->getMessage());
        }
    }
}
