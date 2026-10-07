# PRD: Work Management System (WMS)

**Versi:** 1.1 **Stack:** Laravel 13 + Inertia React + MySQL, RBAC via Spatie Laravel Permission, multi-cabang via package **spatie/laravel-multitenancy v4** (mode single-database — trait `BelongsToTenant` + kolom `tenant_id` + identifikasi path) **Status:** Aktif — Open Question Round 1–3 SETTLED, Round 4 memutuskan cakupan & paket tenancy; OQ 12 (konsolidasi model `Tenant`/`Tenants`) masih terbuka **Cakupan:** PRD ini mendeskripsikan proyek **opti-work2** secara langsung. Fitur wajib ada: Work Order, Work Order Terjadwal + Eskalasi, Work Data, Lintas Department, Daily Work, RBAC, Realtime Notification, **Tenant/Cabang CRUD**, **Inventory + Kelompok Barang**, dan **integrasi WhatsApp (WAHA)**. Surat Masuk/Keluar tetap di luar cakupan.

---

## 1. Problem Statement

Saat ini pengelolaan pekerjaan internal (perbaikan, pemeliharaan, permintaan bantuan antar-department) berjalan tanpa sistem terpusat. Akibatnya:

- **Requester** (karyawan yang butuh bantuan department lain) tidak punya cara terstruktur untuk mengajukan pekerjaan dan melacak statusnya — permintaan kemungkinan besar berjalan via chat/lisan sehingga mudah hilang atau terlupa.
- **HOD (Head of Department)** tidak punya visibilitas terpusat atas beban kerja timnya, sehingga assignment pekerjaan dan keputusan jadwal vs eksekusi langsung dilakukan tanpa data yang jelas.
- **Karyawan lapangan** menerima pekerjaan tanpa notifikasi sistematis dan tanpa cara standar untuk submit hasil pekerjaan/bukti penyelesaian.
- **Manajemen (DGM/GM)** tidak punya mekanisme otomatis untuk tahu pekerjaan mana yang terlambat sampai eskalasi manual terjadi — risiko keterlambatan pekerjaan kritikal tidak terdeteksi dini.
- Tidak ada audit trail: siapa assign siapa, kapan revisi diminta, kapan deadline di-extend dan oleh siapa disetujui.

Yang dirugikan: seluruh rantai kerja lintas department (Requester → HOD → karyawan lapangan → manajemen), karena tidak ada single source of truth untuk status pekerjaan dan tidak ada eskalasi otomatis saat SLA terlanggar.

---

## 2. Target User — 2 Persona

**Persona 1: Budi — Head of Department (HOD)**

- Menerima Work Order masuk dari department lain maupun dari timnya sendiri.
- Harus memutuskan: eksekusi langsung atau dijadwalkan (khusus WO normal), lalu assign ke karyawan.
- Perlu memantau WO yang mendekati/melewati deadline timnya, approve/reject extend, verifikasi hasil pekerjaan sebelum WO ditutup.
- Pain point saat ini: tidak tahu beban kerja real-time tim, approval extend tidak tercatat.

**Persona 2: Sari — Karyawan Lapangan (Field Worker)**

- Menerima notifikasi saat di-assign ke WO/Daily Work.
- Mengerjakan pekerjaan, submit hasil (foto sebelum/sesudah, catatan) untuk diverifikasi HOD.
- Punya Daily Work rutin (template harian) di luar WO yang di-assign.
- Pain point saat ini: tidak ada daftar tugas harian terpusat, tidak jelas prioritas antara WO baru vs Daily Work rutin.

_(Role lain yang ikut terdampak sistem: Requester (**bukan role eksklusif** — setiap user terautentikasi berpotensi jadi Requester, keputusan Round 1), Team Leader (penerima notifikasi telat tahap 1), DGM/GM (eskalasi tahap akhir), **Super Admin** (pengelola konfigurasi sistem/RBAC), **Admin Tenant/Cabang** (manajemen master data dalam lingkup cabangnya), **Viewer/Auditor** (read-only monitoring). **Direksi ditunda** — tidak dibuat sampai ada kebutuhan nyata; Super Admin setara pengelola konfigurasi (keputusan Round 1, lihat §10 OQ 11).)_

---

## 3. Goals & Non-Goals

**Goals (MVP):**

