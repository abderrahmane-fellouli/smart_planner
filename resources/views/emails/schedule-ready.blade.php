{{-- Schedule ready. Expects: $scheduleUrl, $displayName, $direction --}}
@component('emails.layout', ['subject' => __('email.schedule_ready_subject'), 'direction' => $direction, 'displayName' => $displayName])
    <div>
        <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;color:#111827;">{{ __('email.schedule_ready_title') }}</h1>
        <p style="margin:0 0 4px 0;color:#334155;">{{ __('email.greeting', ['name' => $displayName]) }}</p>
        <p style="margin:0 0 20px 0;color:#475569;">{{ __('email.schedule_ready_intro') }}</p>

        @include('emails.components.button', ['url' => $scheduleUrl, 'label' => __('email.schedule_ready_button'), 'direction' => $direction])
    </div>
@endcomponent
