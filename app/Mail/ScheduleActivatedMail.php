<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class ScheduleActivatedMail extends SmartPlannerMail
{
    public function __construct(
        \App\Models\User $user,
        public string $scheduleType,
    ) {
        parent::__construct($user);
    }

    protected function subjectKey(): string
    {
        return 'schedule_activated_subject';
    }

    protected function viewName(): string
    {
        return 'emails.schedule-activated';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'scheduleType' => $this->scheduleType,
            'dashboardUrl' => url(route('dashboard', absolute: false)),
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.schedule_activated_title'),
            __('email.schedule_activated_intro'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.schedule_activated_button'), $this->emailData()['dashboardUrl']];
    }
}