- Satu sistem terpusat untuk membuat, assign, menjadwalkan, mengerjakan, dan menutup Work Order — termasuk lintas department.
- Eskalasi keterlambatan otomatis dan berjenjang (Team Leader → HOD → DGM/GM) tanpa intervensi manual.
- Setiap karyawan lapangan punya visibilitas Daily Work (template rutin + tugas tambahan) terpisah dari WO.
- Notifikasi realtime untuk setiap perubahan status yang relevan ke role terkait (in-app + WhatsApp/WAHA).
- Kontrol akses berbasis role/permission (Spatie) sehingga setiap role hanya melihat/melakukan aksi yang relevan dengan wewenangnya.
- Data pekerjaan (Work Data Management) tercatat rapi sebagai riwayat/histori tiap WO.
- Manajemen cabang (Tenant/Cabang CRUD) sebagai batas isolasi data multi-cabang.

**Non-Goals:**

- Modul Surat Masuk/Keluar — tetap **tidak** masuk produk ini.
- Integrasi eksternal selain WhatsApp/WAHA (email gateway, sistem absensi, dsb) — ditunda.
- Analytics/reporting dashboard lanjutan (selain kebutuhan minimal untuk memantau SLA) — ditunda.

---

## 4. User Stories

**Work Order — Requester**

- Sebagai Requester, saya ingin membuat Work Order dengan memilih kategori (Normal / Urgent by Accident / Urgent Request by Owner), supaya jenis penanganan dan jalur approval yang sesuai otomatis berlaku.
- Sebagai Requester, saya ingin melihat status WO yang saya buat secara realtime, supaya saya tahu progresnya tanpa harus bertanya manual.

**Work Order — HOD**

- Sebagai HOD, saya ingin menerima notifikasi saat WO baru masuk ke department saya, supaya saya bisa segera memutuskan eksekusi langsung atau dijadwalkan.
- Sebagai HOD, saya ingin assign karyawan ke WO, supaya pekerjaan jelas penanggung jawabnya.
- Sebagai HOD, saya ingin memverifikasi hasil pekerjaan yang disubmit karyawan dan meminta revisi bila perlu, supaya kualitas pekerjaan terjaga sebelum WO ditutup.
- Sebagai HOD, saya ingin mengajukan extend deadline WO yang telat (maks 3 hari tambahan), supaya keterlambatan wajar bisa ditangani sesuai proses approval berjenjang.

**Work Order — Karyawan Lapangan**

- Sebagai karyawan lapangan, saya ingin menerima notifikasi saat di-assign ke WO baru, supaya saya segera tahu ada pekerjaan.
- Sebagai karyawan lapangan, saya ingin submit hasil pekerjaan (foto, catatan) langsung dari sistem, supaya HOD bisa memverifikasi tanpa proses manual.

**Work Order Terjadwal**

- Sebagai HOD, saya ingin menjadwalkan WO normal (bukan urgent by accident) ke tanggal tertentu, supaya beban kerja tim bisa diatur.
- Sebagai HOD, saya ingin mengajukan extend Work Schedule dengan approval DGM/GM, supaya perubahan jadwal tetap terkontrol di level manajemen.

**Lintas Department**

- Sebagai Requester, saya ingin memilih department tujuan saat membuat WO, supaya permintaan bantuan lintas department langsung sampai ke HOD yang tepat.

**Daily Work Management**

- Sebagai karyawan, saya ingin melihat daftar tugas harian rutin saya (template) beserta tugas tambahan yang di-assign HOD, supaya saya tahu prioritas kerja hari itu.
- Sebagai HOD, saya ingin menambahkan tugas harian di luar template rutin ke karyawan tertentu, supaya kebutuhan mendadak tetap tercatat sebagai bagian dari beban kerja harian.

**Eskalasi & Notifikasi**

- Sebagai Team Leader, saya ingin menerima notifikasi saat WO tim saya telat 3 hari kerja, supaya saya bisa menindaklanjuti sebelum eskalasi naik ke HOD.
- Sebagai HOD, saya ingin menerima notifikasi saat WO telat 5 hari kerja, supaya saya bisa mengambil tindakan sebelum eskalasi ke DGM/GM.
- Sebagai DGM/GM, saya ingin menerima notifikasi saat WO telat 6 hari kerja, supaya saya bisa melakukan intervensi di level tertinggi.

