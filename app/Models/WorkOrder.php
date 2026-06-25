<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    //
    use HasFactory, SoftDeletes; // Tambahkan trait SoftDeletes
    // 1. Definisi Tabel dan Primary Key
    protected $table = 'tb_work_order';
    protected $primaryKey = 'id_work_order';

    // 2. Mass Assignment (Kolom yang diizinkan untuk diisi)
    protected $fillable = [
        'no_work_order',
        'tgl_work_order',
        'rincian_pekerjaan',
        'lokasi',
        'status_pekerjaan',
        'prioritas',
        'level',
        'budget',
        'keterangan',
        'modified_user',
        'user',
        'department',
        'pic',
    ];

    // 3. Data Casting (Otomatis mengubah format data)
    protected $casts = [
        'tgl_work_order' => 'date',
        'budget' => 'decimal:2',
    ];
}
