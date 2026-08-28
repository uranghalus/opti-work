<?php

namespace App\Services;

class TenantService
{
    protected static ?int $hardcodedTenantId = null;

    public static function getCurrentTenantId(): ?int
    {
        if (static::$hardcodedTenantId !== null) {
            return static::$hardcodedTenantId;
        }

        $user = auth()->user();

        return $user?->hasRole('super_admin') ? null : $user?->tenant_id;
    }

    public static function setHardcodedTenantId(?int $id): void
    {
        static::$hardcodedTenantId = $id;
    }

    public static function clearHardcodedTenantId(): void
    {
        static::$hardcodedTenantId = null;
    }
}
