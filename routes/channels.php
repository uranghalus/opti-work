<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('work-orders', function ($user) {
    // All authenticated users can listen to work order updates
    return true;
});
