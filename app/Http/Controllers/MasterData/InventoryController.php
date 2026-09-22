<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\KelompokBarang;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * FR-23: Daftar inventaris dengan search & filter.
     */
    public function index(Request $request): Response
    {
        $query = Inventory::query()->with('kelompokBarang');

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('kode_barang', 'like', "%{$search}%")
                    ->orWhere('kode_inventory', 'like', "%{$search}%")
                    ->orWhere('nama_barang', 'like', "%{$search}%")
                    ->orWhere('lokasi_barang', 'like', "%{$search}%")
                    ->orWhere('penanggung_jawab', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kondisi')) {
            $query->where('kondisi', $request->string('kondisi'));
        }

        if ($request->filled('kelompok')) {
            $query->where('id_kelompok_barang', $request->integer('kelompok'));
        }

        if ($request->filled('jenis')) {
            $query->where('jenis_barang', $request->string('jenis'));
        }

        $inventories = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'filters' => $request->only(['search', 'kondisi', 'kelompok', 'jenis']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inventory/Create', [
            'kelompokBarang' => KelompokBarang::orderBy('nama_kelompok')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateInventory($request);

        $inventory = DB::transaction(function () use ($validated) {
            $inventory = Inventory::create(Arr::except($validated, ['dynamic_fields']));

            $this->syncExpandData($inventory, $validated['dynamic_fields'] ?? []);

            return $inventory;
        });

        return redirect()->route('inventory.show', $inventory)
            ->with('success', 'Data inventaris berhasil dibuat.');
    }

    /**
     * FR-23: Detail inventaris + FR-18 daftar data kerja yang terhubung.
     */
    public function show(Inventory $inventory): Response
    {
        $inventory->load(['kelompokBarang', 'expandData']);

        return Inertia::render('Inventory/Show', [
            'inventory' => $inventory,
            'workData' => $inventory->workData()->get(['id_work_data', 'no_kerja', 'status_pekerjaan']),
        ]);
    }

    public function edit(Inventory $inventory): Response
    {
        $inventory->load('expandData');

        return Inertia::render('Inventory/Edit', [
            'inventory' => $inventory,
            'kelompokBarang' => KelompokBarang::orderBy('nama_kelompok')->get(),
        ]);
    }

    public function update(Request $request, Inventory $inventory): RedirectResponse
    {
        $validated = $this->validateInventory($request, $inventory);

        DB::transaction(function () use ($inventory, $validated) {
            $inventory->update(Arr::except($validated, ['dynamic_fields']));

            $this->syncExpandData($inventory, $validated['dynamic_fields'] ?? []);
        });

        return redirect()->route('inventory.show', $inventory)
            ->with('success', 'Data inventaris berhasil diperbarui.');
    }

    public function destroy(Inventory $inventory): RedirectResponse
    {
        $inventory->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Data inventaris berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateInventory(Request $request, ?Inventory $inventory = null): array
    {
        $uniqueKodeBarang = 'unique:tb_inventory,kode_barang';
        $uniqueKodeInventory = 'nullable|unique:tb_inventory,kode_inventory';

        if ($inventory !== null) {
            $uniqueKodeBarang .= ','.$inventory->id_inventory.',id_inventory';
            $uniqueKodeInventory .= ','.$inventory->id_inventory.',id_inventory';
        }

        return $request->validate([
            'kode_barang' => 'required|string|max:50|'.$uniqueKodeBarang,
            'kode_inventory' => $uniqueKodeInventory,
            'nama_barang' => 'required|string|max:255',
            'id_kelompok_barang' => 'nullable|integer|exists:tb_kelompok_barang,id_kelompok_barang',
            'spesifikasi' => 'nullable|string',
            'penanggung_jawab' => 'nullable|string|max:150',
            'kondisi' => 'required|in:baik,rusak_ringan,rusak_berat,perbaikan',
            'lokasi_barang' => 'nullable|string|max:255',
            'jenis_barang' => 'nullable|string|max:100',
            // FR-24: kolom dinamis per jenis barang
            'dynamic_fields' => 'nullable|array|max:50',
            'dynamic_fields.*.field_name' => 'required_with:dynamic_fields|string|max:150',
            'dynamic_fields.*.field_value' => 'nullable|string|max:1000',
            'dynamic_fields.*.field_type' => 'nullable|in:text,number,date,boolean',
        ]);
    }

    /**
     * FR-24: Sinkronisasi kolom dinamis — upsert per field_name, hapus yang tidak dikirim.
     *
     * @param  array<int, array<string, string|null>>  $fields
     */
    private function syncExpandData(Inventory $inventory, array $fields): void
    {
        $seen = [];

        foreach ($fields as $field) {
            $name = trim((string) ($field['field_name'] ?? ''));

            if ($name === '') {
                continue;
            }

            $seen[] = $name;

            $inventory->expandData()->updateOrCreate(
                ['field_name' => $name],
                [
                    'field_value' => (string) ($field['field_value'] ?? ''),
                    'field_type' => $field['field_type'] ?? 'text',
                ],
            );
        }

        if ($seen !== []) {
            $inventory->expandData()->whereNotIn('field_name', $seen)->delete();
        }
    }
}
