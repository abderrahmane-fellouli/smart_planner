{{-- Welcome email (sent after email verification). Expects: $appUrl, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.welcome_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.welcome_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 18px 0;color:#475569;">{{ __('email.welcome_intro') }}</p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px 0;">
            <tr>
                <td style="padding:10px 14px 10px 0;border-bottom:1px solid #eef2f7;color:#334155;">
                    <span style="font-weight:600;color:#4F46E5;">1.</span>&nbsp;{{ __('email.welcome_step1') }}
                </td>
            </tr>
            <tr>
                <td style="padding:10px 14px 10px 0;border-bottom:1px solid #eef2f7;color:#334155;">
                    <span style="font-weight:600;color:#4F46E5;">2.</span>&nbsp;{{ __('email.welcome_step2') }}
                </td>
            </tr>
            <tr>
                <td style="padding:10px 14px 10px 0;color:#334155;">
                    <span style="font-weight:600;color:#4F46E5;">3.</span>&nbsp;{{ __('email.welcome_step3') }}
                </td>
            </tr>
        </table>

        @include('emails.components.button', ['url' => $appUrl, 'label' => __('email.welcome_button'), 'direction' => $direction])
    </div>
@endcomponent