**RBAC**

- Sebagai Admin sistem, saya ingin mengatur role dan permission per user, supaya setiap role hanya bisa melakukan aksi sesuai wewenangnya.

**Tenant/Cabang**

- Sebagai Super Admin, saya ingin mengelola data cabang (Tenant) agar data tiap cabang terisolasi dan dapat dipantau terpisah.

**Inventory & Kelompok Barang**

- Sebagai user berwenang, saya ingin mengelola data barang (inventory) dan kelompok barang agar aset dapat dilacak dan dihubungkan ke pekerjaan.

---

## 5. Daftar Fitur — MVP / v2 / Nanti

| Fitur                                                     | Kategori                                            |
| --------------------------------------------------------- | --------------------------------------------------- |
| Work Order (Create/Update/Review/Assign)                  | **MVP**                                             |
| Work Order Terjadwal (planning + eksekusi)                | **MVP**                                             |
| Work Data Management (histori/riwayat pekerjaan per WO)   | **MVP**                                             |
| Lintas Department Workorder                               | **MVP**                                             |
| Daily Work Management (template rutin + tugas tambahan)   | **MVP**                                             |
| RBAC (Spatie)                                             | **MVP**                                             |
| Realtime Notification                                     | **MVP**                                             |
| Eskalasi deadline berjenjang (Team Leader → HOD → DGM/GM) | **MVP** (bagian dari Work Order)                    |
| Extend deadline WO telat (approval berjenjang)            | **MVP**                                             |
| Extend Work Schedule (approval DGM/GM)                    | **MVP**                                             |
| Tenant/Cabang CRUD (management tenant)                    | **MVP**                                             |
| Inventory + Kelompok Barang                               | **MVP**                                             |
| Integrasi WhatsApp (WAHA)                                 | **MVP**                                             |
| Reporting/analytics dashboard lanjutan                    | **Nanti**                                           |
| Surat Masuk/Keluar                                        | **Tidak masuk produk ini**                          |

---

## 6. Functional Requirements — Detail per Fitur MVP

### 6.1 Work Order (Create/Update/Review/Assign)

- FR-1.1: Requester membuat WO dengan field minimal: department tujuan, kategori (Normal / Urgent by Accident / Urgent Request by Owner), jenis pekerjaan/kerusakan, prioritas, jumlah personel dibutuhkan, deskripsi, lampiran gambar.
- FR-1.2: Jika kategori = **Urgent by Accident** → sistem **tidak menampilkan opsi jadwal**, WO wajib masuk status "harus dieksekusi langsung".
- FR-1.3: Jika kategori = **Urgent Request by Owner** → sistem mengizinkan HOD memilih eksekusi langsung ATAU dijadwalkan.
- FR-1.4: Jika kategori = **Normal** → HOD memilih eksekusi langsung atau dijadwalkan.
- FR-1.5: Setelah WO tersimpan, sistem mengirim notifikasi realtime ke HOD department tujuan.
- FR-1.6: HOD melakukan assign 1 atau lebih karyawan ke WO; sistem mengirim notifikasi realtime ke karyawan yang di-assign.
- FR-1.7: Karyawan submit hasil pekerjaan (field: catatan hasil, foto/lampiran) → status WO berubah ke "menunggu verifikasi HOD".
- FR-1.8: HOD dapat approve (WO selesai/closed) atau reject dengan catatan revisi (status kembali ke karyawan, tidak reset deadline).
- FR-1.9: Setiap perubahan status WO tercatat di histori (siapa, kapan, aksi apa) — mendukung §6.3 Work Data Management.

### 6.2 Work Order Terjadwal + Eskalasi Deadline

- FR-2.1: Deadline otomatis dihitung dari **tanggal assign**, bukan tanggal submit WO. Urgent = **3 hari kerja**, Normal = **6 hari kerja**; kalender libur configurable via `config/holidays.php` (keputusan Round 2).
- FR-2.2: Jika pekerjaan berstatus "on progress" dan telat melewati deadline:
    - Hari telat ke-3 → notifikasi ke **Team Leader** department tsb (jika ada).
    - Hari telat ke-5 → notifikasi ke **HOD**.
    - Hari telat ke-6 → notifikasi ke **DGM/GM**.
