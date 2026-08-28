<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tenants';

    protected $fillable = ['name', 'company_name', 'status', 'type', 'email', 'phone', 'area', 'location', 'logo_path', 'description'];
}
