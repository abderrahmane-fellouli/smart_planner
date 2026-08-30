{{-- Password reset. Expects: $resetUrl, $expiresIn, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.reset_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.reset_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 20px 0;color:#475569;">{{ __('email.reset_intro') }}</p>

        @include('emails.components.button', ['url' => $resetUrl, 'label' => __('email.reset_button'), 'direction' => $direction])

        <p style="margin:22px 0 0 0;font-size:13px;color:#94a3b8;" dir="{{ $direction }}">
            {{ __('email.reset_expiry', ['minutes' => (int) config('auth.passwords.users.expire', 60)]) }}
        </p>
        <p style="margin:14px 0 0 0;font-size:13px;color:#64748b;" dir="{{ $direction }}">
            {{ __('email.reset_action') }}<br>
            <a href="{{ $resetUrl }}" style="color:#4F46E5;word-break:break-all;">{{ $resetUrl }}</a>
        </p>

        <div style="margin-top:22px;padding:14px 16px;background-color:#f8fafc;border-left:{{ $direction === 'rtl' ? '0' : '4px' }} solid #4F46E5;border-right:{{ $direction === 'rtl' ? '4px' : '0' }} solid #4F46E5;border-radius:8px;font-size:13px;color:#475569;" dir="{{ $direction }}">
            <strong>{{ __('email.reset_security') }}</strong>
        </div>
    </div>
@endcomponent