- FR-2.3: WO yang telat dapat di-extend maksimal 3 hari per request dan maksimal 3 approved extends per WO, dengan approval berjenjang: Team Leader (jika ada) → HOD; jika department tidak punya Team Leader, langsung ke HOD. Sistem memblokir pengajuan extend baru jika masih ada extend pending untuk WO yang sama (keputusan Round 2).
- FR-2.4: Work Schedule (jadwal WO normal) dapat di-extend oleh HOD, tetapi wajib approval DGM/GM — **alur ini terpisah** dari FR-2.3 (extend WO telat).
- FR-2.5: Sistem mencatat siapa yang approve/reject setiap pengajuan extend beserta timestamp dan alasan.

### 6.3 Work Data Management

- FR-3.1: Setiap WO yang closed menghasilkan satu record Work Data berisi: no kerja, jam pengerjaan, department, status akhir, gambar sebelum/sesudah, prediksi penyebab, hasil kesimpulan, saran solusi, tindakan yang diambil.
- FR-3.2: Work Data dapat dicari/difilter berdasarkan department, rentang tanggal, status.
- FR-3.3: Data ini menjadi sumber histori/audit trail — **append-only** setelah WO closed; tidak bisa diedit/dihapus setelah closing.

### 6.4 Lintas Department Workorder

- FR-4.1: Saat membuat WO, Requester wajib memilih department tujuan dari daftar department aktif.
- FR-4.2: WO lintas department tunduk pada FR-1.x s.d. FR-2.x yang sama — tidak ada alur berbeda selain routing ke HOD department tujuan.

### 6.5 Daily Work Management

- FR-5.1: Setiap karyawan punya template tugas harian rutin (recurring), didefinisikan **per karyawan** dan dikelola HOD (keputusan Round 2, opsi A).
- FR-5.2: HOD dapat menambahkan tugas tambahan di luar template untuk karyawan tertentu pada tanggal tertentu.
- FR-5.3: Karyawan melihat gabungan (template rutin + tugas tambahan) sebagai satu daftar Daily Work per hari — **digabung virtual**, tidak disimpan sebagai satu record gabungan.
- FR-5.4: Setiap item Daily Work punya status pekerjaan (belum/proses/selesai) dan lokasi pekerjaan.

### 6.6 RBAC (Spatie)

- FR-6.1: Role baseline yang harus didukung (mengikuti implementasi referensi opti-work2): **Super Admin, Admin Tenant/Cabang, General Manager/Deputy GM (DGM), HOD, Team Leader, Karyawan, Karyawan Pelaksana (Field Staff), Viewer/Auditor**. **Requester bukan role eksklusif** — setiap user terautentikasi berpotensi jadi Requester (keputusan Round 1). **Direksi ditunda** sampai ada kebutuhan nyata; Super Admin setara pengelola konfigurasi sistem/RBAC/master data (keputusan Round 1).
- FR-6.2: Setiap permission (create WO, assign, verify, approve extend, dst.) di-assign ke role via Spatie, dapat dikonfigurasi Admin tanpa deploy ulang.
- FR-6.3: Middleware memastikan user hanya bisa akses route/aksi sesuai permission-nya; percobaan akses tanpa izin menghasilkan 403 dan tercatat di log.

### 6.7 Realtime Notification

- FR-7.1: Event yang memicu notifikasi realtime: WO baru masuk, WO di-assign, hasil kerja disubmit, hasil kerja direvisi, WO telat (3/5/6 hari), pengajuan extend, approval/reject extend, Daily Work baru ditambahkan.
- FR-7.2: Notifikasi tampil in-app (bell icon / toast) dan dapat dikirim melalui WhatsApp (WAHA) sebagai channel tambahan pada MVP.
- FR-7.3: Notifikasi tersimpan dan bisa ditandai sudah dibaca; user bisa melihat riwayat notifikasi.

### 6.8 Tenant/Cabang, Inventory & Kelompok Barang

- FR-8.1: Super Admin dapat CRUD data Tenant/Cabang (`tenants`) beserta logo; tiap cabang menjadi batas isolasi data (`tenant_id`).
- FR-8.2: Inventory (`tb_inventory`) dan Kelompok Barang (`tb_kelompok_barang`) dapat dikelola (CRUD) dan direferensikan dari Work Data.

