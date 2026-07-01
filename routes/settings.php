<?php

use App\Http\Controllers\Settings\AppSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\WaGatewayController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/wa-gateway', [WaGatewayController::class, 'index'])->name('settings.wa-gateway');
    Route::post('settings/wa-gateway', [WaGatewayController::class, 'update'])->name('settings.wa-gateway.update');
    Route::post('settings/wa-gateway/connection-state', [WaGatewayController::class, 'connectionState'])->name('settings.wa-gateway.connection-state');
    Route::post('settings/wa-gateway/qr-code', [WaGatewayController::class, 'getQrCode'])->name('settings.wa-gateway.qr-code');
    Route::post('settings/wa-gateway/test', [WaGatewayController::class, 'testConnection'])->name('settings.wa-gateway.test');
    Route::post('settings/wa-gateway/restart', [WaGatewayController::class, 'restartInstance'])->name('settings.wa-gateway.restart');
    Route::post('settings/wa-gateway/logout', [WaGatewayController::class, 'logoutInstance'])->name('settings.wa-gateway.logout');

    Route::get('settings/general', [AppSettingsController::class, 'general'])->name('settings.general');
    Route::post('settings/general', [AppSettingsController::class, 'updateGeneral'])->name('settings.general.update');
});
