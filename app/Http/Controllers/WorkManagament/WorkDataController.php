<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\WorkData;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WorkDataController extends Controller
{
    /**
     * Display a listing of work data.
     */
    public function index(Request $request)
    {
        $query = WorkData::query()->with('department');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_kerja', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhere('nama_tenant', 'like', "%{$search}%")
                    ->orWhere('work_department', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status_pekerjaan')) {
            $query->where('status_pekerjaan', $request->status_pekerjaan);
        }

        // Filter by department
        if ($request->filled('department')) {
            $query->where('work_department', $request->department);
        }

        // Get work data with pagination
        $workData = $query->latest('tanggal_work_data')->paginate(15)->withQueryString();

        return Inertia::render('WorkData/Index', [
            'workData' => $workData,
            'filters' => $request->only(['search', 'status_pekerjaan', 'department']),
        ]);
    }

    /**
     * Show the form for creating a new work data.
     */
    public function create()
    {
        $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);

        return Inertia::render('WorkData/Create', [
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created work data in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_kerja' => 'required|string|max:50|unique:tb_work_data,no_kerja',
            'tanggal_work_data' => 'nullable|date',
            'id_department' => 'nullable|integer',
            'deskripsi' => 'nullable|string',
            'kode_inventory' => 'nullable|string|max:50',
            'nama_tenant' => 'nullable|string|max:255',
            'work_department' => 'nullable|string|max:255',
        ]);

        $validated['create_id_user'] = Auth::id();
        $validated['status_pekerjaan'] = 'draft';
        $validated['status_hapus'] = '0';

        WorkData::create($validated);

        return redirect()->route('work-data.index')
            ->with('success', 'Work data created successfully.');
    }

    /**
     * Display the specified work data.
     */
    public function show(WorkData $workData)
    {
        $workData->load('department');

        return Inertia::render('WorkData/Show', [
            'workData' => $workData,
        ]);
    }

    /**
     * Show the form for editing the specified work data.
     */
    public function edit(WorkData $workData)
    {
        $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);

        return Inertia::render('WorkData/Edit', [
            'workData' => $workData,
            'departments' => $departments,
        ]);
    }

    /**
     * Update the specified work data in storage.
     */
    public function update(Request $request, WorkData $workData)
    {
        $validated = $request->validate([
            'tanggal_work_data' => 'nullable|date',
            'id_department' => 'nullable|integer',
            'deskripsi' => 'nullable|string',
            'prediksi_penyebab' => 'nullable|string',
            'tindakan' => 'nullable|string',
            'hasil_kesimpulan' => 'nullable|string',
            'saran_solusi' => 'nullable|string',
            'kode_inventory' => 'nullable|string|max:50',
            'nama_tenant' => 'nullable|string|max:255',
            'work_department' => 'nullable|string|max:255',
            'status_pekerjaan' => 'nullable|string|max:50',
        ]);

        $validated['modified_id_user'] = Auth::id();

        $workData->update($validated);

        return redirect()->route('work-data.show', $workData)
            ->with('success', 'Work data updated successfully.');
    }

    /**
     * Process work order to work data (from HOD approval).
     */
    public function processFromWorkOrder(WorkOrder $workOrder)
    {
        // Check if work data already exists
        $existingWorkData = WorkData::where('no_kerja', $workOrder->no_work_order)->first();

        if ($existingWorkData) {
            return redirect()->route('work-data.show', $existingWorkData)
                ->with('info', 'Work data already exists for this work order.');
        }

        // Create work data from work order
        $workData = WorkData::create([
            'no_kerja' => $workOrder->no_work_order,
            'tanggal_work_data' => now(),
            'id_department' => null, // Will be set if needed
            'deskripsi' => $workOrder->rincian_pekerjaan,
            'status_pekerjaan' => 'in_progress',
            'nama_tenant' => $workOrder->tenant_name,
            'work_department' => $workOrder->department,
            'kode_inventory' => null,
            'create_id_user' => Auth::id(),
            'status_hapus' => '0',
        ]);

        return redirect()->route('work-data.show', $workData)
            ->with('success', 'Work order processed to work data successfully.');
    }

    /**
     * Upload before image.
     */
    public function uploadBeforeImage(Request $request, WorkData $workData)
    {
        $request->validate([
            'gambar_sebelum' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('gambar_sebelum')) {
            // Delete old image if exists
            if ($workData->gambar_sebelum) {
                Storage::delete($workData->gambar_sebelum);
            }

            $path = $request->file('gambar_sebelum')->store('work-data/before', 'public');
            $workData->update(['gambar_sebelum' => $path]);
        }

        return back()->with('success', 'Before image uploaded successfully.');
    }

    /**
     * Upload after image.
     */
    public function uploadAfterImage(Request $request, WorkData $workData)
    {
        $request->validate([
            'gambar_sesudah' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('gambar_sesudah')) {
            // Delete old image if exists
            if ($workData->gambar_sesudah) {
                Storage::delete($workData->gambar_sesudah);
            }

            $path = $request->file('gambar_sesudah')->store('work-data/after', 'public');
            $workData->update(['gambar_sesudah' => $path]);
        }

        return back()->with('success', 'After image uploaded successfully.');
    }

    /**
     * Remove the specified work data from storage.
     */
    public function destroy(WorkData $workData)
    {
        // Soft delete by setting status_hapus
        $workData->update([
            'status_hapus' => '1',
            'modified_id_user' => Auth::id(),
        ]);

        return redirect()->route('work-data.index')
            ->with('success', 'Work data deleted successfully.');
    }
}
