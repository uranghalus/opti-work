<?php

use App\Http\Controllers\WhatsAppWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// WAHA WhatsApp webhook — no auth (WAHA server calls this)
Route::match(['get', 'post'], '/whatsapp/webhook', [WhatsAppWebhookController::class, 'handle'])
    ->withoutMiddleware(['throttle:api']);

// Health check for WAHA webhook
Route::get('/whatsapp/webhook/ping', function () {
    return response()->json(['status' => 'ok', 'message' => 'WAHA webhook endpoint is reachable']);
});
