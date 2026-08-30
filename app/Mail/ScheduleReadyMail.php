<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Content;

class ScheduleReadyMail extends SmartPlannerMail
{
    protected function subjectKey(): string
    {
        return 'schedule_ready_subject';
    }

    protected function viewName(): string
    {
        return 'emails.schedule-ready';
    }

    protected function emailData(): array
    {
        return array_merge(parent::emailData(), [
            'scheduleUrl' => url(route('schedules.index', absolute: false)),
        ]);
    }

    protected function plainTextLines(): array
    {
        return [
            __('email.schedule_ready_title'),
            __('email.schedule_ready_intro'),
        ];
    }

    protected function plainTextCta(): ?array
    {
        return [__('email.schedule_ready_button'), $this->emailData()['scheduleUrl']];
    }
}
