<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Accept either legacy "name" or new structured fields.
        // We use sometimes rules so both formats are valid.
        $base = [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'photo' => ['nullable', 'image', 'max:2048'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'third_name' => ['nullable', 'string', 'max:255'],
            'pseudonym' => ['nullable', 'string', 'max:255'],
        ];

        // If legacy "name" is sent, validate it; otherwise require structured fields.
        if ($this->input('name') !== null) {
            $base['name'] = ['required', 'string', 'max:255'];
        }

        return $base;
    }
}
