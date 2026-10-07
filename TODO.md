# TODO

## SAML SSO-only (port persis opti-works) — kerjakan SEBELUM Priority #2

Status: **pending konfirmasi keputusan** (grilling Round, belum di-approve user). Hasil riset: opti-works memakai `socialiteproviders/saml2` + `litesaml/lightsaml` (transitif), controller 402 baris (SSO + SLO + metadata + IdP-initiated stateless), root `/` → authed `dashboard` / guest `saml.redirect`, Fortify di-neuter (`views=false`, `features=[]`, tanpa auth pages), OIDC tidak ada di opti-works.

- [ ] Q11 — Port SamlController persis opti-works + tambah 6 import yang benar (`LogoutResponse`, `Attribute`, `KeyDescriptor`, `LightSamlValidationException`, `LightSamlSecurityException`, `InvalidSignatureException` — FQCN sudah diverifikasi dari vendor; versi ter-commit di opti-works rusak diam-diam: SLO/IdP-initiated tidak jalan)
    - File: `app/Http/Controllers/SamlController.php` (ganti total), `config/services.php` (saml2 block: `sp_acs='saml/acs'`, `sp_sls='saml/logout'`, `sp_default_binding_method=HTTP_REDIRECT`, `metadata=null`; hapus block `oidc`), `.env.example` (tambah `SAML_SSO_URL`, `SAML_SP_ENTITYID`; hapus var OIDC)
- [ ] Q12 — Terima hilangnya sinkronisasi department/position dari SSO (department/position di-sync via `SyncDepartments`/`SyncEmployees` dari Optigate Portal)
- [ ] Q13 — Port test suite SAML: `tests/Support/FakeIdentityProvider.php` (396 baris) + `tests/Fixtures/SAML/{idp,sp}_saml.{crt,pem}` + `tests/Feature/Auth/SamlTest.php` (259 baris, Pest); hapus `tests/Feature/SamlSmokeTest.php` + `tests/Unit/OIDCConfigTest.php`; sesuaikan `AuthenticationTest` (GET `/login` hilang saat `views=false`) & `PasswordResetTest` (sudah skip semua)
- [ ] Q14 — Hapus auth bawaan persis opti-works: hapus `resources/js/pages/auth/{login,forgot-password,reset-password}.tsx` + 3 `resources/js/layouts/auth/*`; `config/fortify.php` (`views=false`, `features=[]`); hapus view closures di `FortifyServiceProvider` (keep `ResetUserPassword` + rate limiter); root route jadi redirect closure (authed → `dashboard`, guest → `saml.redirect`) + hapus `welcome.tsx`; `bootstrap/app.php` (`redirectGuestsTo` → `saml.redirect`, CSRF except `saml/acs`); `AppServiceProvider` (tambah `URL::forceRootUrl` + `forceScheme`); hapus routes `auth/redirect` (authsso) + `auth/oidc/callback` (ssocallback) + `OIDCController.php`; keep package Fortify (chisel/passkeys bergantung)
    - Verifikasi: SamlTest port hijau; `php artisan test --compact`; `vendor/bin/pint --dirty --format agent`; `npm run types:check`

## Priority #1 — Deadline & Eskalasi (FR-2.1, FR-2.2, OQ 6) ✅ SELESAI

- [x] Migration: kolom `assigned_at` di `tb_work_order`
    - File: `database/migrations/2026_10_07_000001_add_assigned_at_to_tb_work_order.php`
    - Verifikasi: `php artisan test --filter=DeadlineEscalationTest` (12 passed)
- [x] Deadline dihitung dari **tanggal assign** (bukan `created_at`)
    - File: `app/Models/WorkOrder.php` — `deadlineStartDate()` + `calculateDeadline()`; `assigned_at` di-set saat `assignEmployees()` dan saat HOD approve dengan inline `assigned_employees`
    - Keputusan (grilling Q10, opsi B): eskalasi H+3/H+5/H+6 dihitung dari **tanggal assign** (elapsed business days), bukan hari telat
- [x] Service `EscalationRecipientResolver` — penerima eskalasi sesuai OQ 6
    - File: `app/Services/EscalationRecipientResolver.php`
    - H+3 → Team Leader **department** (bukan assigned employees/TL global); H+5 → `hod_user_id` → `manager_user_id` → semua role `hod` di department → Admin Tenant + log kritikal; H+6 → DGM/GM
- [x] Rewrite `CheckWorkOrderDeadlines` pakai resolver + broadcast realtime
    - File: `app/Console/Commands/CheckWorkOrderDeadlines.php` — pakai `deadlineStartDate()` + `EscalationRecipientResolver`; semua eskalasi di-broadcast via `AppNotificationService::createForUser`
- [x] Notifikasi realtime diterima bell (bug: relasi `User::employee()` hilang, jalur User tak di-broadcast)
    - File: `app/Models/User.php` (+`employee()` HasOne via email, `routeNotificationForWahaWhatsApp`), `app/Notifications/AppNotificationService.php` (+`createForUser`), `app/Events/NotificationCreated.php` (channel di-scope ke user id; Employee dipetakan ke User via email), `routes/channels.php`, `app/Http/Controllers/NotificationController.php` (gabung notifikasi User + Employee), `resources/js/hooks/use-notifications.ts` (listen `notifications.{userId}`)
- [x] Verifikasi: 12 test DeadlineEscalationTest hijau; 25 test narrow set hijau; pint passed; phpstan 0 error di semua file yang disentuh
    - Catatan: 2 kegagalan `SamlSmokeTest` pre-existing (config SAML/OIDC, tidak terkait perubahan ini)

## Priority #2 — Work Order Flow Core (FR-1.6, FR-1.7, FR-1.9) — BELUM

- [ ] Notifikasi in-app + WA saat assign karyawan ke WO (FR-1.6)
    - File: `app/Http/Controllers/WorkManagament/WorkOrderController.php` (`assignEmployees()` masih tanpa notifikasi)
- [ ] Upload foto pada submit hasil pekerjaan (FR-1.7)
    - File: `app/Http/Controllers/WorkManagament/WorkOrderController.php` (`submitResults()` hanya teks)
- [ ] Audit trail / status history per WO (FR-1.9) — butuh tabel + model baru
- [ ] Verifikasi: test baru per item + `php artisan test --compact` + `vendor/bin/pint --dirty --format agent`

## Priority #3 — Multi-tenancy Spatie + Konsolidasi Model Tenant (OQ 12, OQ 13) — BELUM

- [ ] Install `spatie/laravel-multitenancy` v4 (single-database)
    - Ref: https://spatie.be/docs/laravel-multitenancy/v4/installation/using-a-single-database
- [ ] Ganti trait custom `TenantAware`/`TenantService` dengan `BelongsToTenant` Spatie
- [ ] Konsolidasikan model `Tenant`/`Tenants` (tabel sama `tenants`) — hapus `Tenants` setelah semua referensi diperbarui
- [ ] Verifikasi: `TenantIsolationTest` + `TenantCrudTest` tetap hijau
