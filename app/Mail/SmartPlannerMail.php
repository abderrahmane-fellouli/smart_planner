<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Base branded SmartPlanner email.
 *
 * Emails are delivered independently of the authenticated browser session, so
 * they use a stable SmartPlanner brand (not the user's current app theme).
 *
 * Each concrete email resolves the recipient's stored locale (FR/EN/AR) so the
 * same template renders in the correct language and text direction (RTL for AR).
 */
abstract class SmartPlannerMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
        //
    }

    abstract protected function subjectKey(): string;

    abstract protected function viewName(): string;

    public function envelope(): Envelope
    {
        $this->resolveLocale();

        return new Envelope(
            subject: __("email." . $this->subjectKey()),
        );
    }

    public function content(): Content
    {
        $this->resolveLocale();

        // NOTE: this Laravel version's Content passes a single "with" array to
        // both the HTML view and the plain-text view, so the plain-text fields
        // are merged here to be consumed by the fallback template.
        return new Content(
            view: $this->viewName(),
            with: $this->mailData(),
            text: 'emails.plain-text',
        );
    }

    /**
     * Data shared between the HTML view and the plain-text fallback.
     */
    private function mailData(): array
    {
        $this->resolveLocale();

        $data = $this->emailData();

        $data['plainTextLines'] = $this->plainTextLines();
        $data['plainTextCta']   = $this->plainTextCta();

        return $data;
    }

    /**
     * Resolve the user's stored locale so the email renders in their language.
     */
    protected function resolveLocale(): void
    {
        $locale = 'fr';
        if ($this->user->locale && in_array($this->user->locale, ['fr', 'en', 'ar'], true)) {
            $locale = $this->user->locale;
        }
        app()->setLocale($locale);
    }

    protected function direction(): string
    {
        $this->resolveLocale();
        return app()->getLocale() === 'ar' ? 'rtl' : 'ltr';
    }

    /**
     * Data shared by every email view (brand + layout).
     */
    protected function emailData(): array
    {
        return [
            'user'        => $this->user,
            'direction'   => $this->direction(),
            'displayName' => $this->user->display_name ?: $this->user->name,
        ];
    }

    /**
     * Plain-text paragraphs rendered in the fallback view. Subclasses override.
     */
    protected function plainTextLines(): array
    {
        return [];
    }

    /**
     * Optional CTA appended at the end of the plain-text fallback: [label, url].
     */
    protected function plainTextCta(): ?array
    {
        return null;
    }
}
