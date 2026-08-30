{{-- Account email changed. Expects: $oldEmail, $newEmail, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.email_changed_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.email_changed_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 18px 0;color:#475569;">{{ __('email.email_changed_intro') }}</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;background:#f8fafc;border-radius:8px;border:1px solid #eef2f7;">
            <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">{{ __('email.email_changed_old') }}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#111827;font-weight:600;">{{ $oldEmail }}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#64748b;font-size:13px;">{{ __('email.email_changed_new') }}</td>
                <td style="padding:12px 16px;color:#4F46E5;font-weight:600;">{{ $newEmail }}</td>
            </tr>
        </table>

        <div style="padding:14px 16px;background-color:#fef2f2;border-left:{{ $direction === 'rtl' ? '0' : '4px' }} solid #dc2626;border-right:{{ $direction === 'rtl' ? '4px' : '0' }} solid #dc2626;border-radius:8px;font-size:13px;color:#991b1b;" dir="{{ $direction }}">
            <strong>{{ __('email.email_changed_security') }}</strong>
        </div>
    </div>
@endcomponent
