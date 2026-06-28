<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the employees.
     */
    public function index(Request $request): Response
    {
        $query = Employee::query();

        // Server-side search across nik_employee and nama_employee
        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('nik_employee', 'like', "%{$search}%")
                    ->orWhere('nama_employee', 'like', "%{$search}%");
            });
        }

        $employees = $query->with(['department', 'position'])
            ->orderBy('nik_employee', 'asc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): Response
    {
        return Inertia::render('Employees/Show', [
            'employee' => $employee->load(['department', 'position']),
        ]);
    }

    /**
     * Trigger sync with Optigate Portal.
     */
    public function sync(): RedirectResponse
    {
        try {
            Artisan::call('app:sync-employees');

            return redirect()->route('employees.index')
                ->with('toast', ['type' => 'success', 'message' => 'Sinkronisasi employee berhasil dilakukan.']);
        } catch (\Throwable $th) {
            return redirect()->route('employees.index')
                ->with('toast', ['type' => 'error', 'message' => 'Gagal sinkronisasi: '.$th->getMessage()]);
        }
    }
}
