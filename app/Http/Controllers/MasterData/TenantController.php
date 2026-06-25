<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Models\Tenants;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource with server-side search and pagination.
     */
    public function index(Request $request): Response
    {
        $query = Tenants::query();

        // Server-side search across name and company_name
        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $tenants = $query->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Tenants/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $validatedData = $request->validated();

        if ($request->hasFile('logo')) {
            $validatedData['logo_path'] = $request->file('logo')->store('tenants/logos', 's3');
        }

        Tenants::create($validatedData);

        return redirect()->route('tenants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Tenant berhasil ditambahkan.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenants $tenant): Response
    {
        return Inertia::render('Tenants/Show', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenants $tenant): Response
    {
        return Inertia::render('Tenants/Edit', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTenantRequest $request, Tenants $tenant): RedirectResponse
    {
        $validatedData = $request->validated();

        if ($request->hasFile('logo')) {
            // Delete old logo from S3
            if ($tenant->logo_path) {
                /** @var FilesystemAdapter $disk */
                $disk = Storage::disk('s3');
                $disk->delete($tenant->logo_path);
            }
            $validatedData['logo_path'] = $request->file('logo')->store('tenants/logos', 's3');
        }

        $tenant->update($validatedData);

        return redirect()->route('tenants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Data Tenant berhasil diperbarui.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenants $tenant): RedirectResponse
    {
        // Delete logo from S3 if exists
        if ($tenant->logo_path) {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk('s3');
            $disk->delete($tenant->logo_path);
        }

        $tenant->delete();

        return redirect()->route('tenants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Tenant berhasil dihapus.']);
    }
}
