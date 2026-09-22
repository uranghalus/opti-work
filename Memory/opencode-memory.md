# Progres Work Management System (WMS)

## Tanggal: 29 Agustus 2026

## Status Utama (BERDASARKAN PRD)

### ✅ COMPLETED
| FR ID | Fitur | Status |
|-------|-------|--------|
| FR-01 | Manajemen Divisi | ✅ COMPLETED |
| FR-02 | Manajemen Department | ✅ COMPLETED |
| FR-03 | Manajemen Karyawan | ✅ COMPLETED |
| FR-04 | User & Login (Fortify) | ✅ COMPLETED |
| FR-05 | Create Work Order | ✅ COMPLETED |
| FR-06 | Update Work Order | ✅ COMPLETED |
| FR-07 | Review & Assign | ✅ COMPLETED |
| FR-08 | Verifikasi & Approval | ✅ COMPLETED |
| FR-09 | Deadline & Escalasi | ✅ COMPLETED (scheduler `deadlines:check`) |
| FR-10 | Extend Work Order | ✅ COMPLETED (approval TL → HOD) |
| FR-11 | Risalah Meeting | ✅ Ada di field |
| FR-15 | Pengolahan Data Kerja | ✅ COMPLETED |
| FR-16 | Alokasi Pekerja | ✅ COMPLETED |
| FR-17 | Jadwal Data Kerja | ✅ COMPLETED |
| FR-18 | Inventaris/Tenant Link | ⚠️ FIELD ADA, TAPI TIDAK DIKONEKSIKAN |
| FR-25 | CRUD Data Tenant | ✅ COMPLETED |
| FR-26 | Multi-Tenant | ✅ COMPLETED |
| FR-30 | RBAC | ⚠️ PARTIALLY (roles ada, permission belum final) |
| FR-29 | Notifikasi Realtime | ⚠️ PARTIALLY |

### ⚠️ PENDING
| FR ID | Fitur | Masalah |
|-------|-------|---------|
| FR-12 | Work Planning | ⚠️ TIDAK LENGKAP - tidak ada WorkPlanningController |
| FR-13 | Extend Jadwal | ⚠️ TIDAK LENGKAP |
| FR-14 | Monitoring Jadwal | ⚠️ TIDAK LENGKAP |
| FR-19 | Pemilihan Dept Tujuan | ⚠️ TIDAK LENGKAP - no_cross_department_feature |
| FR-20 | Routing Notifikasi | ⚠️ TIDAK LENGKAP |
| FR-21 | Penetapan Daily Work | ⚠️ TIDAK LENGKAP |
| FR-22 | Update Status Daily | ⚠️ TIDAK LENGKAP |
| FR-23 | Manajemen Inventaris | ❌ TIDAK ADA MODEL |
| FR-24 | Kolom Dinamis Inventory | ❌ TIDAK ADA |
| FR-27 | Manajemen Surat Masuk | ❌ TIDAK ADA MODEL |
| FR-28 | Manajemen Surat Keluar | ❌ TIDAK ADA |
| FR-27-28 | Notifikasi WhatsApp | ❌ DISABLED (WahaWhatsAppChannel) |

## Poin Aksi PENTING

### Model yang HILANG
1. **tb_inventory**, **tb_kelompok_barang** - FR-23,24
2. **tb_surat_masuk**, **tb_surat_keluar** - FR-27,28
3. **tb_work_planning** - FR-12,13,14
4. **tb_work_daily** - sudah ada tapi tidak lengkap
5. **tb_tenant_details** - untuk multi-tenant detail

### Feature yang PERLUI DIKERJAKAN
1. **RBAC Permission** - VERIFY semua permission middleware
2. **Notification System** - VERIFY realtime flow, broadcasting
3. **Scheduler** - VERIFY CRON job (`deadlines:check`)
4. **Multi-tenant Isolation** - VERIFY data isolation antar tenant
5. **Cross-department Work Order** - implementasi routing

## Rekomendasi
Urutkan kerjaan:
1. Complete Inventory & Surat models & controllers
2. Implement WorkPlanning module
3. Fix Daily Work Management
4. Verify Multi-tenant & RBAC
5. Enable & Test Notifications

