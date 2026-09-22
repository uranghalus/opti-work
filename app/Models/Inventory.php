<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * FR-23: Master data inventaris per tenant.
 */
class Inventory extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_inventory';

    protected $primaryKey = 'id_inventory';

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'id_kelompok_barang',
        'spesifikasi',
        'kode_inventory',
        'penanggung_jawab',
        'kondisi',
        'lokasi_barang',
        'jenis_barang',
        'tenant_id',
    ];

    public function kelompokBarang(): BelongsTo
    {
        return $this->belongsTo(KelompokBarang::class, 'id_kelompok_barang', 'id_kelompok_barang');
    }

    /**
     * FR-24: Kolom dinamis (custom field) per jenis barang.
     */
    public function expandData(): HasMany
    {
        return $this->hasMany(InventoryExpandData::class, 'id_inventory', 'id_inventory');
    }

    /**
     * FR-18: Data kerja yang terhubung ke inventaris ini via kode_inventory.
     */
    public function workData(): HasMany
    {
        return $this->hasMany(WorkData::class, 'kode_inventory', 'kode_inventory');
    }
}
