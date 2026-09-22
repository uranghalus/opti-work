<?php

namespace App\Models;

use App\Models\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * FR-24: Kolom dinamis inventaris (custom field per jenis barang).
 */
class InventoryExpandData extends Model
{
    use HasFactory, TenantAware;

    protected $table = 'tb_inventory_expand_data';

    protected $primaryKey = 'id_expand';

    public $timestamps = true;

    protected $fillable = [
        'id_inventory',
        'field_name',
        'field_value',
        'field_type',
        'tenant_id',
    ];

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'id_inventory', 'id_inventory');
    }
}
