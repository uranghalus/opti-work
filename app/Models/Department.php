<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    //
    use HasFactory, HasUlids;
    protected $table = 'tb_department';
    protected $primaryKey = 'id_department';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id_department',
        'kode_department',
        'nama_department',
    ];
}
