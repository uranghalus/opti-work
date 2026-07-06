<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWhatsappConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'base_url' => ['required', 'url'],
            'api_key' => ['nullable', 'string'],
            'default_session' => ['nullable', 'string', 'max:255'],
            'webhook_url' => ['nullable', 'url'],
            'webhook_secret' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
