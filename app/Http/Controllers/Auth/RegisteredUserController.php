<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Accept both new structured fields and legacy "name" for backward compatibility.
        // Tests and API clients may still send the legacy "name" field.
        $hasStructured = $request->has('first_name') || $request->has('last_name');

        if ($hasStructured) {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'third_name' => 'nullable|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            $name = trim(implode(' ', array_filter([
                $validated['first_name'],
                $validated['third_name'] ?? null,
                $validated['last_name'],
            ])));
            $firstName = $validated['first_name'];
            $lastName = $validated['last_name'];
            $thirdName = $validated['third_name'] ?? null;
        } else {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            $name = $validated['name'];
            $parts = explode(' ', $name);
            $firstName = $parts[0] ?? $name;
            $lastName = count($parts) > 1 ? end($parts) : '';
            $thirdName = count($parts) > 2 ? implode(' ', array_slice($parts, 1, -1)) : null;
        }

        $user = User::create([
            'name' => $name,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'third_name' => $thirdName,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'locale' => in_array($request->input('lang', 'fr'), ['fr', 'en', 'ar'], true)
                        ? $request->input('lang', 'fr')
                        : 'fr',
        ]);

        Auth::login($user);

        // Send the email verification notification. If SMTP delivery fails we do
        // NOT crash the whole registration: the account is created and the user is
        // logged in, they simply see a gentle notice and can re-request the link.
        try {
            $user->sendEmailVerificationNotification();
            session()->flash('verification_sent', true);
        } catch (\Throwable $e) {
            Log::error('Verification email failed to send on registration: ' . $e->getMessage());
            session()->flash('verification_send_error', true);
        }

        return redirect(route('verification.notice', absolute: false));
    }
}
