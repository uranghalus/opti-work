<?php

namespace App\Models\Scopes;

use App\Services\TenantService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = TenantService::getCurrentTenantId();

        if ($tenantId !== null) {
            $builder->where($model->getQualifiedTenantColumn(), $tenantId);
        }
    }
}