---

## 7. Sketsa Data Model (Entitas + Field Kunci)

_Sketsa ini adalah pemetaan konsep dari ERD lama (foto ERD per 06 Jan 2026, `IMG_20260106_130952_405.jpg`). **Keputusan Round 1 & 4:** penamaan tabel aktual yang dipakai proyek ini mengikuti konvensi `tb_*`, bukan gaya Laravel murni. Nama tabel aktual di kode: `users`, `tenants`, `tb_department`, `tb_division`, `tb_employee`, `tb_position`, `tb_work_order`, `tb_work_planning`, `tb_work_daily`, `tb_work_data`, `tb_work_data_pekerja`, `tb_schedule_wd`, `tb_extend_requests`, `tb_inventory`, `tb_kelompok_barang`, `tb_inventory_expand_data`, `app_notifications`, `work_order_sequences`, `settings`._

_**Catatan penting:** entitas `tenants` di proyek ini = **cabang** (batas multi-tenancy), bukan penyewa tempat; CRUD-nya wajib (`TenantController`). Terdapat duplikasi model `App\Models\Tenant` dan `App\Models\Tenants` pada tabel yang sama — perlu dikonsolidasikan (OQ 12)._

**tb_user**

- fld_id_user (PK), fld_id_karyawan (FK), fld_username, fld_password, fld_hak_akses, fld_status, fld_login_status, fld_tanggal_login

**tb_karyawan**

- fld_id_karyawan (PK), fld_nik, fld_nama, fld_nama_alias, fld_gender, fld_alamat, fld_no_ktp, fld_telp, fld_jabatan (FK), fld_call_sign, fld_divisi (FK), fld_tmk, fld_status_karyawan, fld_keterangan, fld_user_image

**tb_divisi**

- fld_id_divisi (PK), fld_nama_divisi, fld_nama_department, fld_ext_tlp

**tb_department**

- fld_id_department (PK), fld_kode_department, fld_nama_department, fld_id_hod (FK ke tb_karyawan)

**tenants** _(entitas cabang / batas multi-tenancy — CRUD wajib, MVP)_

- id (PK), name, company_name, status (active/inactive/suspended), type, email, phone, area, location, logo_path, description, timestamps, softDeletes

**tb_work_order**

- fld_id_work_order (PK), fld_no_work_order, fld_tanggal_work_order, fld_jam_work_order, fld_department (FK — department tujuan), fld_department_pemilik_wo (department asal requester), fld_id_pelapor (FK ke tb_karyawan — Requester), fld_jenis_pekerjaan_kerusakan, fld_prioritas, fld_status_pekerjaan, fld_level, fld_lokasi, fld_risalah_meeting, fld_business_plan, fld_keterangan, fld_label, fld_status_hapus. _(Catatan: `fld_gambar` TIDAK ada di ERD asli — foto bukti ditambahkan belakangan via kolom `incident_photos`; PRD ini tetap mensyaratkan lampiran gambar per FR-1.1.)_

**tb_work_planning** _(Work Order Terjadwal)_

- fld_no_planning (PK), fld_id_planning (FK ke WO), fld_department, fld_tanggal_planning, fld_tanggal_start, fld_lama_pekerjaan, fld_budget, fld_nama_pekerjaan, fld_rincian_pekerjaan, fld_lokasi_pekerjaan, fld_id_pic (FK ke tb_karyawan), fld_prioritas, fld_status_pekerjaan, fld_risalah_meeting, fld_business_plan, fld_path_folder, fld_keterangan, fld_label, fld_status_hapus

**tb_work_daily**

- fld_no_work_daily (PK), fld_id_work_daily (FK ke WO — kemungkinan `fld_id_work_order`; konfirmasi saat development), fld_tanggal_work_daily, fld_department, fld_rincian_pekerjaan, fld_lokasi_pekerjaan, fld_id_pic (FK), fld_level, fld_prioritas, fld_status_pekerjaan, fld_keterangan, fld_status_hapus

**tb_work_data** _(Work Data Management — histori)_

