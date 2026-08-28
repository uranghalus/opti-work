<?php

namespace App\Http\Controllers\WorkManagament;

use App\Enums\ExtendRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Employee;
use App\Models\ExtendRequest;
use App\Models\User;
use App\Models\WorkOrder;
use App\Notifications\WorkOrderNotification;
use App\Services\BusinessDayCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ExtendRequestController extends Controller
{
    /**
     * Show extend request form for a work order.
     */
    public function create(WorkOrder $workOrder): Response
    {
        $this->authorizeExtend($workOrder);

        return Inertia::render('WorkOrder/ExtendRequest', [
            'workOrder' => $workOrder,
        ]);
    }

    /**
     * Store a new extend request.
     */
    public function store(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $this->authorizeExtend($workOrder);

        $validated = $request->validate([
            'extend_days' => 'required|integer|min:1|max:3',
            'extend_reason' => 'required|string',
        ]);

        $hasTeamLeader = $this->departmentHasTeamLeader($workOrder);
        $status = $hasTeamLeader ? 'pending_tl_approval' : 'pending_hod_approval';

        $extendRequest = ExtendRequest::create([
            'id_work_order' => $workOrder->id_work_order,
            'requested_by' => Auth::id(),
            'extend_days' => $validated['extend_days'],
            'extend_reason' => $validated['extend_reason'],
            'status' => $status,
        ]);

        // Notify TL or HOD
        if ($hasTeamLeader) {
            $this->notifyTeamLeader($workOrder, $extendRequest);
        } else {
            $this->notifyHod($workOrder, $extendRequest);
        }

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Extend request submitted successfully',
                'type' => 'success',
            ]);
    }

    /**
     * Team Leader approves extend request.
     */
    public function approveTl(Request $request, ExtendRequest $extendRequest): RedirectResponse
    {
        abort_unless($extendRequest->status === ExtendRequestStatus::PendingTlApproval, 422);
        $extendRequest->update([
            'status' => 'pending_hod_approval',
            'tl_approved_by' => Auth::id(),
            'tl_approved_at' => now(),
            'tl_notes' => $request->input('notes'),
        ]);

        $this->notifyHod($extendRequest->workOrder, $extendRequest);

        return back()->with('flash', [
            'message' => 'Extend request approved by Team Leader',
            'type' => 'success',
        ]);
    }

    /**
     * Team Leader rejects extend request.
     */
    public function rejectTl(Request $request, ExtendRequest $extendRequest): RedirectResponse
    {
        abort_unless($extendRequest->status === ExtendRequestStatus::PendingTlApproval, 422);
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $extendRequest->update([
            'status' => 'rejected',
            'tl_approved_by' => Auth::id(),
            'tl_approved_at' => now(),
            'tl_notes' => $validated['notes'] ?? null,
        ]);

        $this->notifyRequester($extendRequest, 'rejected');

        return back()->with('flash', [
            'message' => 'Extend request rejected',
            'type' => 'success',
        ]);
    }

    /**
     * HOD approves extend request.
     */
    public function approveHod(Request $request, ExtendRequest $extendRequest): RedirectResponse
    {
        abort_unless($extendRequest->status === ExtendRequestStatus::PendingHodApproval, 422);
        $validated = $request->validate(['notes' => 'nullable|string']);
        $wo = $extendRequest->workOrder;
        $startDate = $wo->deadline_date ?? $wo->scheduled_date ?? $wo->created_at;
        $newDeadline = BusinessDayCalculator::addBusinessDays($startDate, $extendRequest->extend_days);

        $extendRequest->update([
            'status' => 'approved',
            'hod_approved_by' => Auth::id(),
            'hod_approved_at' => now(),
            'hod_notes' => $validated['notes'] ?? null,
            'new_deadline_date' => $newDeadline->toDateString(),
        ]);

        $wo->update([
            'deadline_date' => $newDeadline->toDateString(),
            'extend_count' => ($wo->extend_count ?? 0) + 1,
            'extend_reason' => $extendRequest->extend_reason,
            'extended_at' => now(),
        ]);

        $this->notifyRequester($extendRequest, 'approved');

        return back()->with('flash', [
            'message' => 'Extend request approved. New deadline: '.$newDeadline->format('d M Y'),
            'type' => 'success',
        ]);
    }

    /**
     * HOD rejects extend request.
     */
    public function rejectHod(Request $request, ExtendRequest $extendRequest): RedirectResponse
    {
        abort_unless($extendRequest->status === ExtendRequestStatus::PendingHodApproval, 422);
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $extendRequest->update([
            'status' => 'rejected',
            'hod_approved_by' => Auth::id(),
            'hod_approved_at' => now(),
            'hod_notes' => $validated['notes'] ?? null,
        ]);

        $this->notifyRequester($extendRequest, 'rejected');

        return back()->with('flash', [
            'message' => 'Extend request rejected',
            'type' => 'success',
        ]);
    }

    /**
     * List pending extend requests for HOD/TL view.
     */
    public function pending(): Response
    {
        $user = Auth::user();

        $requests = ExtendRequest::with(['workOrder', 'requester'])
            ->whereIn('status', ['pending_tl_approval', 'pending_hod_approval'])
            ->get();

        return Inertia::render('WorkOrder/ExtendApproval', [
            'extendRequests' => $requests,
        ]);
    }

    private function authorizeExtend(WorkOrder $workOrder): void
    {
        abort_if(
            in_array($workOrder->status_pekerjaan, ['completed', 'rejected', 'Selesai', 'Dibatalkan'], true),
            403,
            'Cannot extend a completed or rejected work order.'
        );

        abort_if(
            ($workOrder->extend_count ?? 0) >= 3,
            403,
            'Maximum extend limit reached.'
        );
    }

    private function departmentHasTeamLeader(WorkOrder $workOrder): bool
    {
        $dept = $workOrder->departmentData;
        if (! $dept) {
            return false;
        }

        return User::where('department', $dept->id_department)
            ->whereHas('roles', fn ($q) => $q->where('name', 'team_leader'))
            ->exists();
    }

    private function notifyTeamLeader(WorkOrder $wo, ExtendRequest $er): void
    {
        $dept = $wo->departmentData;
        if (! $dept) {
            return;
        }

        $tl = User::where('department', $dept->id_department)
            ->whereHas('roles', fn ($q) => $q->where('name', 'team_leader'))
            ->first();

        if ($tl) {
            AppNotification::create([
                'notifiable_type' => User::class,
                'notifiable_id' => $tl->id,
                'type' => 'extend_request_tl',
                'data' => json_encode([
                    'extend_request_id' => $er->id_extend_request,
                    'work_order_id' => $wo->id_work_order,
                    'no_work_order' => $wo->no_work_order,
                    'message' => "Permintaan perpanjangan WO {$wo->no_work_order} membutuhkan approval Anda.",
                ]),
            ]);
        }
    }

    private function notifyHod(WorkOrder $wo, ExtendRequest $er): void
    {
        $dept = $wo->departmentData;
        $hodUserId = $dept?->hod_user_id;

        if ($hodUserId) {
            $hodEmployee = Employee::find($hodUserId);
            $hodUser = $hodEmployee ? User::where('email', $hodEmployee->email)->first() : null;

            if ($hodUser) {
                AppNotification::create([
                    'notifiable_type' => User::class,
                    'notifiable_id' => $hodUser->id,
                    'type' => 'extend_request_hod',
                    'data' => json_encode([
                        'extend_request_id' => $er->id_extend_request,
                        'work_order_id' => $wo->id_work_order,
                        'no_work_order' => $wo->no_work_order,
                        'message' => "Permintaan perpanjangan WO {$wo->no_work_order} membutuhkan approval HOD.",
                    ]),
                ]);
            }

            $hodEmployee?->notify(new WorkOrderNotification($wo));
        }
    }

    private function notifyRequester(ExtendRequest $er, string $action): void
    {
        $message = $action === 'approved'
            ? "Perpanjangan WO {$er->workOrder->no_work_order} telah disetujui."
            : "Perpanjangan WO {$er->workOrder->no_work_order} telah ditolak.";

        AppNotification::create([
            'notifiable_type' => User::class,
            'notifiable_id' => $er->requested_by,
            'type' => "extend_request_{$action}",
            'data' => json_encode([
                'extend_request_id' => $er->id_extend_request,
                'work_order_id' => $er->id_work_order,
                'no_work_order' => $er->workOrder->no_work_order,
                'message' => $message,
            ]),
        ]);
    }
}
