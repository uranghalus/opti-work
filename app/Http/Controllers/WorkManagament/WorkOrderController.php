<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\Tenants;
use App\Models\WorkOrder;
use Carbon\Carbon;
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

        // Fitur Penyaringan (Filter)
        if ($request->filled('status_pekerjaan')) {
            $query->where('status_pekerjaan', $request->status_pekerjaan);
        }
        if ($request->filled('prioritas')) {
            $query->where('prioritas', $request->prioritas);
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Ambil data dengan paginasi
        $workOrders = $query->latest()->paginate(10)->withQueryString();

        // Render ke komponen frontend (misal: resources/js/Pages/WorkOrder/Index.jsx)
        return Inertia::render('WorkOrder/Index', [
            'workOrders' => $workOrders,
            // Kirim kembali parameter filter sebagai props agar state form di frontend (React) tetap terjaga
            'filters' => $request->only(['search', 'status_pekerjaan', 'prioritas', 'department']),
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
        $url = config('services.optigate_portal.url').'/api/departments';
        $token = config('services.optigate_portal.token');
        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);
            if ($response->successful()) {
                $departments = $response->json('data') ?? $response->json();
            } else {
                Log::error('Gagal mengambil data department dari API Portal: '.$response->body());
            }
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
        $validated = $request->validate([
            'rincian_pekerjaan' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'location_type' => 'required|in:location,tenant',
            'tenant_id' => 'nullable|integer',
            'tenant_name' => 'nullable|string|max:255',
            'prioritas' => 'required|string|max:50',
            'priority_type' => 'required|in:normal,urgent',
            'urgent_sub_type' => 'nullable|in:by_accident,by_owner',
            'budget' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
            'incident_photos' => 'nullable|array',
            'incident_photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // Auto-set work order date to today
        $validated['tgl_work_order'] = now();

        // Auto-set status to "pending_hod_review"
        $validated['status_pekerjaan'] = 'pending_hod_review';

        // Auto-set user and modified_user from logged-in session
        $validated['user'] = Auth::user()->name ?? 'System';
        $validated['modified_user'] = Auth::id();

        // Handle incident photos upload to S3
        $incidentPhotos = [];
        if ($request->hasFile('incident_photos')) {
            foreach ($request->file('incident_photos') as $photo) {
                $path = $photo->store('incident-photos', 's3');
                $incidentPhotos[] = $path;
            }
        }
        $validated['incident_photos'] = $incidentPhotos;

        // Auto-generate work order number: WO.DDMMYYYY.department_name.sequence_number
        $date = Carbon::parse($validated['tgl_work_order']);
        $dateString = $date->format('dmY'); // DDMMYYYY format
        $department = $validated['department'] ?? 'General';

        // Get the last sequence number for this department on this date
        $lastWorkOrder = WorkOrder::where('tgl_work_order', $validated['tgl_work_order'])
            ->where('department', $department)
            ->orderBy('id_work_order', 'desc')
            ->first();

        $sequenceNumber = $lastWorkOrder ?
            (int) substr($lastWorkOrder->no_work_order, -3) + 1 :
            1;

        // Format sequence number with leading zeros (3 digits)
        $formattedSequence = str_pad($sequenceNumber, 3, '0', STR_PAD_LEFT);

        // Generate work order number: WO.24062026.IT.001
        $validated['no_work_order'] = sprintf(
            'WO.%s.%s.%s',
            $dateString,
            strtoupper($department),
            $formattedSequence
        );

        $workOrder = WorkOrder::create($validated);

        return redirect()->route('work-orders.index')
            ->with('flash', [
                'message' => 'Work order created successfully',
                'type' => 'success',
            ]);
    }

    /**
     * Show the form for editing the specified work order
     */
    public function edit($id)
    {
        $workOrder = WorkOrder::findOrFail($id);

        $departments = [];
        $tenants = [];

        // Fetch departments
        $url = config('services.optigate_portal.url').'/api/departments';
        $token = config('services.optigate_portal.token');
        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);
            if ($response->successful()) {
                $departments = $response->json('data') ?? $response->json();
            } else {
                Log::error('Gagal mengambil data department dari API Portal: '.$response->body());
            }
        } catch (\Throwable $th) {
            Log::error('Exception API Department: '.$th->getMessage());
        }

        // Fetch tenants
        try {
            $tenants = Tenants::orderBy('name')->get(['id', 'name']);
        } catch (\Throwable $th) {
            Log::error('Exception fetching tenants: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/Edit', [
            'workOrder' => $workOrder,
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
            'tenant_id' => 'nullable|integer',
            'tenant_name' => 'nullable|string|max:255',
            'prioritas' => 'required|string|max:50',
            'priority_type' => 'required|in:normal,urgent',
            'urgent_sub_type' => 'nullable|in:by_accident,by_owner',
            'budget' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
            'incident_photos' => 'nullable|array',
            'incident_photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'remove_photos' => 'nullable|array',
            'remove_photos.*' => 'nullable|string',
        ]);

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

        return redirect()->route('work-orders.index')
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
        // Authorization: Check if user is HOD or has management role
        // For now, allow all authenticated users (implement proper auth later)

        return Inertia::render('WorkOrder/HodReview', [
            'workOrder' => $workOrder->load([]),
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
        ]);

        // Validation: Urgent By Accident must execute immediately
        if ($workOrder->urgent_sub_type === 'by_accident' && $validated['hod_action'] !== 'execute_immediately') {
            return back()->withErrors([
                'hod_action' => 'Urgent By Accident work orders must be executed immediately.',
            ]);
        }

        $workOrder->update([
            'hod_action' => $validated['hod_action'],
            'scheduled_date' => $validated['scheduled_date'] ?? null,
            'status_pekerjaan' => $validated['hod_action'] === 'execute_immediately' ? 'hod_approved' : 'scheduled',
            'keterangan' => $validated['action_notes'] ?? $workOrder->keterangan,
        ]);

        return redirect()->route('work-orders.hod-review', $workOrder->id_work_order)
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
        // Fetch employees from API or database
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
            'workOrder' => $workOrder->load([]),
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

        return redirect()->route('work-orders.index')
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

        return redirect()->route('work-orders.index')
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
        } elseif ($validated['verification_status'] === 'needs_revision') {
            $updateData['status_pekerjaan'] = 'in_progress';
        } else {
            $updateData['status_pekerjaan'] = 'rejected';
        }

        $workOrder->update($updateData);

        return redirect()->route('work-orders.index')
            ->with('flash', [
                'message' => 'Work order verification completed',
                'type' => 'success',
            ]);
    }

    public function show($id)
    {
        $workOrder = WorkOrder::findOrFail($id);

        // Fetch employees if needed for display
        $employees = [];
        $url = config('services.optigate_portal.url').'/api/employees';
        $token = config('services.optigate_portal.token');
        try {
            $response = Http::withToken($token)
                ->timeout(10)
                ->get($url);
            if ($response->successful()) {
                $employees = $response->json('data') ?? $response->json();
            }
        } catch (\Throwable $th) {
            Log::error('Exception API Employee: '.$th->getMessage());
        }

        return Inertia::render('WorkOrder/Show', [
            'workOrder' => $workOrder,
            'employees' => $employees,
        ]);
    }
}
