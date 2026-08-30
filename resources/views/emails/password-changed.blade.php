{{-- Password changed confirmation. Expects: $dashboardUrl, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.password_changed_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.password_changed_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 20px 0;color:#475569;">{{ __('email.password_changed_intro') }}</p>

        @include('emails.components.button', ['url' => $dashboardUrl, 'label' => __('email.welcome_button'), 'direction' => $direction])

        <div style="margin-top:22px;padding:14px 16px;background-color:#fef2f2;border-left:{{ $direction === 'rtl' ? '0' : '4px' }} solid #dc2626;border-right:{{ $direction === 'rtl' ? '4px' : '0' }} solid #dc2626;border-radius:8px;font-size:13px;color:#991b1b;" dir="{{ $direction }}">
            <strong>{{ __('email.password_changed_security') }}</strong>
        </div>
    </div>
@endcomponent
