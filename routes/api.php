<?php

use App\Http\Controllers\WaWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/wa-webhook', [WaWebhookController::class, 'handle']);
