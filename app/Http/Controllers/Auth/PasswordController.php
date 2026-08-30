<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordChangedMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        if ($request->user()->locale && in_array($request->user()->locale, ['fr', 'en', 'ar'], true)) {
            app()->setLocale($request->user()->locale);
        }

        try {
            Mail::to($request->user())->send(new PasswordChangedMail($request->user()));
        } catch (\Throwable $e) {
            Log::error('Password changed notification email failed: ' . $e->getMessage());
        }

        return back()->with('success', trans('messages.password_updated'));
    }
}
