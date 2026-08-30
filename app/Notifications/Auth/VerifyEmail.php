<?php

namespace App\Notifications\Auth;

use App\Mail\VerifyEmail as VerifyEmailMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class VerifyEmail extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): VerifyEmailMail
    {
        return (new VerifyEmailMail($notifiable))
            ->to($notifiable->email, $notifiable->display_name ?: $notifiable->name);
    }
}
