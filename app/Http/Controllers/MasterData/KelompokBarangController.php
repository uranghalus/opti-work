<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\KelompokBarang;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelompokBarangController extends Controller
{
    /**
     * FR-23: Daftar kelompok barang.
     */
    public function index(Request $request): Response
    {
        $query = KelompokBarang::query()->withCount('inventories');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('kode_kelompok', 'like', "%{$search}%")
                    ->orWhere('nama_kelompok', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Inventory/KelompokBarang', [
            'kelompokBarang' => $query->orderBy('nama_kelompok')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateKelompok($request);

        KelompokBarang::create($validated);

        return redirect()->route('kelompok-barang.index')
            ->with('success', 'Kelompok barang berhasil dibuat.');
    }

    public function update(Request $request, KelompokBarang $kelompok_barang): RedirectResponse
    {
        $validated = $this->validateKelompok($request, $kelompok_barang);

        $kelompok_barang->update($validated);

        return redirect()->route('kelompok-barang.index')
            ->with('success', 'Kelompok barang berhasil diperbarui.');
    }

    public function destroy(KelompokBarang $kelompok_barang): RedirectResponse
    {
        if ($kelompok_barang->inventories()->exists()) {
            return redirect()->route('kelompok-barang.index')
                ->with('error', 'Kelompok masih dipakai oleh data inventaris dan tidak dapat dihapus.');
        }

        $kelompok_barang->delete();

        return redirect()->route('kelompok-barang.index')
            ->with('success', 'Kelompok barang berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateKelompok(Request $request, ?KelompokBarang $kelompokBarang = null): array
    {
        $uniqueKode = 'unique:tb_kelompok_barang,kode_kelompok';

        if ($kelompokBarang !== null) {
            $uniqueKode .= ','.$kelompokBarang->id_kelompok_barang.',id_kelompok_barang';
        }

        return $request->validate([
            'kode_kelompok' => 'required|string|max:30|'.$uniqueKode,
            'nama_kelompok' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
        ]);
    }
}
