<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\WahaController;
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

    Route::get('settings/waha', [WahaController::class, 'edit'])->name('waha.edit');
    Route::patch('settings/waha', [WahaController::class, 'update'])->name('waha.update');
    Route::post('settings/waha/pairing-code', [WahaController::class, 'requestPairingCode'])->name('waha.pairing-code');
    Route::post('settings/waha/logout', [WahaController::class, 'logout'])->name('waha.logout');
    Route::post('settings/waha/restart', [WahaController::class, 'restartSession'])->name('waha.restart');
    Route::post('settings/waha/test-webhook', [WahaController::class, 'testWebhook'])->name('waha.test-webhook');
    Route::post('settings/waha/send-test-message', [WahaController::class, 'sendTestMessage'])->name('waha.send-test-message');
});
