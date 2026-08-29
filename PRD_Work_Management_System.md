# PRODUCT REQUIREMENT DOCUMENT

# Work Management System (WMS)

### Sistem Manajemen Pekerjaan Terintegrasi Multi-Tenant untuk Perusahaan

**Target Pengguna:** Internal Perusahaan
**Tech Stack:** Laravel 13 · Inertia React · MySQL
**Desain:** Soft UI Evolution — Primary `#87CEEB` · Secondary `#3f7772` · Tertiary `#eee8a9`
**Versi:** 1.0 | Juli 2026
**Status Dokumen:** Draft untuk Review

---

## Informasi Dokumen

| Atribut               | Keterangan                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nama Produk           | Work Management System (WMS)                                                                                                                                                                                                          |
| Deskripsi Singkat     | Aplikasi internal untuk mengelola siklus penuh work order (permintaan pekerjaan), penjadwalan, pekerjaan harian karyawan, kolaborasi lintas department, serta manajemen inventaris dan tenant, dengan dukungan multi-tenant dan RBAC. |
| Referensi Desain Data | Entity Relationship Diagram (ERD) — lampiran gambar, tanggal 06 Januari 2026                                                                                                                                                          |
| Tech Stack            | Laravel 13 (Backend), Inertia.js + React (Frontend), MySQL (Database)                                                                                                                                                                 |
| Desain UI             | Soft UI Evolution (evolved neumorphism, kontras tinggi WCAG AA+) — primary #87CEEB, secondary #3f7772, tertiary #eee8a9                                                                                                               |
| Status Dokumen        | Draft untuk Review                                                                                                                                                                                                                    |

---

## Daftar Isi

