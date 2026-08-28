<?php

namespace App\Models\Traits;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait TenantAware
{
    public static function bootTenantAware(): void
    {
        static::addGlobalScope(new TenantScope);
        static::creating(function (Model $model): void {
            if (is_null($model->tenant_id)) {
                $model->tenant_id = TenantService::getCurrentTenantId();
            }
        });
    }

    public function getQualifiedTenantColumn(): string
    {
        return $this->qualifyColumn('tenant_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeWithoutTenant(Builder $query): Builder
    {
        return $query->withoutGlobalScope(TenantScope::class);
    }
}
