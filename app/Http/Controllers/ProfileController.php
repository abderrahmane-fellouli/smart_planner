<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Mail\EmailChangedMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                \Storage::disk('public')->delete($user->profile_photo_path);
            }
            $validated['profile_photo_path'] = $request->file('photo')->store('profile-photos', 'public');
        }

        unset($validated['photo']);

        // Support both new structured fields and legacy "name" field.
        if (!empty($validated['first_name']) || !empty($validated['last_name'])) {
            $validated['name'] = trim(implode(' ', array_filter([
                $validated['first_name'] ?? null,
                $validated['third_name'] ?? null,
                $validated['last_name'] ?? null,
            ]))) ?: $user->name;
        }
        // If only "name" was sent (legacy), use it directly.

        $user->fill($validated);

        $emailChanged = false;
        if ($user->isDirty('email')) {
            $oldEmail = $user->getOriginal('email');
            $newEmail = $user->email;
            $user->email_verified_at = null;
            $emailChanged = true;
        }

        $user->save();

        // Resolve the UI language for the flash message from the user's stored
        // locale so the success banner appears in the user's language.
        if ($user->locale && in_array($user->locale, ['fr', 'en', 'ar'], true)) {
            app()->setLocale($user->locale);
        }

        if ($emailChanged) {
            try {
                Mail::to($user)->send(new EmailChangedMail($user, $oldEmail, $newEmail));
            } catch (\Throwable $e) {
                Log::error('Email change notification failed: ' . $e->getMessage());
            }

            return Redirect::route('profile.edit')
                ->with('success', trans('messages.email_changed_verify'));
        }

        return Redirect::route('profile.edit')
            ->with('success', trans('messages.profile_updated'));
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Remove the user's profile photo.
     */
    public function destroyPhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->profile_photo_path && \Storage::disk('public')->exists($user->profile_photo_path)) {
            \Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->update(['profile_photo_path' => null]);

        if ($user->locale && in_array($user->locale, ['fr', 'en', 'ar'], true)) {
            app()->setLocale($user->locale);
        }

        return Redirect::route('profile.edit')->with('success', trans('messages.photo_removed'));
    }
}
