<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('work-orders', function ($user) {
    return true;
});

Broadcast::channel('notifications.{employeeId}', function ($user, $employeeId) {
    return (string) ($user->employee->id_employee ?? '') === (string) $employeeId;
});
