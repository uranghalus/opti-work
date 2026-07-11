<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $employee = $user->employee ?? null;

        if (! $employee) {
            return response()->json(['notifications' => [], 'unread_count' => 0]);
        }

        $notifications = AppNotification::where('notifiable_type', 'App\Models\Employee')
            ->where('notifiable_id', $employee->id_employee)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unreadCount = AppNotification::where('notifiable_type', 'App\Models\Employee')
            ->where('notifiable_id', $employee->id_employee)
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(AppNotification $notification): JsonResponse
    {
        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $employee = $user->employee ?? null;

        if ($employee) {
            AppNotification::where('notifiable_type', 'App\Models\Employee')
                ->where('notifiable_id', $employee->id_employee)
                ->unread()
                ->update(['read_at' => now()]);
        }

        return response()->json(['status' => 'ok']);
    }
}