1. [Business Process](#1-business-process)
2. [User Roles](#2-user-roles)
3. [Workflow Roles](#3-workflow-roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Security Requirement](#5-security-requirement)
6. [Integration Requirement](#6-integration-requirement)
7. [Infrastruktur Architecture](#7-infrastruktur-architecture)
8. [UAT & Maintenance](#8-uat--maintenance)

---

## 1. Business Process

### 1.1 Latar Belakang

Perusahaan membutuhkan sistem terpusat untuk mengelola seluruh permintaan pekerjaan (work order) yang selama ini dilakukan secara manual atau tersebar di berbagai kanal komunikasi. Work Management System (WMS) dibangun untuk mendigitalisasi proses permintaan, persetujuan, penjadwalan, eksekusi, hingga verifikasi pekerjaan, baik yang bersifat insidental (work order) maupun rutin (daily work), termasuk mendukung kolaborasi lintas department dan operasional multi-cabang (multi-tenant).

### 1.2 Ruang Lingkup Proses Bisnis

- Manajemen Work Order — pembuatan, review, assignment, eksekusi, dan verifikasi pekerjaan insidental.
- Manajemen Work Order Terjadwal (Work Planning) — penjadwalan pekerjaan yang bersifat normal dan dapat direncanakan.
- Work Data Management — pengolahan hasil pekerjaan (work order & daily) menjadi data kerja terstruktur sebagai inti pelaporan aplikasi.
- Lintas Department Work Order — permintaan bantuan pekerjaan ke department lain di luar department pemohon.
- Daily Work Management — pekerjaan harian karyawan yang ditetapkan oleh HOD, berjalan paralel dengan work order.
- Manajemen Tenant — pengelolaan data tenant/penyewa pada properti yang dikelola perusahaan.
- Multi-Tenant Platform — satu aplikasi dapat digunakan oleh banyak cabang/perusahaan secara terisolasi.
- Role Based Access Control (RBAC) — pengaturan hak akses berjenjang menggunakan Spatie Laravel Permission.
- Notifikasi Realtime — pemberitahuan otomatis pada setiap perubahan status pekerjaan dan eskalasi keterlambatan.

### 1.3 Proses Bisnis Utama — Siklus Work Order

Proses bisnis inti aplikasi berpusat pada siklus hidup Work Order berikut:

1. Requester membuat Work Order dan menentukan kategori: **Normal** atau **Urgent**.
2. Jika kategori Urgent, requester memilih sub-kategori: **Urgent by Accident** atau **Urgent by Request Owner**. Work order urgent wajib dieksekusi langsung dan tidak dapat dijadwalkan.
3. Jika kategori Normal, work order dapat dieksekusi langsung atau dijadwalkan (masuk ke Work Planning).
4. Work Order tersimpan dan sistem mengirim notifikasi ke HOD terkait.
5. HOD melakukan review: menentukan eksekusi langsung atau penjadwalan (khusus kategori normal), kemudian melakukan assignment karyawan pelaksana beserta jumlah personel yang dibutuhkan.
6. Sistem mengirim notifikasi ke karyawan lapangan yang di-assign bahwa terdapat pekerjaan baru.
7. Karyawan pelaksana melaksanakan pekerjaan sesuai permintaan pada work order.
8. Karyawan submit hasil pekerjaan dan menunggu verifikasi dari HOD.
9. HOD melakukan verifikasi: jika terdapat revisi, work order dikembalikan ke karyawan untuk diperbaiki; jika disetujui, status work order menjadi **Selesai**.

### 1.4 Aturan Deadline & Eskalasi Otomatis

Setiap Work Order memiliki deadline otomatis yang dihitung sistem berdasarkan hari kerja, dengan ketentuan sebagai berikut:

| Ketentuan                             | Deskripsi                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Durasi Minimum                        | 3 hari kerja pengerjaan                                                                                                                                       |
| Durasi Maksimum                       | 6 hari kerja pengerjaan                                                                                                                                       |
| Keterlambatan Hari ke-3               | Status pekerjaan otomatis menjadi _On Progress_, deadline mulai berjalan, dan notifikasi keterlambatan dikirim ke Team Leader                                 |
| Keterlambatan Hari ke-5               | Notifikasi keterlambatan dikirim ke HOD                                                                                                                       |
| Keterlambatan Hari ke-6               | Notifikasi keterlambatan dikirim ke DGM / General Manager                                                                                                     |
| Perpanjangan (Extend) Work Order      | Maksimum 3 hari tambahan, wajib melalui approval berjenjang: Team Leader (jika ada) → HOD; atau langsung ke HOD apabila department tidak memiliki Team Leader |
| Perpanjangan Work Schedule (Planning) | Dapat di-extend oleh HOD, namun wajib mendapat approval dari DGM atau General Manager                                                                         |

> **Catatan:** Field jumlah personel wajib diisi pada setiap pembuatan Work Order untuk kebutuhan alokasi sumber daya oleh HOD.

### 1.5 Proses Bisnis Pendukung

**1.5.1 Daily Work Management**
Setiap karyawan memiliki pekerjaan harian yang ditetapkan oleh HOD melalui modul Work Daily. Pekerjaan harian berjalan independen namun tetap tercatat pada Work Data sebagai bagian dari beban kerja karyawan, terpisah dari alur Work Order insidental.

**1.5.2 Work Data Management**
Modul ini merupakan inti pengolahan data aplikasi. Setiap Work Order dan Work Daily yang telah selesai diproses akan diringkas menjadi Work Data, mencakup gambar sebelum/sesudah pekerjaan, prediksi penyebab, tindakan, hasil kesimpulan, saran solusi, serta keterkaitan dengan data inventaris (kode inventory) dan tenant terkait bila relevan.

**1.5.3 Lintas Department Work Order**
Requester dari suatu department dapat mengajukan work order dengan menunjuk department tujuan yang berbeda dari department asalnya, untuk meminta bantuan pengerjaan lintas fungsi. Notifikasi dan alur approval mengikuti department pemilik/tujuan work order, bukan department asal requester.

**1.5.4 Manajemen Tenant & Multi-Tenant**
Manajemen Tenant mencatat data penyewa (nama tenant, perusahaan, lokasi, area, kategori) yang dapat menjadi objek atau referensi pada Work Order maupun Work Data. Terpisah dari itu, kapabilitas Multi-Tenant Platform memungkinkan aplikasi digunakan oleh beberapa cabang/entitas perusahaan berbeda dalam satu instalasi, dengan isolasi data antar cabang.

---

## 2. User Roles

Pengelolaan peran menggunakan Role Based Access Control (RBAC) berbasis package **Spatie Laravel Permission**, sehingga peran dan hak akses bersifat dinamis dan dapat dikonfigurasi oleh Super Admin. Berikut peran baku (default role) yang direkomendasikan:

| Role                                   | Deskripsi                                                        | Cakupan Akses Utama                                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Super Admin                            | Pengelola sistem tingkat pusat, mengatur seluruh tenant/cabang   | Full access seluruh modul, manajemen tenant, manajemen role & permission, konfigurasi sistem                                                             |
| Admin Tenant / Cabang                  | Administrator pada level cabang/tenant tertentu                  | Manajemen master data (divisi, department, karyawan, user) dalam lingkup tenant-nya                                                                      |
| General Manager (GM) / Deputy GM (DGM) | Manajemen puncak operasional                                     | Menerima eskalasi keterlambatan hari ke-6, approval perpanjangan Work Schedule, monitoring seluruh work order & laporan                                  |
| HOD (Head of Department)               | Kepala department, pemilik proses persetujuan work order         | Review & assign work order, penjadwalan, verifikasi hasil pekerjaan, approval extend work order (jika tanpa Team Leader), menetapkan daily work karyawan |
| Team Leader                            | Koordinator lapangan di bawah HOD                                | Menerima notifikasi keterlambatan hari ke-3, approval awal permintaan extend sebelum diteruskan ke HOD                                                   |
| Karyawan / Employee (Requester)        | Seluruh karyawan yang dapat mengajukan permintaan pekerjaan      | Membuat work order, memantau status pekerjaan yang diajukan                                                                                              |
| Karyawan Pelaksana / Field Staff       | Karyawan yang di-assign untuk mengerjakan work order/daily work  | Menerima notifikasi assignment, mengerjakan, submit hasil pekerjaan (foto sebelum/sesudah, keterangan)                                                   |
| Staff Administrasi Surat               | Petugas administrasi korespondensi                               | Mengelola surat masuk dan surat keluar terkait pekerjaan                                                                                                 |
| Viewer / Auditor                       | Pihak yang memerlukan akses baca untuk keperluan audit/pelaporan | Akses read-only ke laporan dan riwayat pekerjaan                                                                                                         |

> **Catatan:** Role di atas merupakan baseline. Karena RBAC bersifat dinamis (Spatie Permission), Super Admin dapat menambah role baru maupun menyesuaikan permission per modul (create, read, update, delete, assign, approve, verify) sesuai kebutuhan operasional masing-masing tenant.

---

## 3. Workflow Roles

Bagian ini menjelaskan peran setiap aktor dalam alur kerja (workflow) Work Order secara end-to-end, termasuk jalur eskalasi keterlambatan dan mekanisme perpanjangan (extend).

### 3.1 Diagram Alur Peran (Deskriptif)

1. **Requester** → membuat Work Order (pilih Normal/Urgent, isi jumlah personel, department tujuan).
2. **Sistem** → menyimpan data & mengirim notifikasi ke HOD department tujuan.
3. **HOD** → menentukan eksekusi langsung atau dijadwalkan (khusus Normal), lalu assign karyawan pelaksana.
4. **Sistem** → mengirim notifikasi assignment ke karyawan pelaksana.
5. **Karyawan Pelaksana** → mengerjakan pekerjaan, submit hasil (dokumentasi & keterangan).
6. **HOD** → memverifikasi hasil pekerjaan: Approve (selesai) atau Reject/Revisi (kembali ke karyawan pelaksana).
7. **Team Leader** → menerima notifikasi eskalasi pada keterlambatan hari ke-3, dan menjadi approval tingkat pertama untuk permintaan extend.
8. **HOD** → menerima eskalasi keterlambatan hari ke-5 dan bertindak sebagai approval extend jika department tidak memiliki Team Leader, atau approval tingkat kedua jika memiliki Team Leader.
9. **DGM/GM** → menerima eskalasi keterlambatan hari ke-6, serta menjadi approval wajib untuk perpanjangan Work Schedule (Work Planning).

### 3.2 Matriks Peran per Tahapan Workflow

| Tahapan               | Aktor / Role                            | Aksi                                                                       |
| --------------------- | --------------------------------------- | -------------------------------------------------------------------------- |
| Pengajuan             | Requester (Karyawan)                    | Create Work Order, pilih kategori & department tujuan, isi jumlah personel |
| Notifikasi Masuk      | System → HOD                            | Notifikasi realtime work order baru                                        |
| Review & Keputusan    | HOD                                     | Tentukan direct execution / schedule (normal), tetapkan prioritas & level  |
| Assignment            | HOD                                     | Assign karyawan pelaksana & jumlah personel                                |
| Notifikasi Assignment | System → Karyawan Pelaksana             | Notifikasi pekerjaan baru diterima                                         |
| Eksekusi              | Karyawan Pelaksana                      | Mengerjakan pekerjaan sesuai instruksi work order                          |
| Submit Hasil          | Karyawan Pelaksana                      | Upload dokumentasi, isi keterangan hasil pekerjaan                         |
| Verifikasi            | HOD                                     | Approve (selesai) atau Reject (revisi, kembali ke karyawan)                |
| Eskalasi H+3          | System → Team Leader                    | Notifikasi keterlambatan, status On Progress berjalan                      |
| Eskalasi H+5          | System → HOD                            | Notifikasi keterlambatan tingkat lanjut                                    |
| Eskalasi H+6          | System → DGM/GM                         | Notifikasi keterlambatan kritis                                            |
| Extend Work Order     | Team Leader → HOD (approval berjenjang) | Approval perpanjangan maksimal 3 hari                                      |
| Extend Work Schedule  | HOD → DGM/GM (approval)                 | Approval perpanjangan jadwal Work Planning                                 |

### 3.3 Alur Daily Work Management

1. HOD menetapkan daftar pekerjaan harian (daily work) untuk setiap karyawan di departmentnya.
2. Karyawan menerima notifikasi daily work dan mengerjakan bersamaan dengan potensi work order yang di-assign.
3. Karyawan submit status pekerjaan harian (Open, On Progress, Selesai) yang tercatat pada Work Data.

---

## 4. Functional Requirements

Kebutuhan fungsional dipetakan berdasarkan modul aplikasi dan entitas data pada ERD (Entity Relationship Diagram) yang telah disiapkan.

### 4.1 Modul Master Data & Organisasi

| ID    | Fitur                        | Deskripsi                                                                        | Tabel Terkait |
| ----- | ---------------------------- | -------------------------------------------------------------------------------- | ------------- |
| FR-01 | Manajemen Divisi             | CRUD data divisi perusahaan (nama divisi, department, ekstensi telepon)          | tb_divisi     |
| FR-02 | Manajemen Department         | CRUD data department, termasuk penetapan HOD per department                      | tb_department |
| FR-03 | Manajemen Karyawan           | CRUD data karyawan (NIK, nama, jabatan, call sign, status karyawan, foto profil) | tb_karyawan   |
| FR-04 | Manajemen User & Akses Login | CRUD akun user, pengaturan hak akses (role), status aktif, riwayat login         | tb_user       |

### 4.2 Modul Manajemen Work Order

| ID    | Fitur                                 | Deskripsi                                                                                                                                                               | Tabel Terkait               |
| ----- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| FR-05 | Create Work Order                     | Requester membuat work order baru: kategori (Normal/Urgent), sub-kategori urgent (Accident/Owner Request), department tujuan, jumlah personel, lokasi, prioritas, level | tb_work_order               |
| FR-06 | Update Work Order                     | Mengubah detail work order sebelum/selama proses berjalan sesuai kewenangan role                                                                                        | tb_work_order               |
| FR-07 | Review & Assign Work Order            | HOD melakukan review, menentukan eksekusi langsung/jadwal, dan assign karyawan pelaksana (PIC)                                                                          | tb_work_order               |
| FR-08 | Verifikasi & Approval Hasil Pekerjaan | HOD memverifikasi submission hasil pekerjaan, approve atau reject/revisi                                                                                                | tb_work_order, tb_work_data |
| FR-09 | Deadline Otomatis & Eskalasi          | Sistem menghitung deadline otomatis (3–6 hari kerja) dan memicu notifikasi eskalasi bertingkat (H+3, H+5, H+6)                                                          | tb_work_order               |
| FR-10 | Extend Work Order                     | Pengajuan & approval berjenjang perpanjangan waktu pengerjaan maksimal 3 hari                                                                                           | tb_work_order               |
| FR-11 | Risalah Meeting & Business Plan       | Pencatatan risalah dan rencana kerja terkait work order berskala besar                                                                                                  | tb_work_order               |

### 4.3 Modul Work Order Terjadwal (Work Planning)

| ID    | Fitur                    | Deskripsi                                                                                                         | Tabel Terkait    |
| ----- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| FR-12 | Penjadwalan Work Order   | Membuat jadwal pengerjaan untuk work order berkategori Normal, termasuk tanggal mulai, lama pekerjaan, dan budget | tb_work_planning |
| FR-13 | Extend Jadwal Pekerjaan  | HOD mengajukan perpanjangan jadwal, wajib approval DGM/GM                                                         | tb_work_planning |
| FR-14 | Monitoring Status Jadwal | Melihat status pekerjaan terjadwal (prioritas, level, PIC, lokasi pengerjaan)                                     | tb_work_planning |

### 4.4 Modul Work Data Management

| ID    | Fitur                           | Deskripsi                                                                                                                                                 | Tabel Terkait                         |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| FR-15 | Pengolahan Data Kerja           | Mengolah hasil work order/daily work menjadi data kerja terstruktur: dokumentasi sebelum & sesudah, prediksi penyebab, tindakan, kesimpulan, saran solusi | tb_work_data                          |
| FR-16 | Alokasi Pekerja pada Data Kerja | Mencatat karyawan yang terlibat dalam suatu pekerjaan pada level data kerja                                                                               | tb_work_data_pekerja                  |
| FR-17 | Penjadwalan Data Kerja (WD)     | Mengelola jadwal aktivitas kerja terkait status aktif, tipe schedule, dan rincian pekerjaan                                                               | tb_schedule_wd                        |
| FR-18 | Keterkaitan Inventaris & Tenant | Menghubungkan data kerja dengan kode inventaris dan tenant terkait bila relevan                                                                           | tb_work_data, tb_inventory, tb_tenant |

### 4.5 Modul Lintas Department

| ID    | Fitur                                | Deskripsi                                                                                | Tabel Terkait                                             |
| ----- | ------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| FR-19 | Pemilihan Department Tujuan          | Requester dapat memilih department lain sebagai tujuan permintaan bantuan pekerjaan      | tb_work_order (fld_department, fld_department_pemilik_wo) |
| FR-20 | Routing Notifikasi Lintas Department | Notifikasi dan hak approval mengikuti department tujuan, bukan department asal requester | tb_work_order                                             |

### 4.6 Modul Daily Work Management

| ID    | Fitur                          | Deskripsi                                                                         | Tabel Terkait |
| ----- | ------------------------------ | --------------------------------------------------------------------------------- | ------------- |
| FR-21 | Penetapan Pekerjaan Harian     | HOD menetapkan daftar pekerjaan harian untuk karyawan di departmentnya            | tb_work_daily |
| FR-22 | Update Status Pekerjaan Harian | Karyawan memperbarui status pekerjaan harian (status pekerjaan, prioritas, level) | tb_work_daily |

### 4.7 Modul Inventory

| ID    | Fitur                    | Deskripsi                                                                                                 | Tabel Terkait                    |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR-23 | Manajemen Data Barang    | CRUD data inventaris: kode barang, kelompok barang, spesifikasi, penanggung jawab, kondisi, lokasi barang | tb_inventory, tb_kelompok_barang |
| FR-24 | Kolom Dinamis Inventaris | Menyediakan kolom data tambahan (custom field) yang dapat dikonfigurasi per jenis barang                  | tb_inventory_expand_data         |

### 4.8 Modul Manajemen Tenant & Multi-Tenant

| ID    | Fitur                     | Deskripsi                                                                            | Tabel Terkait           |
| ----- | ------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| FR-25 | CRUD Data Tenant          | Mengelola data penyewa: nama tenant, perusahaan, lokasi, area, kategori, status      | tb_tenant               |
| FR-26 | Isolasi Data Multi-Tenant | Aplikasi dapat digunakan lintas cabang dengan data yang terisolasi per tenant/cabang | Seluruh entitas relevan |

### 4.9 Modul Korespondensi (Surat)

| ID    | Fitur                  | Deskripsi                                                                                       | Tabel Terkait   |
| ----- | ---------------------- | ----------------------------------------------------------------------------------------------- | --------------- |
| FR-27 | Manajemen Surat Masuk  | Pencatatan surat masuk terkait pekerjaan: nomor agenda, pengirim, perihal, sifat, tindak lanjut | tb_surat_masuk  |
| FR-28 | Manajemen Surat Keluar | Pencatatan surat keluar terkait pekerjaan dengan struktur data setara surat masuk               | tb_surat_keluar |

### 4.10 Modul Notifikasi & RBAC

| ID    | Fitur                     | Deskripsi                                                                                                                         | Tabel Terkait          |
| ----- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-29 | Notifikasi Realtime       | Notifikasi instan untuk setiap perubahan status: work order baru, assignment, verifikasi, eskalasi keterlambatan, approval extend | Seluruh modul workflow |
| FR-30 | Role Based Access Control | Pengaturan role & permission dinamis menggunakan Spatie Laravel Permission, termasuk pembatasan akses per tenant                  | tb_user                |

---

## 5. Security Requirement

### 5.1 Autentikasi & Otorisasi

- Autentikasi menggunakan session-based authentication Laravel (cocok dengan Inertia) dengan proteksi CSRF token pada seluruh request.
- Password disimpan menggunakan hashing bcrypt/argon2, tidak pernah disimpan dalam bentuk plain text.
- Otorisasi berbasis RBAC menggunakan Spatie Laravel Permission — setiap endpoint dan aksi (create, review, assign, verify, approve) diproteksi middleware permission.
- Mekanisme lock akun / rate limiting pada percobaan login gagal berulang untuk mencegah brute force.
- Pencatatan status login dan histori login user (fld_login_status, fld_tanggal_login) untuk monitoring aktivitas akun.

### 5.2 Keamanan Data Multi-Tenant

- Isolasi data antar tenant pada level query (tenant scoping) untuk mencegah kebocoran data lintas cabang.
- Validasi kepemilikan tenant pada setiap request API untuk mencegah horizontal privilege escalation.

### 5.3 Audit Trail & Integritas Data

- Setiap entitas mencatat metadata create_date, create_id_user, modified_date, modified_id_user secara konsisten sesuai struktur ERD.
- Implementasi soft delete (status_hapus) untuk menjaga jejak data dan mendukung kebutuhan audit/pemulihan.
- Log aktivitas kritikal (approval, extend, verifikasi) untuk keperluan investigasi dan kepatuhan internal.

### 5.4 Keamanan Aplikasi

- Validasi input di sisi server (Form Request Validation Laravel) untuk seluruh form, termasuk upload dokumentasi pekerjaan.
- Pembatasan tipe dan ukuran file pada upload gambar/scan surat, disertai pemindaian dasar terhadap file berbahaya.
- Proteksi terhadap SQL Injection melalui penggunaan Eloquent ORM/Query Builder Laravel.
- Proteksi terhadap XSS melalui escaping otomatis pada rendering React/Inertia.
- Enforced HTTPS/TLS untuk seluruh komunikasi client-server.

### 5.5 Keamanan Infrastruktur

- Backup database terjadwal (harian) dengan retensi sesuai kebijakan perusahaan.
- Pemisahan environment production, staging, dan development.
- Pembatasan akses server melalui firewall dan VPN untuk kebutuhan administrasi.

---

## 6. Integration Requirement

### 6.1 Realtime Notification

Notifikasi realtime diimplementasikan menggunakan WebSocket (Laravel Reverb atau Pusher-compatible driver) yang terintegrasi dengan Laravel Broadcasting, dipicu oleh event pada setiap perubahan status work order, assignment, eskalasi keterlambatan, dan approval extend.

### 6.2 Queue & Background Job

Proses pengecekan deadline harian dan pemicu eskalasi (H+3, H+5, H+6) dijalankan melalui Laravel Scheduler dan diproses secara asynchronous menggunakan Queue Worker (Redis/Database driver) agar tidak membebani proses utama aplikasi.

### 6.3 Integrasi Penyimpanan File

Dokumentasi pekerjaan (foto sebelum/sesudah), berkas inventaris, dan scan surat disimpan melalui Laravel Filesystem, dengan opsi local storage untuk on-premise atau S3-compatible object storage untuk skala multi-tenant/multi-cabang.

### 6.4 Integrasi Notifikasi Tambahan (Opsional)

- Integrasi email (SMTP) sebagai kanal notifikasi cadangan untuk eskalasi tingkat HOD ke atas.
- Integrasi WhatsApp/SMS Gateway (opsional, fase berikutnya) untuk eskalasi kritikal ke DGM/GM.

### 6.5 Integrasi Eksternal (Rencana Pengembangan)

- API terbuka (RESTful) untuk kebutuhan integrasi dengan aplikasi mobile pada fase pengembangan berikutnya.
- Potensi integrasi dengan sistem HRIS perusahaan untuk sinkronisasi data karyawan dan struktur organisasi.

---

## 7. Infrastruktur Architecture

### 7.1 Tech Stack

| Layer             | Teknologi                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Backend Framework | Laravel 13 (PHP)                                                                                                    |
| Frontend          | Inertia.js + React                                                                                                  |
| Database          | MySQL                                                                                                               |
| Realtime          | Laravel Broadcasting + Reverb / Pusher-compatible WebSocket                                                         |
| Queue & Scheduler | Laravel Queue (Redis/Database driver) + Laravel Scheduler untuk job eskalasi harian                                 |
| Authorization     | Spatie Laravel Permission (RBAC)                                                                                    |
| File Storage      | Local Storage / S3-compatible Object Storage                                                                        |
| UI Styling        | Soft UI Evolution design system — soft shadow elevation, rounded corners 10–30px, kontras WCAG AA+, primary #87CEEB |

### 7.2 Design System — Soft UI Evolution

Tampilan aplikasi mengikuti spesifikasi _Soft UI Evolution_ (versi alpha, designmd.app) sebagai berikut:

| Aspek            | Ketentuan                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Warna            | Primary `#87CEEB`, Secondary `#3f7772`, Tertiary `#eee8a9` — saturasi dibatasi maks. 80%, tanpa warna hitam pekat (`#000000`)                            |
| Tipografi        | System UI stack; H1 2.25rem/700, Body 1rem/400 (16px, line-height 1.6, maks 72ch/baris), Label 0.75rem/500                                               |
| Radius Sudut     | Small 10px, Medium 20px, Large 30px                                                                                                                      |
| Elevasi/Bayangan | Soft shadow (bukan flat, bukan neumorphism ekstrem), durasi transisi 200–300ms, easing ease-out                                                          |
| Layout           | CSS Grid, max-width 1280px, hero split-screen, fitur zig-zag (bukan 3-kolom setara), collapse penuh di bawah 768px                                       |
| Komponen         | Tombol primary rounded 10px dengan hover darken 8% + shadow lift; card rounded 10px dengan shadow tipis; input label di atas field dengan focus ring 2px |
| Aksesibilitas    | Kontras memenuhi WCAG AA/AAA, focus state selalu terlihat, tanpa emoji di UI (gunakan icon set seperti Lucide/Heroicons)                                 |
| Motion           | Fade + translate-Y 16px→0 (420ms) untuk entry animation, stagger 80ms antar item list; hanya `transform` & `opacity` yang dianimasikan                   |

> **Catatan:** Style ini menggantikan pendekatan Glassmorphism pada draft sebelumnya. Referensi lengkap tersedia pada berkas `Design.md` yang dilampirkan.

### 7.3 Gambaran Arsitektur Sistem

Arsitektur aplikasi mengikuti pola monolithic modular berbasis Laravel dengan pemisahan layer sebagai berikut:

1. **Client Layer** — Browser/aplikasi web berbasis React yang dirender melalui Inertia.js, berkomunikasi dengan backend melalui request Inertia dan koneksi WebSocket untuk notifikasi realtime.
2. **Application Layer** — Laravel 13 menangani business logic, validasi, autorisasi (RBAC), serta orkestrasi proses workflow work order dan eskalasi.
3. **Queue & Scheduler Layer** — Worker terpisah menjalankan job asynchronous (pengiriman notifikasi, pengecekan deadline harian) tanpa mengganggu response time aplikasi utama.
4. **Data Layer** — MySQL sebagai database utama menyimpan seluruh entitas transaksional dan master data sesuai ERD, dengan strategi multi-tenant single-database (tenant scoping melalui relasi tb_tenant).
5. **Storage Layer** — Penyimpanan file dokumentasi pekerjaan, gambar barang, dan scan surat, terpisah dari database untuk efisiensi.

### 7.4 Strategi Multi-Tenant

Mengingat kebutuhan penggunaan lintas cabang, arsitektur data direkomendasikan menggunakan pendekatan **single database dengan tenant scoping** (shared database, shared schema), di mana entitas-entitas utama terhubung ke tb_tenant/tb_department sebagai pembeda cabang. Pendekatan ini dipilih untuk efisiensi maintenance dibanding pendekatan database-per-tenant, dengan tetap menjamin isolasi data melalui global scope pada level aplikasi (Laravel Model Global Scope).

### 7.5 Lingkungan Deployment

| Environment | Fungsi                                                       |
| ----------- | ------------------------------------------------------------ |
| Development | Pengembangan fitur oleh tim engineering                      |
| Staging     | Pengujian internal (SIT) dan User Acceptance Testing (UAT)   |
| Production  | Lingkungan operasional aktif digunakan seluruh tenant/cabang |

- Web server: Nginx sebagai reverse proxy ke PHP-FPM.
- Load balancer direkomendasikan untuk skala multi-cabang dengan traffic tinggi.
- Monitoring server & aplikasi menggunakan tools observability standar (mis. log aggregator, uptime monitoring).
- Backup otomatis database dan storage terjadwal harian.

---

## 8. UAT & Maintenance

### 8.1 Tujuan User Acceptance Testing (UAT)

UAT bertujuan memastikan seluruh fitur berjalan sesuai kebutuhan bisnis riil, khususnya alur workflow work order, eskalasi keterlambatan, dan mekanisme approval berjenjang, sebelum aplikasi dinyatakan siap digunakan di lingkungan production.

### 8.2 Skenario UAT Utama

| No  | Skenario                                                                   | Kriteria Sukses                                                                             |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Requester membuat Work Order kategori Normal dan memilih untuk dijadwalkan | Work order tersimpan, notifikasi diterima HOD, dapat dipindahkan ke Work Planning           |
| 2   | Requester membuat Work Order kategori Urgent (Accident)                    | Work order tidak dapat dijadwalkan, langsung masuk status eksekusi, notifikasi diterima HOD |
| 3   | HOD melakukan assignment karyawan pelaksana                                | Karyawan menerima notifikasi realtime pekerjaan baru                                        |
| 4   | Karyawan submit hasil pekerjaan lalu HOD reject (revisi)                   | Status kembali ke karyawan, histori revisi tercatat                                         |
| 5   | Work order melewati deadline hari ke-3 tanpa penyelesaian                  | Status otomatis On Progress, notifikasi terkirim ke Team Leader                             |
| 6   | Work order melewati deadline hari ke-5                                     | Notifikasi eskalasi terkirim ke HOD                                                         |
| 7   | Work order melewati deadline hari ke-6                                     | Notifikasi eskalasi terkirim ke DGM/GM                                                      |
| 8   | Pengajuan extend work order pada department dengan Team Leader             | Approval berjenjang: Team Leader → HOD, maksimal tambahan 3 hari                            |
| 9   | Pengajuan extend work order pada department tanpa Team Leader              | Approval langsung ke HOD, maksimal tambahan 3 hari                                          |
| 10  | HOD mengajukan extend Work Schedule (Work Planning)                        | Wajib approval DGM/GM sebelum jadwal berubah                                                |
| 11  | Requester mengajukan work order lintas department                          | Notifikasi dan hak assignment mengikuti department tujuan                                   |
| 12  | Login user dari tenant berbeda                                             | Data yang tampil hanya milik tenant terkait (isolasi data terverifikasi)                    |
| 13  | User tanpa permission mengakses fitur approval                             | Sistem menolak akses (403) sesuai RBAC                                                      |

### 8.3 Proses UAT

1. Persiapan test case dan data uji pada lingkungan staging.
2. Pelaksanaan pengujian oleh perwakilan user (HOD, Team Leader, Karyawan, Admin) sesuai skenario.
3. Pencatatan bug/temuan melalui issue tracker dan klasifikasi tingkat severitas (Critical, Major, Minor).
4. Perbaikan oleh tim development dan retest hingga seluruh skenario kritikal lulus.
5. Sign-off UAT oleh perwakilan manajemen (HOD/DGM/GM) sebagai syarat go-live.

### 8.4 Maintenance & Support

| Kategori                                    | Target SLA     | Keterangan                                                    |
| ------------------------------------------- | -------------- | ------------------------------------------------------------- |
| Bug Critical (aplikasi down / data corrupt) | ≤ 4 jam        | Penanganan prioritas tertinggi, hotfix langsung ke production |
| Bug Major (fitur utama tidak berfungsi)     | ≤ 1 hari kerja | Termasuk gangguan pada alur approval/notifikasi               |
| Bug Minor (tampilan/kosmetik)               | ≤ 3 hari kerja | Dijadwalkan pada rilis berikutnya                             |
| Permintaan Fitur Baru                       | Sesuai roadmap | Melalui proses change request dan prioritisasi backlog        |

**8.4.1 Aktivitas Maintenance Berkala**

- Monitoring performa aplikasi dan server secara berkelanjutan.
- Backup database & storage terjadwal, dengan uji pemulihan (restore test) berkala.
- Patch keamanan (security update) framework dan dependensi secara rutin.
- Review log eskalasi dan notifikasi untuk memastikan job scheduler berjalan sesuai ketentuan (H+3, H+5, H+6).
- Evaluasi berkala terhadap kebutuhan penambahan role/permission baru seiring pertumbuhan organisasi/tenant.
