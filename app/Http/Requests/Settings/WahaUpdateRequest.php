<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WahaUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'waha_session' => ['required', 'string', 'max:255'],
            'waha_url' => ['required', 'url', 'max:255'],
            'waha_api_key' => ['nullable', 'string', 'max:255'],
        ];
    }
}
