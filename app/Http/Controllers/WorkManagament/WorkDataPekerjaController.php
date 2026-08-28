<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkData;
use App\Models\WorkDataPekerja;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkDataPekerjaController extends Controller
{
    public function index(Request $request, WorkData $workData)
    {
        $query = $workData->pekerja()->with(['employee', 'user']);

        if ($request->filled('status_alokasi')) {
            $query->where('status_alokasi', $request->status_alokasi);
        }

        $pekerja = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('WorkData/Pekerja/Index', [
            'workData' => $workData->load('department'),
            'pekerja' => $pekerja,
            'filters' => $request->only(['status_alokasi']),
        ]);
    }

    public function create(WorkData $workData)
    {
        $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);

        return Inertia::render('WorkData/Pekerja/Create', [
            'workData' => $workData->load('department'),
            'departments' => $departments,
        ]);
    }

    public function store(Request $request, WorkData $workData)
    {
        $validated = $request->validate([
            'id_employee' => 'nullable|exists:tb_employee,id_employee',
            'id_user' => 'nullable|exists:users,id',
            'role_pekerja' => 'required|in:pelaksana,koordinator,pengawas',
            'status_alokasi' => 'required|in:assigned,accepted,in_progress,completed',
            'catatan' => 'nullable|string|max:255',
        ]);

        // Ensure at least employee or user is provided
        if (! $validated['id_employee'] && ! $validated['id_user']) {
            return back()->withErrors(['id_employee' => 'Employee atau User harus dipilih.']);
        }

        // Check duplicate
        if ($validated['id_employee']) {
            $exists = WorkDataPekerja::where('id_work_data', $workData->id_work_data)
                ->where('id_employee', $validated['id_employee'])
                ->whereNull('deleted_at')
                ->exists();
            if ($exists) {
                return back()->withErrors(['id_employee' => 'Pekerja sudah dialokasikan ke work data ini.']);
            }
        }

        $validated['id_work_data'] = $workData->id_work_data;
        $validated['accepted_at'] = $validated['status_alokasi'] === 'accepted' ? now() : null;
        $validated['completed_at'] = $validated['status_alokasi'] === 'completed' ? now() : null;

        WorkDataPekerja::create($validated);

        return redirect()->route('work-data.pekerja.index', $workData)
            ->with('success', 'Pekerja berhasil ditambahkan.');
    }

    public function edit(WorkData $workData, WorkDataPekerja $pekerja)
    {
        $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);

        return Inertia::render('WorkData/Pekerja/Edit', [
            'workData' => $workData->load('department'),
            'pekerja' => $pekerja,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, WorkData $workData, WorkDataPekerja $pekerja)
    {
        $validated = $request->validate([
            'id_employee' => 'nullable|exists:tb_employee,id_employee',
            'id_user' => 'nullable|exists:users,id',
            'role_pekerja' => 'required|in:pelaksana,koordinator,pengawas',
            'status_alokasi' => 'required|in:assigned,accepted,in_progress,completed',
            'catatan' => 'nullable|string|max:255',
        ]);

        $oldStatus = $pekerja->status_alokasi;
        $newStatus = $validated['status_alokasi'];

        if ($oldStatus !== $newStatus) {
            if ($newStatus === 'accepted') {
                $validated['accepted_at'] = now();
            } elseif ($newStatus === 'completed') {
                $validated['completed_at'] = now();
            }
        }

        $pekerja->update($validated);

        return redirect()->route('work-data.pekerja.index', $workData)
            ->with('success', 'Pekerja berhasil diupdate.');
    }

    public function updateStatus(Request $request, WorkData $workData, WorkDataPekerja $pekerja)
    {
        $validated = $request->validate([
            'status_alokasi' => 'required|in:assigned,accepted,in_progress,completed',
        ]);

        $validated['accepted_at'] = $validated['status_alokasi'] === 'accepted' && ! $pekerja->accepted_at ? now() : $pekerja->accepted_at;
        $validated['completed_at'] = $validated['status_alokasi'] === 'completed' && ! $pekerja->completed_at ? now() : $pekerja->completed_at;

        $pekerja->update($validated);

        return back()->with('success', 'Status pekerja berhasil diupdate.');
    }

    public function destroy(WorkData $workData, WorkDataPekerja $pekerja)
    {
        $pekerja->delete();

        return redirect()->route('work-data.pekerja.index', $workData)
            ->with('success', 'Pekerja berhasil dihapus.');
    }
}
