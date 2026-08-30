<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;
use Illuminate\Support\Facades\URL;

class VerifyEmail extends SmartPlannerMail
{
    protected function subjectKey(): string
    {
        return 'verify_subject';
    }

    protected function viewName(): string
    {
        return 'emails.verify';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'verificationUrl' => $this->verificationUrl(),
            'expiresInMinutes' => (int) config('auth.verification.expire', 60),
        ]);
    }

    protected function verificationUrl(): string
    {
        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(config('auth.verification.expire', 60)),
            ['id' => $this->user->getKey(), 'hash' => sha1($this->user->getEmailForVerification())],
        );

        return $temporarySignedUrl;
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.verify_title'),
            __('email.verify_intro'),
            __('email.verify_expiry', ['minutes' => (int) config('auth.verification.expire', 60)]),
            __('email.verify_security'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.verify_button'), $this->verificationUrl()];
    }
}