- fld_no_kerja (PK), fld_id_pekerjaan (FK ke WO/planning/daily), fld_tanggal_work_data, fld_jam_work_data, fld_department, fld_status_pekerjaan, fld_gambar_sebelum, fld_gambar_sesudah, fld_prediksi_penyebab, fld_hasil_kesimpulan, fld_saran_solusi, fld_tindakan, fld_kode_inventory (keterkaitan inventaris), fld_nama_tenant, fld_status_hapus

**tb_work_data_pekerja** _(relasi karyawan ↔ Work Data / assignment)_

- fld_no_data_pekerjaan (PK), fld_id_kerja (FK), fld_id_user (FK), fld_id_karyawan (FK)

**tb_schedule_wd** _(master jadwal kerja)_

- fld_no_schedule_wd (PK), fld_status_aktif, fld_department, fld_tipe_schedule_wd, fld_data_schedule_wd, fld_start_date, fld_end_date, fld_rincian_pekerjaan, fld_lokasi, fld_prioritas, fld_level, fld_id_pic (FK), fld_keterangan, fld_last_create

**Tabel tambahan di luar ERD asli:**

- `app_notifications` (id, user_id tujuan, tipe event, referensi ke WO/Daily Work, status dibaca, timestamp) + broadcast Reverb — untuk FR-7.x.
- `tb_extend_requests` (id, referensi WO/Schedule, jenis extend, jumlah hari, alasan, status approval, approver, timestamp) — **SETTLED (Round 1):** tabel terpisah, bukan field status.
- Field eskalasi & extend di `tb_work_order`: `deadline_date`, `escalation_h3_sent_at`, `escalation_h5_sent_at`, `escalation_h6_sent_at`, `is_escalated`, `extend_count`, `extend_reason`, `extended_at`.
- `tb_inventory`, `tb_kelompok_barang`, `tb_inventory_expand_data` — Inventory & Kelompok Barang (MVP).

---

## 8. Edge Case & Failure State

- WO Urgent by Accident dibuat tapi department tujuan tidak punya HOD aktif (HOD cuti/resign) → **SETTLED (Round 2):** rantai fallback penerima `hod_user_id` → `manager_user_id` (deputy) → semua user ber-role `hod` di department tsb; jika tetap kosong, notifikasi tersimpan ke Admin Tenant cabang + log kritikal.
- Karyawan yang di-assign resign/nonaktif sebelum WO selesai → butuh mekanisme re-assign, belum dibahas.
- Extend deadline berulang → **SETTLED (Round 2):** maks 3 hari/request, maks 3 approved extends/WO, plus blokir pending duplikat per WO.
- WO direject HOD berkali-kali (revisi berulang) tanpa batas — apakah ada SLA/eskalasi untuk kasus ini? Tidak disebutkan di dokumen sumber.
- Dua Requester dari department berbeda membuat WO ke department tujuan yang sama secara bersamaan dengan prioritas sama — urutan pengerjaan tidak didefinisikan (asumsi FIFO, perlu konfirmasi).
- Department tanpa Team Leader → **SETTLED (Round 1):** notifikasi H+3 di-skip; sistem tahu department punya TL jika ada user ber-role `team_leader` di department tsb.
- Realtime notification gagal terkirim (user offline/koneksi putus) → notifikasi tetap tersimpan di database dan muncul saat user login kembali (in-app notification history).
- Approval extend Work Schedule menunggu DGM/GM yang sedang cuti/tidak aktif — tidak ada mekanisme delegasi/pengganti approver disebutkan di dokumen sumber.
- File/gambar bukti pekerjaan (sebelum/sesudah) gagal upload atau ukuran terlalu besar — perlu validasi ukuran/format, belum dispesifikasikan batasannya.

---

## 9. Success Metrics

**Definisi "selesai" (SETTLED Round 2):** lulus seluruh skenario UAT kritikal (mengadopsi 13 skenario UAT dari PRD referensi opti-work2 §8.2) + test suite hijau + pilot live 1 department tanpa insiden kritikal.

Metrik usulan untuk mengukur apakah produk mencapai tujuan di §3:

- % Work Order yang closed tanpa melewati eskalasi hari ke-6 (target awal: perlu ditentukan bersama stakeholder).
- Waktu rata-rata dari WO dibuat → di-assign (mengukur responsivitas HOD).
- Waktu rata-rata dari assign → closed per kategori (Normal/Urgent).
- % WO Urgent by Accident yang dieksekusi di hari yang sama.
- Jumlah insiden akses tanpa izin yang terblokir RBAC (proxy untuk "tanpa celah keamanan" — perlu didefinisikan lebih lanjut lewat security testing/pentest).
- Adopsi: % Requester/HOD/karyawan aktif menggunakan sistem vs proses lama (manual/chat) dalam periode pilot.

