<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect(route('dashboard', absolute: false))
                    : Inertia::render('Auth/VerifyEmail', [
                        'status'                  => session('status'),
                        'verification_sent'       => session('verification_sent'),
                        'verification_error'      => session('verification_send_error') ?? session('verification_error'),
                        'verification_resend_error' => session('verification_resend_error'),
                    ]);
    }
}