---

## Tanggal: 22 September 2026 — Audit Status vs PRD (branch feat/wa-gateway)

**Hasil verifikasi kode langsung (bukan asumsi).** Test suite: 82 passed, 3 skipped.

### Terverifikasi SELESAI
- FR-01 s/d FR-10, FR-15, FR-16, FR-17, FR-25, FR-26 — sesuai commit sprint 1+2 (cbe15fb).
- Scheduler `deadlines:check` jalan daily 08:00 (routes/console.php), eskalasi H+3 (TL) / H+5 (HOD) / H+6 (DGM/GM via roles `deputy_general_manager`/`general_manager`).

### Terverifikasi BELUM ADA (0 file ditemukan)
- FR-11 Risalah Meeting & Business Plan — tidak ada field/fitur.
- FR-23/24 Inventory & kolom dinamis — tidak ada model/controller/migrasi `tb_inventory`.
- FR-27/28 Surat Masuk/Keluar — tidak ada.
- FR-12/13/14 Work Planning — migrasi `tb_work_planning` SUDAH ADA (2026_08_29) tapi 0 model/controller/route/UI.
- FR-21/22 Daily Work — migrasi `tb_work_daily` ada sejak Juni tapi tidak pernah dipakai di app/ (tidak ada Model).

### Parsial / Catatan
- FR-18: field `kode_inventory` ada di tb_work_data, tidak terhubung ke modul manapun.
- FR-19/20: `department_tujuan` mengalir ke notifikasi HOD dept tujuan (WorkOrderController), routing hak assignment belum diverifikasi eksplisit.
- FR-30: middleware `permission:rbac.manage` baru dipasang di routes/settings.php saja — belum di seluruh modul.
- FR-29: Reverb + AppNotificationService + WAHA channel ada; WAHA dinonaktifkan (log warning jika HOD tidak punya nomor).
- ⚠️ BUG: `ExtendRequest::departmentHasTeamLeader()` mengecek `hod_user_id`, bukan keberadaan Team Leader → jalur approval extend berpotensi salah.
- 7 worktree `.sokudo/worktrees/` masih untracked (isi sprint sudah ter-merge).

### Urutan kerja berikutnya (disepakati audit)
1. Modul Work Planning (FR-12/13/14) — tabel sudah siap.
2. Daily Work Management (FR-21/22).
3. Inventory + hubungkan kode_inventory (FR-23/24/18).
4. Surat Masuk/Keluar (FR-27/28).
5. Finalisasi RBAC: pasang permission middleware ke semua modul.
6. Fix bug `departmentHasTeamLeader()`.

---

## Tanggal: 22 September 2026 — Sprint 3: Work Planning (FR-12/13/14) SELESAI

