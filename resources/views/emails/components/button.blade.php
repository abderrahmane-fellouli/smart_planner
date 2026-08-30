{{-- CTA action button. Props: $url, $label, $direction --}}
@if ($direction === 'rtl')
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 0 0;">
@else
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 0 auto;">
@endif
    <tr>
        <td style="mso-padding-alt:12px 0;">
            <a href="{{ $url }}" target="_blank"
               style="display:inline-block;background-color:#4F46E5;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-size:15px;font-weight:600;">{{ $label }}</a>
        </td>
    </tr>
</table>
