{{-- Generic plain-text fallback.
    Expects: $displayName (escaped below - user input), $plainTextLines (array of trusted translated strings),
             $plainTextCta ([label, url]|null).
    Trusted translation strings are printed raw ({!! !!}) because the {{ }} escape turns apostrophes
    into HTML entities, which must not appear in a text/plain message. $displayName is user-controlled
    and therefore escaped. --}}
{{ $displayName }}

-----

{!! __('email.brand') !!} - {!! __('email.tagline') !!}

-----

@foreach ($plainTextLines as $line)
{!! $line !!}

@endforeach
@if ($plainTextCta)
{!! $plainTextCta[0] !!}: {{ $plainTextCta[1] }}

@endif
-----

{!! __('email.footer_regards') !!} — {!! __('email.brand') !!} - {!! __('email.tagline') !!}
