<?php

// ── Public legal pages (Privacy Policy + Terms of Service) ──

test('privacy page renders', function () {
    $this->get('/privacy')->assertStatus(200);
});

test('terms page renders', function () {
    $this->get('/terms')->assertStatus(200);
});

test('privacy and terms routes are public (no auth redirect)', function () {
    $this->get('/privacy')->assertStatus(200);
    $this->get('/terms')->assertStatus(200);
});

test('legal pages are reachable via named routes', function () {
    $this->get(route('privacy'))->assertStatus(200);
    $this->get(route('terms'))->assertStatus(200);
});

// Footer links are React/Inertia client-rendered, so they are verified in the
// browser harness rather than in raw server HTML. Here we only assert the
// public routes render for each supported locale.
test('legal pages render for each supported locale', function () {
    foreach (['fr', 'en', 'ar'] as $locale) {
        app()->setLocale($locale);
        $this->get('/privacy')->assertStatus(200);
        $this->get('/terms')->assertStatus(200);
    }
});