---

## 10. Open Questions

1. ~~Apakah Requester adalah role terpisah, atau setiap user (apapun rolenya) otomatis bisa jadi Requester? (§6.6)~~ **SETTLED (Round 1):** Requester bukan role eksklusif — setiap user terautentikasi berpotensi jadi Requester.
2. ~~Nilai pasti minimal/maksimal hari kerja deadline.~~ **SETTLED (Round 2):** urgent = 3 hari kerja, normal = 6 hari kerja; eskalasi H+3/5/6; kalender libur configurable via `config/holidays.php`.
3. ~~Batas jumlah pengajuan extend per WO.~~ **SETTLED (Round 2):** maks 3 hari per request + maks 3 approved extends per WO, ditambah cek blokir extend pending duplikat per WO.
4. ~~Mekanisme template Daily Work.~~ **SETTLED (Round 2, opsi A):** template per karyawan (dikelola HOD), digabung virtual dengan tugas tambahan.
5. ~~Apakah "Team Leader" adalah role/jabatan resmi.~~ **SETTLED (Round 1):** Team Leader adalah role Spatie (`team_leader`).
6. ~~Apa yang terjadi jika HOD department tujuan tidak aktif.~~ **SETTLED (Round 2):** fallback `hod_user_id` → `manager_user_id` → semua user ber-role `hod`; jika kosong, notifikasi ke Admin Tenant cabang + log kritikal.
7. ~~Channel notifikasi — cukup in-app, atau perlu WA/email gateway di MVP?~~ **SETTLED (Round 2 & 4):** in-app (bell + toast + history tersimpan DB, broadcast Reverb) **plus WhatsApp (WAHA)** di MVP; email gateway ditunda.
8. ~~Definisi "selesai".~~ **SETTLED (Round 2):** lulus UAT kritikal + test suite hijau + pilot live 1 department tanpa insiden kritikal.
9. ~~Relasi Extend Request ke ERD.~~ **SETTLED (Round 1):** tabel terpisah (`tb_extend_requests`).
10. ~~Field-field ERD yang ditandai (?) di §7.~~ **SETTLED (Round 2):** diverifikasi ke foto ERD; koreksi: call_sign (bukan tanda tangan digital), business_plan (bukan business_meeting), tb_karyawan tanpa FK department. Sisa ambiguitas: FK tb_work_daily dan `fld_logo` — konfirmasi saat development.
11. ~~Hak akses Super Admin vs Direksi.~~ **SETTLED (Round 1):** Super Admin setara pengelola konfigurasi RBAC/master data; Direksi ditunda.
12. ~~Duplikasi model `Tenant` dan `Tenants` pada tabel `tenants` yang sama.~~ **SETTLED (Round 4):** konsolidasikan ke satu model `Tenant`; `Tenants` dihapus setelah semua referensi (controller, factory, test) diperbarui.
13. ~~Paket multi-tenancy: stancl/tenancy vs spatie/laravel-multitenancy.~~ **SETTLED (Round 4):** gunakan **spatie/laravel-multitenancy v4** mode single-database (trait `BelongsToTenant`, identifikasi path).

---

## Lampiran A — Gap Implementasi Saat Ini vs PRD (audit per Round 4)

Status kode saat ini terhadap PRD di atas. ✅ sesuai · ⚠️ sebagian · ❌ belum ada.