### Yang dikerjakan
- **FR-12 Penjadwalan WO**: Model `WorkPlanning` (tb_work_planning) + relasi `WorkOrder::workPlannings()`. `WorkPlanningController` (index/create/store/show/edit/update/destroy). Hanya WO `priority_type=normal` & belum selesai yang bisa dijadwalkan; store otomatis set `scheduled_date` WO.
- **FR-13 Extend Jadwal**: `requestExtend` (HOD mengajukan, tanggal proposal tersimpan, status `pending_extend_approval`) + `approveExtend`/`rejectExtend` khusus DGM/GM (`authorizeGmAction`). Approve → status `rescheduled`, `extend_count+1`, sinkron `scheduled_date` WO. Reject → kembali ke tanggal awal (`getRawOriginal('tgl_jadwal')`). Notifikasi in-app ke DGM/GM via `AppNotification`.
- **FR-14 Monitoring**: Index dengan summary cards, filter status, search no WO/rincian/department.
- Migration extend `tb_work_planning`: budget, lama_pekerjaan_hari, extend_* fields, tenant_id (FK), softDeletes, audit user, index (status_jadwal, tgl_jadwal).
- Routes `work-planning.*` dengan middleware permission `work-planning.read/create/update/delete` (permission sudah ada di RoleAndPermissionSeeder).
- Wayfinder routes generated; halaman React `WorkPlanning/{Index,Create,Edit,Show}.tsx` (soft UI biru #0071b7 konsisten dengan Schedule WorkData, Form component Inertia).
- **Tahap 2 (bugfix)**: `ExtendRequest::departmentHasTeamLeader()` diperbaiki — dulu cek `hod_user_id` (HOD, BUKAN TL), sekarang query User by department + role `team_leader` (paritas dengan controller). Regression test: `ExtendRequestRoutingTest` (4 test).
- Tipe `Auth` di `resources/js/types/auth.ts` ditambah `permissions/roles/tenant` (sudah dibagikan HandleInertiaRequests).

### Hasil verifikasi
- Test: 94 passed, 3 skipped (310 assertions) — naik dari 82.
- `npm run build` sukses; Pint passed; ESLint bersih untuk file baru.
- 5 error tsc lama (pre-existing) di notification-bell/echo/use-work-order-broadcast/waha — bukan dari pekerjaan ini.

### Keputusan/konvensi
- Extend jadwal: tanggal proposal langsung ke `tgl_jadwal` + status menahan (pending); original tetap di `original_tgl_jadwal`; reject mengembalikan via `getRawOriginal('tgl_jadwal')`.
- Notifikasi User (bukan Employee) pakai `AppNotification::create` langsung — ikuti pola `CheckWorkOrderDeadlines` (AppNotificationService::create hanya untuk Employee).
- Department PK = UUID (HasUuids); factory Department butuh TenantSeeder dijalankan dulu (FK tenant).
- Status jadwal: planned/scheduled/in_progress/pending_extend_approval/rescheduled/completed/cancelled.

### Sisa backlog (urut)
1. Daily Work Management (FR-21/22) — tb_work_daily sudah ada, belum ada model.
2. Inventory (FR-23/24) + koneksi kode_inventory (FR-18).
3. Surat Masuk/Keluar (FR-27/28).
4. RBAC middleware ke semua modul (baru settings + work-planning).
5. FR-19/20 routing eksplisit lintas department.

---

## Tanggal: 22 September 2026 — Sprint 3: Daily Work Management (FR-21/22) SELESAI

### Yang dikerjakan
- Migration extend `tb_work_daily`: kolom `status_pekerjaan/open|on_progress|selesai`, `prioritas`, `level`, `id_employee` (FK tb_employee, UUID), `assigned_by` (FK users), `assigned_at`, `tenant_id` (FK tenants), index (id_employee, tanggal_kerja) & status_pekerjaan.
- Model `WorkDaily` + enum `WorkDailyStatus` (Open/OnProgress/Selesai, sesuai PRD §3.3) + relasi workData/employee/assigner; `WorkDailyFactory` dengan state forEmployee()/forWorkData() (WorkData dibuat manual karena belum ada factory — butuh no_kerja unik).
- `WorkDailyController`:
  - **FR-21** `create`/`store`: HOD menetapkan daily work — pilih karyawan (tb_employee) + SPK (tb_work_data, status belum selesai), set prioritas/level; otomatis `assigned_by`, `assigned_at`, `pelapor` = nama employee, status awal `open`.
  - **FR-22** `updateStatus`: karyawan update status/aktivitas/progres/kendala; validasi kepemilikan via `employee.email === user.email` atau role manajemen; **progres dipaksa 100 saat status `selesai`**.
  - `index` scoped: role manajemen lihat semua per tenant; karyawan/field_staff hanya miliknya (match email employee). TenantScope aktif via TenantAware.
- Routes `work-daily.*` dengan permission `daily-work.read/create/update`; seeder diperbarui: **role karyawan kini punya `daily-work.read` + `daily-work.update`** (sebelumnya tidak ada — PRD FR-22 butuh karyawan update status).
- Halaman React `WorkDaily/{Index,Create}.tsx`: Index dengan tabel, filter status/tanggal, Dialog update status inline; Create form penetapan HOD; konsisten soft UI biru; ESLint bersih (import/order di-fix).

### Hasil verifikasi
- Test: **103 passed, 3 skipped (348 assertions)** — WorkDailyTest 9 test (HOD assign, validasi input, karyawan update miliknya, progres auto-100, 403 pekerjaan orang lain, forbidden tanpa permission, isolasi tenant, karyawan hanya lihat miliknya, soft delete HOD).
- `npm run build` sukses, Pint passed.

### Catatan teknis
- `tb_work_daily` awalnya TIDAK punya tenant_id — ditambahkan di migration ini (daftar tabel sprint lalu melewatkan tabel ini).
- Kepemilikan daily work dicocokkan lewat email user ↔ email employee (tidak ada kolom user_id di tb_employee).
- Warning: migrasi duplikat `2026_06_26_152023_add_daily_work_table.php` (kosong, hanya tabel 152009 yang membuat tb_work_daily) — kandidat dibersihkan.

### Sisa backlog (urut)
1. Inventory (FR-23/24) + koneksi kode_inventory (FR-18).
2. Surat Masuk/Keluar (FR-27/28).
3. RBAC middleware ke semua modul (baru settings, work-planning, work-daily).
4. FR-19/20 routing eksplisit lintas department.
5. Menu sidebar untuk Work Planning & Work Daily + guard permission.

---

## Tanggal: 22 September 2026 — Audit Migrasi Database vs PRD/ERD + Cleanup SELESAI

### Cleanup duplikat
- File `2026_06_26_152023_add_daily_work_table.php` (kosong, up/down kosong) DIHAPUS + record-nya dihapus dari tabel `migrations` (dev DB SQLite `database/database.sqlite`).
- **Temuan penting**: dev DB dalam state phantom — record migrasi `2026_09_22_021735_extend_tb_work_daily_table` ada di batch 2 tapi EFEK KOLOMNYA HILANG (sisa rollback kemarin). Record dihapus lalu migrate ulang → tb_work_daily kini 17 kolom + FK lengkap. Pelajaran: record migrations bisa tidak sinkron dengan schema aktual setelah rollback manual.

### Metode audit
1. Semua 35 file migrasi dipetakan → tabel create/alter, dibandingkan dengan tabel per-FR di PRD §4.
2. Kolom aktual semua tabel diverifikasi via PRAGMA (dev DB = SQLite; `SHOW COLUMNS` tidak berlaku).
3. **Script audit model↔tabel** (tinker): semua model di app/Models dicek — tabel ada, semua kolom `fillable` ada di tabel, flag TenantAware. Script ini bisa dipakai ulang untuk audit reguler.
4. FK diverifikasi via `PRAGMA foreign_key_list` — semua relasi inti (work_order→tenant, work_daily→employee/work_data, dll) benar.

### Temuan & perbaikan (migrasi korektif `2026_09_22_041626_add_missing_tenant_and_deskripsi_columns`)
| Temuan | Dampak | Perbaikan |
|--------|--------|-----------|
| `tb_schedule_wd` tanpa `tenant_id` — model TenantAware memaksa insert tenant_id | **Bug runtime**: insert gagal saat tenant context aktif; isolasi FR-26 mati untuk jadwal WD | + tenant_id FK + index (guarded hasColumn) |
| `tb_work_data_pekerja` tanpa `tenant_id` (masalah sama) | **Bug runtime** yang sama untuk alokasi pekerja | + tenant_id FK + index |
| `tb_work_data` tanpa kolom `deskripsi` padahal dipakai controller (validasi/search/insert) & UI Index.tsx | Query search `orWhere('deskripsi')` → SQL error; data deskripsi tak tersimpan | + kolom string nullable |
- **Akar masalah pola**: tabel `tb_schedule_wd` (06:03) & `tb_work_data_pekerja` (06:03) dibuat SETELAH migrasi tenant `2026_08_28_000001` (00:00) di hari yang sama → daftar tabel tenant melewatkannya. `deskripsi` tertinggal dari migrasi add_missing_columns 29 Agu.
- Migrasi korektif memakai guard `hasColumn` (konvensi existing) supaya idempotent dan aman untuk DB lain yang sudah benar.

### Hasil audit: TIDAK ADA lagi debt skema untuk modul yang sudah implementasi
- Semua tabel FR yang sudah dikerjakan (FR-01..10, 15..18, 21..22, 25..26) konsisten dengan model & PRD.
- Tabel modul BELUM diimplementasi memang belum ada (tb_inventory, tb_kelompok_barang, tb_surat_masuk/keluar, tb_inventory_expand_data) — itu backlog fitur, bukan debt migrasi.
- Field risalah FR-11 di tb_work_order memang belum ada — menyusul saat implementasi FR-11.

### Catatan lain
- Model `Position` (tb_position) & `Tenants` (tenants) sengaja tidak TenantAware — master data lintas tenant (Tenant CRUD dikelola global; Position di-guard di controller). Tidak diubah.
- Test suite setelah cleanup: **103 passed, 3 skipped (348 assertions)**; Pint passed.
- Watch out: rollback manual dev DB bisa meninggalkan record `migrations` tanpa efek kolom — kalau ada anomali "kolom hilang", cek PRAGMA dulu sebelum migrate.

### Sisa backlog (urut, tak berubah)
1. Inventory (FR-23/24) + koneksi kode_inventory (FR-18).
2. Surat Masuk/Keluar (FR-27/28).
3. RBAC middleware ke semua modul.
4. FR-19/20 routing eksplisit lintas department.
5. Menu sidebar + guard permission → ✅ SELESAI (lihat bawah).

---

## Tanggal: 22 September 2026 — Sidebar Menu dengan Guard Permission SELESAI

### Yang dikerjakan
- `app-sidebar.tsx`: `mainNavItems` dipindah ke dalam komponen `AppSidebar()` karena butuh `usePage().props.auth` (hook tidak boleh level modul). Menu kini di-guard per permission `.read`:
  - Work Orders → `work-order.read`, Work Planning → `work-planning.read`, Work Data → `work-data.read`, Work Daily → `daily-work.read`; Dashboard selalu tampil.
  - Icon baru: `CalendarClock` (Work Planning), `CalendarCheck2` (Work Daily).
- Guard konsisten dengan seeder: semua role yang berhak (super_admin, HOD, TL, GM, DGM, karyawan, field_staff, viewer, admin_tenant) otomatis melihat menunya karena permission `.read` sudah di-sync per role.
- Konvensi guard frontend yang disepakati: `const { auth } = usePage().props; can('xxx.read')` — data `auth.permissions` memang dibagikan HandleInertiaRequests; cocokkan nama permission dengan RoleAndPermissionSeeder.
- Verifikasi: `npm run build` ✓, ESLint ✓, tsc 0 error baru (5 pre-existing), suite PHP tidak berubah (tidak ada perubahan backend; proteksi 403 backend sudah dites di WorkPlanningTest/WorkDailyTest).

---

## Tanggal: 22 September 2026 — Sprint 4: Modul Inventory (FR-23/24) + Koneksi FR-18 SELESAI

### Yang dikerjakan
- **Migrasi** `2026_09_22_050000_create_inventory_tables`: `tb_kelompok_barang`, `tb_inventory` (kode_barang unique, kode_inventory, FK kelompok, spesifikasi, penanggung_jawab, kondisi baik/rusak_ringan/rusak_berat/perbaikan, lokasi_barang, jenis_barang, tenant_id, softDeletes, index), `tb_inventory_expand_data` (FK cascade, field_name/value/type text/number/date/boolean, unique [id_inventory, field_name], tenant_id).
- **Model + factory**: `Inventory` (relasi kelompokBarang, expandData, workData by kode_inventory), `KelompokBarang`, `InventoryExpandData` — semua TenantAware.
- **Controller**: `InventoryController` (index search/filter; store/update transactional + `syncExpandData` upsert-per-field & hapus field tak dikirim; show menyertakan workData terhubung FR-18) dan `KelompokBarangController` (withCount, delete ter-guard jika masih dipakai).
- **Routes** `inventory.*` & `kelompok-barang.*` dengan permission middleware; seeder: super_admin & admin_tenant full, HOD/GM/DGM/viewer read.
- **Frontend** `Inventory/{Index,Create,Edit,Show,KelompokBarang}.tsx` (soft-UI biru; builder kolom dinamis di Create/Edit; Show menampilkan expand data + Work Data terkait; KelompokBarang pakai Dialog inline) + menu sidebar "Inventory" guard `inventory.read`.
- **FR-18**: `WorkDataController` store/update validasi `kode_inventory` (`exists:tb_inventory,kode_inventory`); show kirim `inventories` + `inventory`; `WorkData/Show.tsx` dropdown pilih inventaris (PUT via router.visit) + link "Lihat detail →". `WorkData::$fillable` ditambah `kode_inventory` (sebelumnya mass assignment diam-diam membuang nilai!).

### 🐛 Bug pre-existing penting yang ditemukan & diperbaiki
- **Route resource work-data salah nama parameter**: URI menghasilkan `{work_datum}` (singular otomatis Laravel) tapi controller memakai `WorkData $workData` → implicit binding gagal (model kosong) → redirect show 500 "Missing parameter". Perbaikan: `Route::resource('work-data', ...)->parameter('work-data', 'workData')`. Artinya alur show/update/edit/destroy Work Data sebelumnya rusak.

### Catatan environment (interferensi eksternal)
- Selama sprint ini berjalan ada migrasi SSO dari thread lain: `kovah/laravel-socialite-oidc` → `socialiteproviders/saml2`; `OIDCProvider.php` dihapus; `AppServiceProvider::configureSocialite()` ditulis ulang `extendSocialite('saml2', Provider::class)`. Sementara file belum final, seluruh artisan/test gagal boot. Saya tidak menyentuh dependency; guard `class_exists` yang sempat saya buat tertimpa (tidak diperlukan lagi). Pint --dirty ikut memformat file mereka (hanya gaya).
- Pelajaran: artisan tiba-tiba gagal boot "Class ... not found" dari vendor + composer.json berubah → cek `git status` dan timestamp `vendor/composer/installed.json`; kemungkinan thread lain sedang mengubah dependency.

### Hasil verifikasi
- Test: **111 passed, 3 skipped (390 assertions)** — InventoryTest 8 test (index HOD, store + tenant otomatis, validasi unique/required, sync dynamic fields store+update, isolasi tenant, forbidden tanpa permission, FR-18 link + exists validation, guard delete kelompok).
- `npm run build` ✓, Pint ✓, ESLint ✓, tsc 0 error baru.

### Sisa backlog (urut)
1. Surat Masuk/Keluar (FR-27/28).
2. RBAC middleware ke semua modul → ✅ SELESAI (lihat bawah).
3. FR-19/20 routing eksplisit lintas department.
4. FR-11 Risalah Meeting & Business Plan.

---

## Tanggal: 22 September 2026 — RBAC Middleware Semua Modul SELESAI

### Yang dikerjakan (routes/web.php)
- **Master Data**: departments/divisions/employees diproteksi `permission:*.read` (index/show) + `permission:*.update` untuk `/sync` (sinkronisasi Optigate Portal tidak dipanggil otomatis dari SSO, aman diproteksi).
- **Work Orders**: resource dipecah eksplisit (pola work-planning) dengan guard: create/store → `work-order.create`, edit/update → `work-order.update`, **destroy → `work-order.delete` (BARU)**, show/index → `work-order.read`. Workflow: hod-review/hod-approve → `work-order.review`, assign → `work-order.assign`, submit-results → `work-order.submit`, verify → `work-order.verify`.
- **Extend WO (FR-10)**: create/store → `work-order.submit` (requester); approve/reject TL & HOD + pending → `work-order.review` (selaras prinsip FR-20: hak approval mengikuti department tujuan; controller tetap yang memutuskan TL vs HOD).
- **Work Data**: resource dengan guard read/create/update/`delete` (BARU); upload image → `work-data.update`; process-to-work-data → `work-data.create`; nested pekerja & schedule diproteksi per aksi (read untuk index/show, update untuk sisanya).
- **Seeder**: permission baru `work-order.delete` & `work-data.delete` — diberikan ke super_admin, admin_tenant, HOD (delete Work Data oleh HOD sudah dites di WorkDailyTest-like flow).
- **Frontend**: tombol Edit/Delete/Request Extend di `WorkOrder/Show.tsx` di-guard `can('work-order.update'/'delete'/'submit')` dengan konvensi `usePage().props.auth`.

### Penyesuaian test (role realistis, bukan user tanpa role)
- `ExtendRequestTest`: requester pakai role `karyawan` (punya work-order.submit), approver pakai `hod` (punya work-order.review).
- `ExtendRequestRoutingTest`: user pengaju extend → `karyawan`.
- `WorkOrderWahaNotificationTest`: user create WO → `karyawan` (alur requester).
- `DepartmentSyncTest`/`DivisionSyncTest`/`TenantCrudTest` tidak diubah — sudah pakai `superAdmin()` (punya semua permission).
- `tests/TestCase.php` auto-seed RoleAndPermissionSeeder + TenantSeeder untuk SEMUA test — inilah kenapa test lain tidak pecah saat middleware dipasang.

### Hasil verifikasi
- Test: **111 passed, 3 skipped (390 assertions)** — jumlah tidak berubah (penyesuaian role, bukan test baru).
- `npm run build` ✓ (wayfinder regenerated), Pint ✓, tsc 0 error baru.
- Duplikasi route dicek via `route:list | uniq -d` — bersih.

### Sisa backlog (urut)
1. Surat Masuk/Keluar (FR-27/28).
2. FR-19/20 routing eksplisit lintas department.
3. FR-11 Risalah Meeting & Business Plan.

---

## Tanggal: 22 September 2026 — Fix SAML2 SSO "MissingConfigException: acs" SELESAI

### Gejala
`MissingConfigException` dari `vendor/socialiteproviders/saml2/Provider.php:283` — "When using "acs", both "entityid" and "certificate" must be set" — saat klik login SSO.

### Akar masalah (config/services.php blok 'saml2')
1. **Typo key**: `'certficate'` ditulis, vendor baca `'certificate'` → cert selalu null.
2. **Case key**: `'entityId'` (camelCase) ditulis, vendor baca lowercase `'entityid'` (array keys yang dibaca vendor: acs, slo, entityid, certificate, metadata, sp_acs, sp_sls, sp_entityid, dll — semua lowercase).
3. Setelah dua itu diperbaiki, muncul error kedua: `NotFoundHttpException: route auth/callback could not be found` — vendor membangun **SP descriptor** dari route `sp_acs` (default `auth/callback`) via `hasRouteBindingType()` (Route::match). Callback app sebenarnya `auth/oidc/callback`.

### Perbaikan
- `config/services.php`: `'entityid'` (lowercase) + `'certificate'` (typo diperbaiki) + tambah `'sp_acs' => 'auth/oidc/callback'` (env var TIDAK berubah; hanya nama key).
- `routes/web.php`: tambah route **POST** `auth/oidc/callback` (`ssocallback.post`) — binding POST standar IdP→SP (auto-submit form SAMLResponse). Tanpa ini vendor menganggap route tak support binding manapun.
- Nilai env yang dipakai: SAML_SSO_URL (acs), SAML_SLO_URL (slo), SAML_ENTITY_ID, SAML_CERT (PEM 1344 char — `makeCertificate()` menerima PEM penuh ATAU body saja), SAML_XML_IDP_METADATA_URL (tidak terpakai karena `acs` diprioritaskan di atas `metadata` oleh vendor — metadata URL di-reserve sebagai fallback).

### Regression test
- `SamlSmokeTest` (2 test): `auth/redirect` harus 302 ke gate.appdutamall.com **dengan SAMLRequest=** di URL (AuthnRequest terbangun penuh), dan route callback terdaftar GET+POST (bukan 404).

### Hasil verifikasi
- Tinker: `Socialite::driver('saml2')->getIdentityProviderEntityDescriptor()` OK (EntityID gate.appdutamall.com).
- Test suite: **113 passed, 3 skipped (396 assertions)**; Pint ✓.
- Catatan: verifikasi tinker `redirect()` tidak bisa dipakai untuk SAML (butuh session) — gunakan HTTP feature test.
- Catatan: `OIDCController::callback` masih ada `dd($ssoUser)` di jalur utama — sisa debugging dari pihak lain, perlu dibersihkan sebelum SSO benar-benar dipakai produksi (tidak saya ubah karena milik thread lain).