<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class ResetPassword extends SmartPlannerMail
{
    public function __construct(
        public \App\Models\User $user,
        public string $token,
    ) {
        parent::__construct($user);
    }

    protected function subjectKey(): string
    {
        return 'reset_subject';
    }

    protected function viewName(): string
    {
        return 'emails.reset-password';
    }

    protected function emailData(): array
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $this->user->getEmailForPasswordReset(),
        ], false));

        return array_merge(parent::emailData(), [
            'resetUrl' => $resetUrl,
            'expiresIn' => now()->addMinutes((int) config('auth.passwords.users.expire', 60)),
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.reset_title'),
            __('email.reset_intro'),
            __('email.reset_expiry', ['minutes' => (int) config('auth.passwords.users.expire', 60)]),
            __('email.reset_security'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.reset_button'), $this->emailData()['resetUrl']];
    }
}
