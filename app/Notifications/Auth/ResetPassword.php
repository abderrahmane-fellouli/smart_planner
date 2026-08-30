<?php

namespace App\Notifications\Auth;

use App\Mail\ResetPassword as ResetPasswordMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResetPassword extends Notification
{
    use Queueable;

    public function __construct(public string $token)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): ResetPasswordMail
    {
        return (new ResetPasswordMail($notifiable, $this->token))
            ->to($notifiable->email, $notifiable->display_name ?: $notifiable->name);
    }
}
