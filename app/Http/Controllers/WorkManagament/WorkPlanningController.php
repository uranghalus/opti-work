<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkPlanning;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WorkPlanningController extends Controller
{
    /**
     * FR-14: Monitoring status jadwal work order terjadwal.
     */
    public function index(Request $request): Response
    {
        $query = WorkPlanning::query()
            ->with('workOrder:id_work_order,no_work_order,rincian_pekerjaan,department_tujuan,lokasi,prioritas,priority_type,status_pekerjaan')
            ->latest('tgl_jadwal');

        if ($request->filled('status_jadwal')) {
            $query->where('status_jadwal', $request->status_jadwal);
        }

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->whereHas('workOrder', function ($woQuery) use ($search) {
                $woQuery->where('no_work_order', 'like', "%{$search}%")
                    ->orWhere('rincian_pekerjaan', 'like', "%{$search}%")
                    ->orWhere('department_tujuan', 'like', "%{$search}%");
            });
        }

        $plannings = $query->paginate(15)->withQueryString();

        $summary = [
            'total' => WorkPlanning::count(),
            'planned' => WorkPlanning::where('status_jadwal', 'planned')->count(),
            'in_progress' => WorkPlanning::where('status_jadwal', 'in_progress')->count(),
            'completed' => WorkPlanning::where('status_jadwal', 'completed')->count(),
        ];

        return Inertia::render('WorkPlanning/Index', [
            'plannings' => $plannings,
            'summary' => $summary,
            'filters' => $request->only(['status_jadwal', 'search']),
        ]);
    }

    /**
     * FR-12: Form membuat jadwal untuk work order kategori Normal.
     */
    public function create(Request $request): Response
    {
        $workOrders = WorkOrder::query()
            ->where('priority_type', 'normal')
            ->whereNotIn('status_pekerjaan', ['completed', 'rejected'])
            ->whereDoesntHave('workPlannings', fn ($q) => $q->whereIn('status_jadwal', ['planned', 'scheduled', 'in_progress']))
            ->latest()
            ->get(['id_work_order', 'no_work_order', 'rincian_pekerjaan', 'department_tujuan', 'lokasi', 'prioritas']);

        return Inertia::render('WorkPlanning/Create', [
            'workOrders' => $workOrders,
            'selectedWorkOrder' => $request->filled('work_order')
                ? WorkOrder::find($request->integer('work_order'))
                : null,
        ]);
    }

    /**
     * FR-12: Simpan jadwal pengerjaan work order Normal.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_work_order' => 'required|integer|exists:tb_work_order,id_work_order',
            'tgl_jadwal' => 'required|date|after_or_equal:today',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i|after:jam_mulai',
            'jenis_pekerjaan' => 'nullable|string|max:100',
            'lama_pekerjaan_hari' => 'nullable|integer|min:1',
            'budget' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $workOrder = WorkOrder::findOrFail($validated['id_work_order']);

        if ($workOrder->priority_type === 'urgent') {
            return back()->withErrors([
                'id_work_order' => 'Work order urgent tidak dapat dijadwalkan.',
            ]);
        }

        $planning = WorkPlanning::create([
            ...$validated,
            'status_jadwal' => 'planned',
            'original_tgl_jadwal' => $validated['tgl_jadwal'],
            'create_id_user' => Auth::id(),
            'modified_id_user' => Auth::id(),
        ]);

        // WO kini terjadwal — catat tanggal terjadwal di work order.
        $workOrder->update([
            'scheduled_date' => $validated['tgl_jadwal'],
            'status_pekerjaan' => $workOrder->status_pekerjaan === 'hod_approved' ? 'scheduled' : $workOrder->status_pekerjaan,
        ]);

        return redirect()->route('work-planning.show', $planning)
            ->with('success', 'Work planning berhasil dibuat.');
    }

    public function show(WorkPlanning $workPlanning): Response
    {
        $workPlanning->load([
            'workOrder:id_work_order,no_work_order,rincian_pekerjaan,department_tujuan,lokasi,prioritas,priority_type,status_pekerjaan,scheduled_date,deadline_date',
            'extendRequester:id,name',
            'extendApprover:id,name',
        ]);

        return Inertia::render('WorkPlanning/Show', [
            'workPlanning' => $workPlanning,
        ]);
    }

    public function edit(WorkPlanning $workPlanning): Response
    {
        return Inertia::render('WorkPlanning/Edit', [
            'workPlanning' => $workPlanning->load('workOrder:id_work_order,no_work_order,rincian_pekerjaan'),
        ]);
    }

    public function update(Request $request, WorkPlanning $workPlanning): RedirectResponse
    {
        $validated = $request->validate([
            'tgl_jadwal' => 'required|date',
            'jam_mulai' => 'nullable|date_format:H:i',
            'jam_selesai' => 'nullable|date_format:H:i|after:jam_mulai',
            'jenis_pekerjaan' => 'nullable|string|max:100',
            'lama_pekerjaan_hari' => 'nullable|integer|min:1',
            'budget' => 'nullable|numeric|min:0',
            'status_jadwal' => 'required|in:planned,scheduled,in_progress,completed,cancelled',
            'catatan' => 'nullable|string',
        ]);

        $workPlanning->update([
            ...$validated,
            'modified_id_user' => Auth::id(),
        ]);

        return redirect()->route('work-planning.show', $workPlanning)
            ->with('success', 'Work planning berhasil diupdate.');
    }

    /**
     * FR-13: HOD mengajukan perpanjangan jadwal — wajib approval DGM/GM.
     */
    public function requestExtend(Request $request, WorkPlanning $workPlanning): RedirectResponse
    {
        abort_unless($workPlanning->canBeExtended(), 422, 'Jadwal tidak dapat diperpanjang.');

        $validated = $request->validate([
            'tgl_jadwal' => 'required|date|after:'.$workPlanning->tgl_jadwal->toDateString(),
            'extend_reason' => 'required|string',
        ]);

        $workPlanning->update([
            'tgl_jadwal' => $validated['tgl_jadwal'],
            'extend_reason' => $validated['extend_reason'],
            'extend_requested_by' => Auth::id(),
            'status_jadwal' => 'pending_extend_approval',
        ]);

        $this->notifyApprovers($workPlanning->fresh());

        return redirect()->route('work-planning.show', $workPlanning)
            ->with('success', 'Pengajuan perpanjangan jadwal terkirim, menunggu approval DGM/GM.');
    }

    /**
     * FR-13: DGM/GM menyetujui perpanjangan jadwal.
     */
    public function approveExtend(Request $request, WorkPlanning $workPlanning): RedirectResponse
    {
        $this->authorizeGmAction($request);

        abort_unless($workPlanning->status_jadwal === 'pending_extend_approval', 422, 'Tidak ada pengajuan extend yang pending.');

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $workPlanning->update([
            'status_jadwal' => 'rescheduled',
            'extend_count' => $workPlanning->extend_count + 1,
            'extend_approved_by' => Auth::id(),
            'extend_approved_at' => now(),
            'extend_approval_notes' => $validated['notes'] ?? null,
            'modified_id_user' => Auth::id(),
        ]);

        $workPlanning->workOrder?->update(['scheduled_date' => $workPlanning->tgl_jadwal->toDateString()]);

        return redirect()->route('work-planning.show', $workPlanning)
            ->with('success', 'Perpanjangan jadwal disetujui.');
    }

    /**
     * FR-13: DGM/GM menolak perpanjangan jadwal.
     */
    public function rejectExtend(Request $request, WorkPlanning $workPlanning): RedirectResponse
    {
        $this->authorizeGmAction($request);

        abort_unless($workPlanning->status_jadwal === 'pending_extend_approval', 422, 'Tidak ada pengajuan extend yang pending.');

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $workPlanning->update([
            'tgl_jadwal' => $workPlanning->getRawOriginal('tgl_jadwal'),
            'status_jadwal' => 'scheduled',
            'extend_approval_notes' => $validated['notes'] ?? null,
            'modified_id_user' => Auth::id(),
        ]);

        return redirect()->route('work-planning.show', $workPlanning)
            ->with('success', 'Perpanjangan jadwal ditolak.');
    }

    public function destroy(WorkPlanning $workPlanning): RedirectResponse
    {
        $workPlanning->delete();

        return redirect()->route('work-planning.index')
            ->with('success', 'Work planning berhasil dihapus.');
    }

    private function authorizeGmAction(Request $request): void
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole(['general_manager', 'deputy_general_manager']),
            403,
            'Hanya DGM/GM yang dapat memproses approval perpanjangan jadwal.'
        );
    }

    private function notifyApprovers(WorkPlanning $workPlanning): void
    {
        $approvers = User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['general_manager', 'deputy_general_manager']))
            ->get();

        foreach ($approvers as $approver) {
            AppNotification::create([
                'notifiable_type' => User::class,
                'notifiable_id' => $approver->id,
                'type' => 'work_planning.extend_requested',
                'data' => [
                    'title' => 'Pengajuan Extend Work Schedule',
                    'message' => "Jadwal WO {$workPlanning->workOrder?->no_work_order} diajukan perpanjangan ke {$workPlanning->tgl_jadwal->format('d M Y')}.",
                    'work_planning_id' => $workPlanning->getKey(),
                    'url' => "/work-planning/{$workPlanning->getKey()}",
                ],
            ]);
        }
    }
}
