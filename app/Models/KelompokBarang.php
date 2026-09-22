<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * FR-23: Kelompok barang untuk mengelompokkan inventaris.
 */
class KelompokBarang extends Model
{
    use HasFactory, SoftDeletes, TenantAware;

    protected $table = 'tb_kelompok_barang';

    protected $primaryKey = 'id_kelompok_barang';

    protected $fillable = [
        'kode_kelompok',
        'nama_kelompok',
        'deskripsi',
        'tenant_id',
    ];

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'id_kelompok_barang', 'id_kelompok_barang');
    }
}
