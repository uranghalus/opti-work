<?php

use App\Http\Controllers\MasterData\TenantController;
use App\Http\Controllers\OIDCController;
use App\Http\Controllers\WorkManagament\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Master Data - Tenants
    Route::resource('tenants', TenantController::class);

    // Work Management - Work Orders
    Route::get('work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index');
});

// Allow guests to start SSO
Route::get('auth/redirect', [OIDCController::class, 'redirect'])->name('authsso');
Route::get('auth/oidc/callback', [OIDCController::class, 'callback'])->name('ssocallback');

require __DIR__ . '/settings.php';
