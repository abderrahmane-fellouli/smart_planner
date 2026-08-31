<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            // \App\Http\Middleware\CorsMiddleware::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,

        ]);



})


        //

    ->withExceptions(function (Exceptions $exceptions) {
        // Invalid or expired email-verification links are redirected back to the
        // verification prompt with a gentle, localized error (instead of the raw
        // 403 screen) so the user can simply request a new link.
        $exceptions->render(function (\Illuminate\Routing\Exceptions\InvalidSignatureException $e, \Illuminate\Http\Request $request) {
            if ($request->user()) {
                return redirect()->route('verification.notice')->with('verification_error', true);
            }
            return redirect()->route('login')->with('status', 'verification_link_expired');
        });

        // Hash-mismatch on the verification URL (id/hash not matching this user).
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, \Illuminate\Http\Request $request) {
            if ($request->routeIs('verification.verify') && $request->user()) {
                return redirect()->route('verification.notice')->with('verification_error', true);
            }
        });

        // Registration is rate-limited server-side (throttle:10,1 on POST /register)
        // to prevent mass-account / email-abuse. Instead of a bare 429 screen, send
        // the visitor back to a friendly, localized notice on the register page.
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException $e, \Illuminate\Http\Request $request) {
            if ($request->routeIs('register.store')) {
                return redirect()->route('register')->with('throttled', true)
                    ->setStatusCode(429);
            }
        });
    })->create();
