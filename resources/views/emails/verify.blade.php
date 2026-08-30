{{-- Email verification. Expects: $verificationUrl, $expiresIn, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.verify_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.verify_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 20px 0;color:#475569;">{{ __('email.verify_intro') }}</p>

        @include('emails.components.button', ['url' => $verificationUrl, 'label' => __('email.verify_button'), 'direction' => $direction])

        <p style="margin:22px 0 0 0;font-size:13px;color:#94a3b8;" dir="{{ $direction }}">
            {{ __('email.verify_expiry', ['minutes' => $expiresInMinutes]) }}
        </p>
        <p style="margin:14px 0 0 0;font-size:13px;color:#64748b;" dir="{{ $direction }}">
            {{ __('email.verify_action') }}<br>
            <a href="{{ $verificationUrl }}" style="color:#4F46E5;word-break:break-all;">{{ $verificationUrl }}</a>
        </p>

        <div style="margin-top:22px;padding:14px 16px;background-color:#f8fafc;border-left:{{ $direction === 'rtl' ? '0' : '4px' }} solid #4F46E5;border-right:{{ $direction === 'rtl' ? '4px' : '0' }} solid #4F46E5;border-radius:8px;font-size:13px;color:#475569;" dir="{{ $direction }}">
            <strong>{{ __('email.verify_security') }}</strong>
        </div>

        <p style="margin:14px 0 0 0;font-size:13px;color:#94a3b8;" dir="{{ $direction }}">{{ __('email.verify_resend_help') }}</p>
    </div>
@endcomponent
