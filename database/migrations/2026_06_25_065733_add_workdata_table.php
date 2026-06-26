<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::create('tb_work_data', function (Blueprint $table) {
            $table->id('id_work_data');
            $table->string('no_kerja')->unique(); // Nomor Surat Perintah Kerja (SPK) asli

            // Referensi ke Induk (Tiket Request)
            $table->unsignedBigInteger('id_work_order')->nullable();

            // Referensi ke Objek Aset
            $table->string('kode_inventory', 50)->nullable();
            $table->string('nama_tenant')->nullable();

            // Data Planning & Delegasi (Diisi oleh HOD)
            $table->date('tgl_rencana_mulai')->nullable();
            $table->date('tgl_rencana_selesai')->nullable();
            $table->string('pic_lead')->nullable(); // String NIK atau ID PIC
            $table->integer('jumlah_personel')->nullable();
            $table->decimal('budget_estimasi', 15, 2)->nullable();

            // Status Eksekusi Lapangan: 'Planned', 'In Progress', 'Menunggu Verifikasi', 'Completed'
            $table->string('status_pekerjaan')->default('Planned');

            // Data Laporan Eksekusi Akhir (Diisi oleh Tim Lapangan)
            $table->date('tgl_mulai_aktual')->nullable();
            $table->date('tgl_selesai_aktual')->nullable();
            $table->string('gambar_sebelum')->nullable();
            $table->string('gambar_sesudah')->nullable();
            $table->text('prediksi_penyebab')->nullable();
            $table->text('tindakan')->nullable();
            $table->text('hasil_kesimpulan')->nullable();
            $table->text('saran_solusi')->nullable();

            // Tracking & Relasi Pelengkap
            $table->unsignedBigInteger('modified_user')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign Key
            $table->foreign('id_work_order')
                ->references('id_work_order')
                ->on('tb_work_order')
                ->onDelete('set null'); // Jika tiket dihapus, data eksekusi (riwayat aset) tidak boleh ikut hilang
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('tb_work_data');
    }
};
