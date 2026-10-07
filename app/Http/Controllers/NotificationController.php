<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $notifications = $this->queryForUser($user)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unreadCount = $this->queryForUser($user)->unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(AppNotification $notification): JsonResponse
    {
        if (! $this->owns(Auth::user(), $notification)) {
            return response()->json(['status' => 'forbidden'], 403);
        }

        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->queryForUser(Auth::user())->unread()->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    }

    /**
     * Notifikasi milik user bisa bertipe User (role) atau Employee (field worker).
     *
     * @return Builder<AppNotification>
     */
    private function queryForUser(?User $user): Builder
    {
        if (! $user) {
            return AppNotification::query()->whereRaw('1 = 0');
        }

        $employeeId = $user->employee?->id_employee;

        return AppNotification::query()->where(function (Builder $query) use ($user, $employeeId): void {
            $query->where(function (Builder $q) use ($user): void {
                $q->where('notifiable_type', User::class)->where('notifiable_id', $user->id);
            });

            if ($employeeId) {
                $query->orWhere(function (Builder $q) use ($employeeId): void {
                    $q->where('notifiable_type', Employee::class)->where('notifiable_id', $employeeId);
                });
            }
        });
    }

    private function owns(?User $user, AppNotification $notification): bool
    {
        if (! $user) {
            return false;
        }

        if ($notification->notifiable_type === User::class) {
            return (int) $notification->notifiable_id === (int) $user->id;
        }

        if ($notification->notifiable_type === Employee::class) {
            return (string) $notification->notifiable_id === (string) $user->employee?->id_employee;
        }

        return false;
    }
}
