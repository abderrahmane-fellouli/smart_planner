{{--
    SmartPlanner branded email layout.

    A stable brand (independent of the user's in-app theme). Table-based,
    inline-styled, mobile-friendly and email-client safe. No JavaScript.

    Expected variables: $displayName, $direction, $mailTitle, $slot (content).
    The slot is rendered inside the card body.
--}}<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ $direction }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $subject ?? '' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f6;">
    <div style="background-color:#eef1f6;padding:24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef1f6;color:#334155;font-family:Arial,Helvetica,sans-serif;line-height:1.55;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" style="max-width:560px;width:560px;" cellspacing="0" cellpadding="0" border="0">
                        {{-- Header --}}
                        <tr>
                            <td align="{{ $direction === 'rtl' ? 'right' : 'left' }}" style="padding:0 0 16px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td valign="middle" style="padding-{{ $direction === 'rtl' ? 'left' : 'right' }}:10px;">
                                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{{ __('email.alt_logo') }}">
                                                <rect width="36" height="36" rx="9" fill="#4F46E5"/>
                                                <path d="M11 25V11h4.6l3.9 6 3.9-6H28v14h-3.4v-8.6L21 19.4v5.6h-3v-5.6l-3.6-3.2V25H11z" fill="#ffffff"/>
                                            </svg>
                                        </td>
                                        <td valign="middle">
                                            <span style="font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.02em;">{{ __('email.brand') }}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        {{-- Card --}}
                        <tr>
                            <td>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                                    <tr>
                                        <td style="padding:32px 32px 24px 32px;">
                                            {{ $slot }}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        {{-- Footer --}}
                        <tr>
                            <td align="{{ $direction === 'rtl' ? 'right' : 'left' }}" style="padding:16px 12px 0 12px;color:#94a3b8;font-size:12px;line-height:1.6;">
                                <div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:4px;">{{ __('email.brand') }}</div>
                                <div>{{ __('email.tagline') }}</div>
                                <div style="margin-top:6px;">{{ __('email.footer_help') }}</div>
                                <div style="margin-top:10px;border-top:1px solid #e2e8f0;padding-top:10px;">{{ __('email.footer_rights', ['year' => now()->year]) }}</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
