<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class EmailChangedMail extends SmartPlannerMail
{
    public function __construct(
        public \App\Models\User $user,
        public string $oldEmail,
        public string $newEmail,
    ) {
        parent::__construct($user);
    }

    protected function subjectKey(): string
    {
        return 'email_changed_subject';
    }

    protected function viewName(): string
    {
        return 'emails.email-changed';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'oldEmail' => $this->oldEmail,
            'newEmail' => $this->newEmail,
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.email_changed_title'),
            __('email.email_changed_intro'),
            __('email.email_changed_old') . ': ' . $this->oldEmail,
            __('email.email_changed_new') . ': ' . $this->newEmail,
            __('email.email_changed_security'),
        ];
    }
}
