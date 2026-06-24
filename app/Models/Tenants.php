<?php

namespace App\Models;

use Database\Factories\TenantsFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class Tenants extends Model
{
    //
    /** @use HasFactory<TenantsFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Kolom yang diizinkan untuk diisi melalui form/request.
     */
    protected $fillable = [
        'name',
        'company_name',
        'status',
        'type',
        'email',
        'phone',
        'area',
        'location',
        'logo_path',
        'description',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['logo_url'];

    /**
     * Casting tipe data secara otomatis.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the full URL for the tenant's logo.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk('s3');

            return $disk->url($this->logo_path);
        }

        return null;
    }
}
