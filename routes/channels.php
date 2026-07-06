<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('whatsapp.session.{session}', function (User $user, string $session) {
    return $user !== null;
});
