<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
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
            'filters' => $request->only(['search', 'status_pekerjaan', 'prioritas', 'department'])
        ]);
    }
    /**
     * Tampilkan form pembuatan Work Order
     */
}
