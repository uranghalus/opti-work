<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkDaily;
use App\Models\WorkData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WorkDailyController extends Controller
{
    /**
     * FR-21/22: Daftar pekerjaan harian.
     *
     * Karyawan hanya melihat miliknya (via user->department → employee match),
     * HOD/admin melihat semua dalam tenant.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = WorkDaily::query()
            ->with([
                'workData:id_work_data,no_kerja,status_pekerjaan',
                'employee:id_employee,nik_employee,nama_employee',
            ])
            ->latest('tanggal_kerja');

        // Non-priviledged role (karyawan/field_staff) hanya melihat pekerjaannya sendiri.
        if (! $user->hasAnyRole(['super_admin', 'admin_tenant', 'hod', 'team_leader', 'general_manager', 'deputy_general_manager'])) {
            $query->whereHas('employee', function ($employeeQuery) use ($user) {
                $employeeQuery->where(function ($q) use ($user) {
                    $q->where('email', $user->email)
                        ->orWhere('nik_employee', (string) $user->position);
                });
            });
        }

        if ($request->filled('status_pekerjaan')) {
            $query->where('status_pekerjaan', $request->status_pekerjaan);
        }

        if ($request->filled('tanggal_kerja')) {
            $query->whereDate('tanggal_kerja', $request->tanggal_kerja);
        }

        $workDailies = $query->paginate(15)->withQueryString();

        return Inertia::render('WorkDaily/Index', [
            'workDailies' => $workDailies,
            'filters' => $request->only(['status_pekerjaan', 'tanggal_kerja']),
        ]);
    }

    /**
     * FR-21: Form penetapan pekerjaan harian oleh HOD.
     */
    public function create(): Response
    {
        $employees = Employee::query()
            ->orderBy('nama_employee')
            ->get(['id_employee', 'nik_employee', 'nama_employee', 'id_department']);

        $workDatas = WorkData::query()
            ->whereNotIn('status_pekerjaan', ['Completed', 'Selesai'])
            ->latest()
            ->get(['id_work_data', 'no_kerja', 'status_pekerjaan']);

        return Inertia::render('WorkDaily/Create', [
            'employees' => $employees,
            'workDatas' => $workDatas,
        ]);
    }

    /**
     * FR-21: Simpan penetapan pekerjaan harian.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_work_data' => 'required|integer|exists:tb_work_data,id_work_data',
            'id_employee' => 'required|string|exists:tb_employee,id_employee',
            'tanggal_kerja' => 'required|date',
            'aktivitas_hari_ini' => 'required|string',
            'prioritas' => 'required|in:low,medium,high',
            'level' => 'nullable|in:normal,urgent,critical',
            'kendala_lapangan' => 'nullable|string',
        ]);

        $employee = Employee::findOrFail($validated['id_employee']);

        $workDaily = WorkDaily::create([
            ...$validated,
            'status_pekerjaan' => 'open',
            'progres_persentase' => 0,
            'pelapor' => $employee->nama_employee,
            'assigned_by' => Auth::id(),
            'assigned_at' => now(),
        ]);

        return redirect()->route('work-daily.index')
            ->with('success', 'Pekerjaan harian berhasil ditetapkan.');
    }

    /**
     * FR-22: Karyawan memperbarui status pekerjaan hariannya.
     */
    public function updateStatus(Request $request, WorkDaily $workDaily): RedirectResponse
    {
        $validated = $request->validate([
            'status_pekerjaan' => 'required|in:open,on_progress,selesai',
            'aktivitas_hari_ini' => 'required|string',
            'progres_persentase' => 'required|integer|min:0|max:100',
            'kendala_lapangan' => 'nullable|string',
        ]);

        /** @var User $user */
        $user = $request->user();
        $isOwner = $workDaily->employee?->email === $user->email;
        $canManage = $user->hasAnyRole(['super_admin', 'admin_tenant', 'hod', 'team_leader']);

        if (! $isOwner && ! $canManage) {
            abort(403, 'Anda tidak berhak memperbarui pekerjaan ini.');
        }

        $workDaily->update([
            'status_pekerjaan' => $validated['status_pekerjaan'],
            'aktivitas_hari_ini' => $validated['aktivitas_hari_ini'],
            'progres_persentase' => $validated['status_pekerjaan'] === 'selesai' ? 100 : $validated['progres_persentase'],
            'kendala_lapangan' => $validated['kendala_lapangan'] ?? $workDaily->kendala_lapangan,
            'pelapor' => $workDaily->employee?->nama_employee ?? $user->name,
        ]);

        return back()->with('success', 'Status pekerjaan harian diperbarui.');
    }

    public function destroy(WorkDaily $workDaily): RedirectResponse
    {
        $workDaily->delete();

        return redirect()->route('work-daily.index')
            ->with('success', 'Pekerjaan harian dihapus.');
    }
}