| #   | Requirement                                              | Status | Bukti / Catatan                                                                                     |
| --- | -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 1   | FR-1.1 Field WO lengkap (termasuk jumlah personel)        | ⚠️     | `personnel_count` baru ada saat assign/HOD approve, belum di create (`WorkOrderController.php:154`) |
| 2   | FR-1.2 Urgent by Accident wajib eksekusi langsung        | ✅     | `WorkOrderController.php:458`                                                                        |
| 3   | FR-1.5 Notifikasi ke HOD saat WO dibuat                  | ✅     | `WorkOrderController.php:245-250`                                                                    |
| 4   | FR-1.6 Notifikasi ke karyawan saat assign                | ❌     | `assignEmployees()` tidak mengirim notifikasi (`WorkOrderController.php:513-539`)                    |
| 5   | FR-1.7 Submit hasil + foto                               | ⚠️     | hanya catatan teks, tanpa upload foto (`WorkOrderController.php:554-572`)                            |
| 6   | FR-1.8 Approve/reject revisi tanpa reset deadline         | ✅     | `WorkOrderController.php:587-618`                                                                    |
| 7   | FR-1.9 Histori/audit trail status per WO                 | ❌     | tidak ada tabel/model histori                                                                        |
| 8   | FR-2.1 Deadline dari **tanggal assign**                   | ✅     | kolom `assigned_at` + `deadlineStartDate()` (`WorkOrder.php`); diset saat assign (`WorkOrderController.php:527`) |
| 9   | FR-2.1 Urgent 3 / Normal 6 hari kerja                     | ✅     | `WorkOrder.php:125`, `BusinessDayCalculator.php`                                                     |
| 10  | FR-2.2 Eskalasi H+3 TL department / H+5 HOD / H+6 DGM     | ✅     | `EscalationRecipientResolver` — TL department, HOD chain, DGM/GM (`CheckWorkOrderDeadlines.php`)     |
| 11  | FR-2.2/6 Fallback HOD (deputy + admin tenant + log)       | ✅     | `EscalationRecipientResolver::hods()` — hod_user_id → manager_user_id → role hod → Admin Tenant + log kritikal |
| 12  | FR-7.1 Notifikasi eskalasi ter-broadcast realtime         | ✅     | `AppNotificationService::createForUser` + `NotificationCreated` (channel di-scope ke user id)        |
| 13  | FR-2.3 Extend maks 3 hari / 3 approved                    | ✅     | `ExtendRequestController.php`                                                                        |
| 14  | FR-2.3 Blokir extend pending duplikat                     | ❌     | tidak ada cek pending duplikat (`ExtendRequestController.php:37-69`)                                 |
| 15  | FR-2.4 Extend Work Schedule wajib approval DGM/GM         | ⚠️     | route approve/reject tanpa middleware permission (`routes/web.php:134-135`)                          |
| 16  | FR-3.1/3.3 Work Data auto-terbentuk + append-only         | ❌     | dibuat manual; `update()`/`destroy()` tetap terbuka (`WorkDataController.php:128,231`)               |
| 17  | FR-3.2 Filter Work Data per rentang tanggal               | ⚠️     | filter department/status ada, rentang tanggal belum                                                 |
| 18  | FR-5.1/5.3 Template per karyawan + merge virtual          | ❌     | belum ada konsep template/recurring                                                                  |
| 19  | FR-5.4 Lokasi pada Daily Work                             | ❌     | `tb_work_daily` tidak punya kolom lokasi (`WorkDaily.php:23-37`)                                     |
| 20  | FR-6.1 Role baseline (9 role)                             | ✅     | `RoleAndPermissionSeeder.php:68-154`                                                                 |
| 21  | FR-6.2/6.3 Permission + middleware 403                    | ✅     | `routes/web.php`, `bootstrap/app.php:24-29`                                                          |
| 22  | FR-7.2 Notifikasi WA/WAHA                                 | ✅     | `WhatsAppWebhookController.php`, `WorkOrderNotification.php`, `WahaController`                       |
| 23  | FR-7.3 Bell/toast/history + mark read                     | ✅     | `NotificationController` (gabung notifikasi User + Employee) + `use-notifications.ts` (channel user id) |
| 24  | FR-8.1 Tenant/Cabang CRUD                                 | ⚠️     | ada `TenantController` + test, tapi model `Tenant`/`Tenants` duplikat (OQ 12)                        |
| 25  | FR-8.2 Inventory + Kelompok Barang                        | ✅     | `tb_inventory`, `tb_kelompok_barang`, controller + test                                              |
| 26  | Multi-tenancy spatie/laravel-multitenancy v4              | ❌     | masih trait custom `TenantAware` + `TenantService` (OQ 13)                                            |
| 27  | Test suite untuk area MVP kritis                          | ⚠️     | test WO/extend/deadline/escalation/daily/tenant; belum ada test audit trail & append-only Work Data  |
