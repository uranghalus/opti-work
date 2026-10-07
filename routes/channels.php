<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('work-orders', function ($user) {
    return true;
});

// Channel notifikasi realtime di-scope ke user id (penerima bisa User berbasis
// role maupun Employee field worker yang dipetakan ke user lewat email).
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (string) $user->id === (string) $userId;
});
