<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->hasRole('super_admin') || ! is_null($user->tenant_id)) {
            return $next($request);
        }

        abort(403, 'No tenant assigned. Contact administrator.');
    }
}
