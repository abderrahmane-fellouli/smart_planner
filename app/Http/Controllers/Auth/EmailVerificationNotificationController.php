<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $locale = $request->user()->locale;
        if (in_array($locale, ['fr', 'en', 'ar'], true)) {
            app()->setLocale($locale);
        }

        try {
            $request->user()->sendEmailVerificationNotification();

            return back()->with('success', trans('messages.verification_link_sent'));
        } catch (\Throwable $e) {
            Log::error('Verification email resend failed: ' . $e->getMessage());

            return back()->with('error', trans('messages.verification_send_failed'));
        }
    }
}
