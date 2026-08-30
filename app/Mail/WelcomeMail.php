<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class WelcomeMail extends SmartPlannerMail
{
    protected function subjectKey(): string
    {
        return 'welcome_subject';
    }

    protected function viewName(): string
    {
        return 'emails.welcome';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'appUrl' => url('/'),
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.welcome_title'),
            __('email.welcome_intro'),
            '1. ' . __('email.welcome_step1'),
            '2. ' . __('email.welcome_step2'),
            '3. ' . __('email.welcome_step3'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.welcome_button'), $this->emailData()['appUrl']];
    }
}
