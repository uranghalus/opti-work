<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display a listing of the divisions.
     */
    public function index(Request $request): Response
    {
        $query = Division::query();

        // Server-side search across kode_division and nama_division
        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('kode_division', 'like', "%{$search}%")
                    ->orWhere('nama_division', 'like', "%{$search}%");
            });
        }

        $divisions = $query->orderBy('kode_division', 'asc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Divisions/Index', [
            'divisions' => $divisions,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Trigger sync with Optigate Portal.
     */
    public function sync(): RedirectResponse
    {
        try {
            Artisan::call('app:sync-divisions');

            return redirect()->route('divisions.index')
                ->with('toast', ['type' => 'success', 'message' => 'Sinkronisasi divisi berhasil dilakukan.']);
        } catch (\Throwable $th) {
            return redirect()->route('divisions.index')
                ->with('toast', ['type' => 'error', 'message' => 'Gagal sinkronisasi: '.$th->getMessage()]);
        }
    }
}
