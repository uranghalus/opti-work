<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'is_encrypted'];

    protected function casts(): array
    {
        return [
            'is_encrypted' => 'boolean',
        ];
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        $value = $setting->is_encrypted
            ? decrypt($setting->value)
            : $setting->value;

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    public static function setValue(string $key, mixed $value, string $group = 'general', bool $encrypt = false): static
    {
        $storable = is_array($value) ? json_encode($value) : (string) $value;

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $encrypt ? encrypt($storable) : $storable,
                'group' => $group,
                'is_encrypted' => $encrypt,
            ]
        );
    }

    public static function getGroup(string $group): array
    {
        return static::where('group', $group)->get()->mapWithKeys(function ($setting) {
            $value = $setting->is_encrypted
                ? decrypt($setting->value)
                : $setting->value;

            $decoded = json_decode($value, true);

            return [
                $setting->key => json_last_error() === JSON_ERROR_NONE ? $decoded : $value,
            ];
        })->toArray();
    }
}
