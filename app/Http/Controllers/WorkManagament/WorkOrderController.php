<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Tenants;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WorkOrderController extends Controller
{
    //
    /**
     * Tampilkan daftar Work Order (dengan Search, Filter, Paginasi)
     */
    public function index(Request $request)
    {
        $query = WorkOrder::query();

        // Fitur Pencarian (Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_work_order', 'like', "%{$search}%")
                    ->orWhere('rincian_pekerjaan', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan Status Tiket (Pending HOD, Hod Approved, dll)
        if ($request->filled('status')) {
            $query->where('status_tiket', $request->status);
        }

        // Filter berdasarkan Status Pekerjaan (deprecated, use status instead)
        if ($request->filled('status_pekerjaan')) {
            $query->where('status_pekerjaan', $request->status_pekerjaan);
        }

        // Filter berdasarkan Prioritas (High, Medium, Low)
        if ($request->filled('prioritas')) {
            $query->where('prioritas', $request->prioritas);
        }

        // Filter berdasarkan Tipe Prioritas (Normal, Urgent)
        if ($request->filled('priority_type')) {
            $query->where('priority_type', $request->priority_type);
        }

        // Filter berdasarkan Department
        if ($request->filled('department')) {
            $query->where(function ($q) use ($request) {
                $q->where('department', 'like', "%{$request->department}%")
                    ->orWhere('department_tujuan', 'like', "%{$request->department}%");
            });
        }

        // Sorting functionality
        $sortBy = $request->get('sort_by', 'date');
        $sortDirection = $request->get('sort_direction', 'desc');

        switch ($sortBy) {
            case 'date':
                $query->orderBy('tgl_work_order', $sortDirection);
                break;
            case 'priority':
                // Custom priority ordering: Urgent - Accident > Urgent - Owner > Normal
                $query->orderByRaw("CASE 
                    WHEN prioritas = 'Urgent - Accident' THEN 1 
                    WHEN prioritas = 'Urgent - Owner' THEN 2 
                    WHEN prioritas = 'Normal' THEN 3 
                    ELSE 4 END");
                break;
            case 'status':
                $query->orderBy('status_tiket', $sortDirection);
                break;
            case 'no_work_order':
                $query->orderBy('no_work_order', $sortDirection);
                break;
            default:
                $query->orderBy('id_work_order', 'desc');
        }

        $workOrders = $query->paginate(10)->withQueryString();

        // Fetch departments untuk filter
        $departments = [];
        try {
            $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);
        } catch (\Throwable $th) {
            Log::error('Exception fetching departments for filter: '.$th->getMessage());
        }

        // Render ke komponen frontend
        return Inertia::render('WorkOrder/Index', [
            'workOrders' => $workOrders,
            'departments' => $departments,
            // Kirim kembali parameter filter sebagai props agar state form di frontend (React) tetap terjaga
            'filters' => $request->only(['search', 'status', 'status_pekerjaan', 'prioritas', 'priority_type', 'department', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Tampilkan form pembuatan Work Order
     */
    public function create()
    {
        $departments = [];
        $tenants = [];

        // Fetch departments
        try {
            // Mengambil data department, diurutkan berdasarkan nama.
            // Sesuaikan array get() jika Anda butuh kolom lain seperti 'kode_department'.
            $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);
        } catch (\Throwable $th) {
            Log::error('Exception API Department: '.$th->getMessage());
        }

        // Fetch tenants
        try {
            $tenants = Tenants::orderBy('name')->get(['id', 'name']);
        } catch (\Throwable $th) {
            Log::error('Exception fetching tenants: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/Create', [
            'departments' => $departments,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Simpan Work Order baru dengan auto-generate nomor
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'department' => 'required|string',
            'rincian_pekerjaan' => 'required|string',
            'location_type' => 'required|in:location,tenant',
            'lokasi' => 'nullable|string',
            'tenant_id' => 'nullable|string',
            'tenant_name' => 'nullable|string',
            'priority_type' => 'required|in:normal,urgent',
            'urgent_sub_type' => 'nullable|in:by_accident,by_owner',
            'prioritas' => 'required|in:low,medium,high',
            'keterangan' => 'nullable|string',
            'incident_photos' => 'nullable|array',
            'incident_photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // 2. Mapping & Logika Lokasi (Penyatuan Tenant/Lokasi)
        $validated['department_tujuan'] = $validated['department'];
        if ($request->location_type === 'tenant') {
            $validated['lokasi'] = $request->tenant_name;
            $validated['tenant_id'] = $request->tenant_id;
        } else {
            $validated['lokasi'] = $request->lokasi;
        }

        // Remove fields not in database
        unset($validated['department'], $validated['location_type'], $validated['tenant_name']);

        // 3. User & Status Awal
        $validated['tgl_work_order'] = now()->toDateString();
        $validated['status_tiket'] = 'Pending HOD';
        $validated['user_requester'] = Auth::guard()->user()->name ?? 'System';

        // 4. Handle S3 Incident Photos
        if ($request->hasFile('incident_photos')) {
            $paths = [];
            foreach ($request->file('incident_photos') as $photo) {
                $paths[] = $photo->store('incident-photos', 's3');
            }
            $validated['incident_photos'] = $paths;
        }

        // 5. Sequence Generator Nomor WO
        $dateString = now()->format('dmY');
        $deptCode = strtoupper($validated['department_tujuan']);

        $lastWo = WorkOrder::whereDate('tgl_work_order', now())
            ->where('department_tujuan', $validated['department_tujuan'])
            ->orderBy('id_work_order', 'desc')
            ->first();

        $seq = $lastWo ? (int) substr($lastWo->no_work_order, -3) + 1 : 1;
        $validated['no_work_order'] = sprintf('WO.%s.%s.%s', $dateString, $deptCode, str_pad($seq, 3, '0', STR_PAD_LEFT));

        // 6. Save
        WorkOrder::create($validated);

        return redirect()->route('work-orders.index')->with('success', 'Work order created successfully');
    }

    /**
     * Show the form for editing the specified work order
     */
    public function edit($id)
    {
        $workOrder = WorkOrder::findOrFail($id);

        $departments = [];
        $tenants = [];

        // Fetch departments from database
        try {
            $departments = Department::orderBy('nama_department')->get(['id_department', 'nama_department', 'kode_department']);
        } catch (\Throwable $th) {
            Log::error('Exception fetching departments: '.$th->getMessage());
        }

        // Fetch tenants
        try {
            $tenants = Tenants::orderBy('name')->get(['id', 'name']);
        } catch (\Throwable $th) {
            Log::error('Exception fetching tenants: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/Edit', [
            'workOrder' => $workOrder->load('departmentData'),
            'departments' => $departments,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Update the specified work order
     */
    public function update(Request $request, $id)
    {
        $workOrder = WorkOrder::findOrFail($id);

        $validated = $request->validate([
            'rincian_pekerjaan' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'location_type' => 'required|in:location,tenant',
            'tenant_id' => 'nullable|string',
            'tenant_name' => 'nullable|string|max:255',
            'prioritas' => 'required|string|max:50',
            'priority_type' => 'required|in:normal,urgent',
            'urgent_sub_type' => 'nullable|in:by_accident,by_owner',
            'keterangan' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'incident_photos' => 'nullable|array',
            'incident_photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'remove_photos' => 'nullable|array',
            'remove_photos.*' => 'nullable|string',
        ]);

        // Map department to department_tujuan
        $validated['department_tujuan'] = $validated['department'] ?? $workOrder->department_tujuan;

        // Handle location mapping
        if ($request->location_type === 'tenant') {
            $validated['lokasi'] = $request->tenant_name;
            $validated['tenant_id'] = $request->tenant_id;
        } else {
            $validated['lokasi'] = $request->lokasi;
        }

        // Remove fields not in database
        unset($validated['department'], $validated['location_type'], $validated['tenant_name']);

        // Handle photo removal
        $existingPhotos = $workOrder->incident_photos ?? [];
        if ($request->has('remove_photos')) {
            $photosToRemove = $request->remove_photos;
            foreach ($photosToRemove as $photoPath) {
                // Delete from S3
                if (Storage::disk('s3')->exists($photoPath)) {
                    Storage::disk('s3')->delete($photoPath);
                }
                // Remove from array
                $existingPhotos = array_filter($existingPhotos, function ($photo) use ($photoPath) {
                    return $photo !== $photoPath;
                });
            }
        }

        // Handle new photo uploads
        if ($request->hasFile('incident_photos')) {
            foreach ($request->file('incident_photos') as $photo) {
                $path = $photo->store('incident-photos', 's3');
                $existingPhotos[] = $path;
            }
        }

        $validated['incident_photos'] = array_values($existingPhotos);
        $validated['modified_user'] = Auth::id();

        $workOrder->update($validated);

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Work order updated successfully',
                'type' => 'success',
            ]);
    }

    /**
     * Remove the specified work order
     */
    public function destroy($id)
    {
        $workOrder = WorkOrder::findOrFail($id);

        // Delete incident photos from S3
        if ($workOrder->incident_photos) {
            foreach ($workOrder->incident_photos as $photoPath) {
                if (Storage::disk('s3')->exists($photoPath)) {
                    Storage::disk('s3')->delete($photoPath);
                }
            }
        }

        $workOrder->delete();

        return redirect()->route('work-orders.index')
            ->with('flash', [
                'message' => 'Work order deleted successfully',
                'type' => 'success',
            ]);
    }

    /**
     * HOD Review page
     */
    public function hodReview(WorkOrder $workOrder)
    {
        $employees = [];
        $url = config('services.optigate_portal.url').'/api/employees';
        $token = config('services.optigate_portal.token');
        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);
            if ($response->successful()) {
                $employees = $response->json('data') ?? $response->json();
            } else {
                Log::error('Gagal mengambil data employee dari API Portal: '.$response->body());
            }
        } catch (\Throwable $th) {
            Log::error('Exception API Employee: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/HodReview', [
            'workOrder' => $workOrder,
            'employees' => $employees,
        ]);
    }

    /**
     * HOD approves and schedules/assigns work
     */
    public function hodApprove(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'hod_action' => 'required|in:execute_immediately,schedule',
            'scheduled_date' => 'required_if:hod_action,schedule|nullable|date|after_or_equal:today',
            'action_notes' => 'nullable|string',
            'assigned_employees' => 'nullable|array',
            'assigned_employees.*.id' => 'nullable|integer',
            'assigned_employees.*.name' => 'nullable|string',
            'personnel_count' => 'nullable|integer',
        ]);

        // Validation: Urgent By Accident must execute immediately
        if ($workOrder->urgent_sub_type === 'by_accident' && $validated['hod_action'] !== 'execute_immediately') {
            return back()->withErrors([
                'hod_action' => 'Urgent By Accident work orders must be executed immediately.',
            ]);
        }

        // Update work order with HOD approval data
        $workOrder->update([
            'hod_action' => $validated['hod_action'],
            'scheduled_date' => $validated['scheduled_date'] ?? null,
            'status_tiket' => 'Pending HOD',
            'status_pekerjaan' => $validated['hod_action'] === 'execute_immediately' ? 'hod_approved' : 'scheduled',
            'keterangan' => $validated['action_notes'] ?? $workOrder->keterangan,
            'assigned_employees' => $validated['assigned_employees'] ?? [],
            'personnel_count' => $validated['personnel_count'] ?? 0,
        ]);

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Work order approved successfully',
                'type' => 'success',
            ]);
    }

    /**
     * Show assign employees form
     */
    public function assign(WorkOrder $workOrder)
    {
        $employees = [];
        $url = config('services.optigate_portal.url').'/api/employees';
        $token = config('services.optigate_portal.token');
        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);
            if ($response->successful()) {
                $employees = $response->json('data') ?? $response->json();
            } else {
                Log::error('Gagal mengambil data employee dari API Portal: '.$response->body());
            }
        } catch (\Throwable $th) {
            Log::error('Exception API Employee: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/Assign', [
            'workOrder' => $workOrder,
            'employees' => $employees,
        ]);
    }

    /**
     * Assign employees to work order
     */
    public function assignEmployees(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'assigned_employees' => 'required|array|min:1',
            'assigned_employees.*.id' => 'required|integer',
            'assigned_employees.*.name' => 'required|string',
            'personnel_count' => 'required|integer|min:1',
            'assignment_notes' => 'nullable|string',
        ]);

        $workOrder->update([
            'assigned_employees' => $validated['assigned_employees'],
            'personnel_count' => $validated['personnel_count'],
            'status_pekerjaan' => 'assigned',
            'keterangan' => $validated['assignment_notes'] ?? $workOrder->keterangan,
        ]);

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Employees assigned successfully',
                'type' => 'success',
            ]);
    }

    /**
     * Submit work completion results
     */
    public function submitResults(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'completion_results' => 'required|string',
            'completion_notes' => 'nullable|string',
        ]);

        $workOrder->update([
            'completion_results' => $validated['completion_results'],
            'status_pekerjaan' => 'pending_verification',
            'keterangan' => $validated['completion_notes'] ?? $workOrder->keterangan,
        ]);

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Work results submitted successfully',
                'type' => 'success',
            ]);
    }

    /**
     * HOD verifies work completion
     */
    public function verify(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'verification_status' => 'required|in:pass,fail,needs_revision',
            'verification_notes' => 'nullable|string',
        ]);

        $updateData = [
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'verification_notes' => $validated['verification_notes'],
        ];

        // Update status based on verification result
        if ($validated['verification_status'] === 'pass') {
            $updateData['status_pekerjaan'] = 'completed';
            $updateData['status_tiket'] = 'Executed';
        } elseif ($validated['verification_status'] === 'needs_revision') {
            $updateData['status_pekerjaan'] = 'in_progress';
        } else {
            $updateData['status_pekerjaan'] = 'rejected';
            $updateData['status_tiket'] = 'Rejected';
        }

        $workOrder->update($updateData);

        return redirect()->route('work-orders.show', $workOrder->id_work_order)
            ->with('flash', [
                'message' => 'Work order verification completed',
                'type' => 'success',
            ]);
    }

    public function show($id)
    {
        $workOrder = WorkOrder::with('departmentData')->findOrFail($id);

        return Inertia::render('WorkOrder/Show', [
            'workOrder' => $workOrder,
        ]);
    }
}
