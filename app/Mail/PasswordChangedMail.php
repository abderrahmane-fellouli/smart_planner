<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class PasswordChangedMail extends SmartPlannerMail
{
    protected function subjectKey(): string
    {
        return 'password_changed_subject';
    }

    protected function viewName(): string
    {
        return 'emails.password-changed';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'dashboardUrl' => url(route('dashboard', absolute: false)),
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.password_changed_title'),
            __('email.password_changed_intro'),
            __('email.password_changed_security'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.welcome_button'), $this->emailData()['dashboardUrl']];
    }
}
