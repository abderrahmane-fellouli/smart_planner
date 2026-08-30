<?php

// ── SEO: sitemap + page metadata ──

test('sitemap returns XML with only public pages', function () {
    $response = $this->get('/sitemap.xml');
    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/xml');

    $xml = $response->getContent();
    $this->assertStringContainsString('<urlset', $xml);

    // Public paths present (home, auth, legal).
    foreach (['/login', '/register', '/forgot-password', '/privacy', '/terms'] as $path) {
        $this->assertStringContainsString('<loc>' . url($path), $xml);
    }

    // Authenticated/private routes are NOT exposed to crawlers.
    foreach (['/dashboard', '/schedules', '/todos', '/sleep-schedule', '/preferences',
              '/statistics', '/export', '/calendar', '/fixed-events', '/profile', '/search'] as $path) {
        $this->assertStringNotContainsString('<loc>' . url($path), $xml);
    }
});

test('sitemap canonical URLs derive from APP_URL not a hardcoded localhost', function () {
    // url() is built from APP_URL (config), the value used in production too.
    $home = url('/');
    $this->assertStringContainsString('<loc>' . $home, $this->get('/sitemap.xml')->getContent());
});

test('root page serves server-side meta description, canonical and social tags', function () {
    $html = $this->get('/')->assertStatus(200)->getContent();

    $this->assertMatchesRegularExpression('/<meta name="description" content="[^"]+"/', $html);
    $this->assertMatchesRegularExpression('/<link rel="canonical" href="[^"]+"/', $html);
    $this->assertMatchesRegularExpression('/<meta property="og:title"/', $html);
    $this->assertMatchesRegularExpression('/<meta property="og:type" content="website"/', $html);
    $this->assertMatchesRegularExpression('/<meta name="twitter:card" content="summary"/', $html);
    $this->assertMatchesRegularExpression('/<meta name="theme-color"/', $html);
});
