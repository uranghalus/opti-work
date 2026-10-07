# AGENTS.md — Konfigurasi Project & Memory

## Identitas Project

- **Nama:** opti-works
- **Tipe:** Web app — Work Management System (WMS)
- **Tech stack:**
    - Backend: Laravel + MySQL
    - Frontend: Inertia + React
    - RBAC: Spatie Laravel Permission
    - Multi-cabang: `stancl/tenancy` (mode **single-database**, `BelongsToTenant` / `tenant_id` + identifikasi path) — lihat `docs/adr/0002`
    - Realtime: Laravel Reverb (broadcast) + `app_notifications`
- **Status:** MVP — Draft untuk review. Item bertanda **Open Question** di PRD BELUM final.
- **Relasi proyek:** opti-works = **rebuild bersih** dari `opti-work2` (implementasi referensi). Scope MVP **dikurangi**: Inventory, Kelompok Barang, Surat Masuk/Keluar, dan Tenant CRUD **tidak diporting**.
- **Referensi implementasi:** repo `opti-work2` (untuk pola migration, naming, dan bukti teknis seperti `app_notifications`, `extend_requests`, `add_deadline_and_escalation_to_tb_work_order`).

---

## Domain & Business Context

**Work Management System (WMS)** mengelola pekerjaan internal lintas department: perbaikan, pemeliharaan, dan permintaan bantuan antar-department. Menggantikan proses manual (chat/lisan) yang tidak punya audit trail dan tidak punya eskalasi otomatis.

### Persona Utama

| Persona                 | Deskripsi                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Budi — HOD**          | Terima WO, putuskan eksekusi langsung vs dijadwalkan, assign karyawan, approve/reject extend, verifikasi hasil sebelum WO closed. |
| **Sari — Field Worker** | Terima notifikasi assign, kerjakan WO/Daily Work, submit hasil (foto + catatan) untuk diverifikasi HOD.                           |

### Role Baseline (Spatie)

Super Admin, Admin Tenant/Cabang, General Manager/Deputy GM (DGM), HOD, Team Leader, Karyawan, Karyawan Pelaksana (Field Staff), Viewer/Auditor.

**Catatan penting:**

- **Requester BUKAN role eksklusif** — setiap user terautentikasi berpotensi jadi Requester (keputusan Round 1).
- **Team Leader** adalah role Spatie (`team_leader`); department dianggap punya TL jika ada user ber-role tersebut di department itu.
- **Direksi ditunda** — tidak dibuat sampai ada kebutuhan nyata. Super Admin setara pengelola konfigurasi sistem/RBAC/master data.

---

## Goals & Non-Goals

### Goals (MVP)

1. Sistem terpusat: create, assign, schedule, execute, close Work Order — termasuk lintas department.
2. Eskalasi keterlambatan otomatis berjenjang: Team Leader → HOD → DGM/GM.
3. Daily Work per karyawan (template rutin + tugas tambahan HOD).
4. Notifikasi realtime in-app untuk setiap perubahan status relevan.
5. RBAC via Spatie — konfigurasi tanpa deploy ulang.
6. Work Data Management sebagai histori/audit trail per WO.

### Non-Goals (MVP — jangan diimplementasikan)

- ❌ Inventory, Kelompok Barang, Surat Masuk/Keluar
- ❌ Management Tenant (CRUD penyewa tempat) → v2
- ❌ Integrasi eksternal (WA/email gateway, sistem absensi) → Nanti
- ❌ Reporting/analytics dashboard lanjutan → Nanti

---

## Aturan Bisnis Kritis (WAJIB DIPATUHI)

### Kategori Work Order

| Kategori                    | Perilaku                                                                |
| --------------------------- | ----------------------------------------------------------------------- |
| **Normal**                  | HOD pilih: eksekusi langsung ATAU dijadwalkan                           |
| **Urgent by Accident**      | Sistem **tidak menampilkan opsi jadwal** — WO wajib dieksekusi langsung |
| **Urgent Request by Owner** | HOD pilih: eksekusi langsung ATAU dijadwalkan                           |

### Deadline & SLA (SETTLED Round 2)

- **Urgent = 3 hari kerja**
- **Normal = 6 hari kerja**
- Deadline dihitung dari **tanggal assign**, bukan tanggal submit WO
- Kalender libur configurable via `config/holidays.php`

### Eskalasi Keterlambatan

| Hari telat | Penerima notifikasi                      |
| ---------- | ---------------------------------------- |
| H+3        | Team Leader (jika ada di department tsb) |
| H+5        | HOD                                      |
| H+6        | DGM/GM                                   |

Field terkait di `work_orders` (dari migration `add_deadline_and_escalation_to_tb_work_order`): `deadline_date`, `escalation_h3_sent_at`, `escalation_h5_sent_at`, `escalation_h6_sent_at`, `is_escalated`, `extend_count`, `extend_reason`, `extended_at`.

### Extend Deadline WO Telat

- Maks **3 hari** per request
- Maks **3 approved extends** per WO
- Approval berjenjang: Team Leader (jika ada) → HOD; jika tidak ada TL, langsung HOD
- **Cek blokir extend pending duplikat** per WO (perbaikan atas gap opti-work2)
- Terpisah dari **Extend Work Schedule** (jadwal WO normal, wajib approval DGM/GM)

### Fallback HOD Tidak Aktif (SETTLED Round 2)

Rantai penerima notifikasi:
`hod_user_id` → `manager_user_id` (deputy) → semua user ber-role `hod` di department tsb.
Jika tetap kosong → notifikasi tersimpan ke Admin Tenant cabang + log kritikal.

### Notifikasi (SETTLED Round 2)

- **In-app only di MVP**: bell + toast + history tersimpan di DB
- Broadcast via **Reverb**
- Muncul saat user login kembali jika sebelumnya offline
- WA/email gateway → fase berikutnya

### Daily Work Template (SETTLED Round 2, opsi A)

- Template **per karyawan** (dikelola HOD)
- Digabung **virtual** dengan tugas tambahan saat menampilkan daftar harian
- Tidak disimpan sebagai satu record gabungan di DB

---

## Modul MVP

| Fitur                                    | Requirement ID |
| ---------------------------------------- | -------------- |
| Work Order (Create/Update/Review/Assign) | FR-1.x         |
| Work Order Terjadwal + Eskalasi Deadline | FR-2.x         |
| Work Data Management (histori per WO)    | FR-3.x         |
| Lintas Department Work Order             | FR-4.x         |
| Daily Work Management                    | FR-5.x         |
| RBAC (Spatie)                            | FR-6.x         |
| Realtime Notification                    | FR-7.x         |

---

## Sketsa Data Model

**Konvensi:** penamaan schema mengikuti konvensi Laravel seperti referensi `opti-work2` — **bukan** `fld_*` dari ERD lama.

Tabel inti:

- `users`, `employees`, `positions`, `departments`, `divisions`, `tenants`
- `work_orders`, `work_planning`, `work_daily`, `work_data`, `work_data_pekerja`
- `schedule_wd`, `extend_requests`, `app_notifications`

Field eskalasi & extend di `work_orders`: lihat **Aturan Bisnis Kritis → Eskalasi Keterlambatan**.

**Catatan dari ERD lama (hanya referensi, jangan ditiru penamaannya):**

- `tb_karyawan` **tidak punya FK department** — hanya `fld_divisi`
- `fld_call_sign` (bukan "tanda tangan digital") + `fld_user_image`
- `fld_business_plan` (bukan "business_meeting") di work_order
- `tb_work_daily` FK masih ambigu (terbaca `fld_id_work_daily`, kemungkinan `fld_id_work_order`) — konfirmasi saat development
- `tb_tenant` `fld_logo` masih ambigu — konfirmasi saat development

---

## Success Criteria (SETTLED Round 2)

"Selesai" didefinisikan sebagai:

1. ✅ Lulus seluruh skenario **UAT kritikal** (mengadopsi 13 skenario UAT dari PRD referensi `opti-work2` §8.2)
2. ✅ **Test suite hijau**
3. ✅ **Pilot live di 1 department** tanpa insiden kritikal

---

## Aturan Kerja dengan Open Question

PRD masih punya **Open Question** yang belum settled. Saat mengerjakan:

- **JANGAN** mengambil keputusan final atas Open Question tanpa konfirmasi user.
- Jika menemukan kode yang bergantung pada OQ, tulis komentar `// OQ: <nomor>` dan tanyakan.
- Jika ragu apakah sesuatu masuk scope MVP atau bukan, **cek tabel Modul MVP di atas** dulu, lalu tanya.

**OQ yang sudah SETTLED (jangan diangkat lagi):**

1. Requester bukan role eksklusif
2. Deadline: urgent 3 hari, normal 6 hari
3. Extend: maks 3 hari/request, maks 3 approved/WO
4. Template Daily Work per karyawan
5. Team Leader = role Spatie `team_leader`
6. Fallback HOD: hod → manager → semua role hod
7. Notifikasi in-app only di MVP
8. "Selesai" = UAT + test suite + pilot
9. Extend Request = tabel `extend_requests` terpisah
10. Field ERD sudah diverifikasi (lihat Sketsa Data Model)
11. Super Admin = pengelola konfigurasi; Direksi ditunda

---

## Agent Skills Integration (aihero.dev)

Project ini mengadopsi skills dari [aihero.dev](https://www.aihero.dev/skills) untuk alur kerja: **PRD → spec → issues → implement → review**.

### Struktur Folder

| Folder      | Fungsi                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.scratch/` | **Issue tracker lokal berbasis Markdown.** Setiap issue disimpan di `.scratch/<fitur>/issues/`. Ini sumber kebenaran untuk issue lokal. Contoh: `.scratch/wms-mvp/issues/01-foundation-rbac-tenant-master-data.md` |
| `docs/`     | **Arsip read-only** hasil riset skills. Berisi `adr/` (Architecture Decision Records) dan `agents/` (dokumentasi agent workflow). Contoh: `docs/adr/0001-tenant-scoping.md`                                        |
| `issues/`   | **Hasil akhir skill `to-issues`.** Daftar issue yang sudah dipecah dari spesifikasi, siap dikerjakan.                                                                                                              |

### Alur Kerja

1. **PRD** → diproses skill `to-spec` untuk menghasilkan spesifikasi teknis.
2. **Spesifikasi** → diproses skill `to-issues` menjadi daftar issue di `issues/`.
3. **Issue** → dikerjakan dengan skill `implement` (TDD: red-green slice per seam).
4. **Code review** → dijalankan skill `code-review` sebelum commit.
5. **Catatan sesi** → dicatat di vault Obsidian (`Sessions/`), termasuk file yang diubah dan keputusan yang diambil.

### Aturan Dokumentasi Terkait Skills

- `docs/` = **arsip read-only**; jangan menulis balik ke `docs/` kecuali diminta eksplisit.
- Setiap file di `.scratch/` dan `issues/` yang berisi keputusan desain atau pola berulang **wajib disalin** ke vault (`Decisions/` atau `Patterns/`).
- File `.scratch/` yang issue-nya sudah selesai boleh dihapus, tapi catatan referensinya tetap ada di vault.
- `docs/adr/` berisi ADR resmi; setiap ADR baru **wajib di-link** ke `Decisions/` di vault.

### Kapan Mengaktifkan Skill

- **`to-spec`** — ada PRD baru / update PRD yang perlu jadi spec teknis.
- **`to-issues`** — spec sudah siap, perlu dipecah jadi issue.
- **`triage`** — ada issue baru di `.scratch/` yang perlu diprioritaskan.
- **`implement`** — issue siap dikerjakan (mulai dari seam yang disepakati).
- **`code-review`** — setelah implementasi, sebelum commit.
- **`ask-matt`** — ragu skill mana yang harus dipakai.

---

## Memory & Dokumentasi

Simpan seluruh catatan penting project ini ke vault Obsidian di path berikut.
**JANGAN tanya ulang lokasi vault di tiap sesi baru.**

```text
D:\SecondBrain\01 Projects\opti-works
├── Context\       ← konteks project: stack, konvensi, constraint
├── Decisions\     ← keputusan teknis kecil sehari-hari + alasannya
├── Patterns\      ← pola/konvensi kode yang berulang
├── Mistakes\      ← histori bug/kesalahan dan solusinya
├── Sessions\      ← development log tiap sesi kerja
├── Planning\      ← rencana ke depan: apa yang mau dikerjakan selanjutnya
├── Meetings\      ← hasil rapat terkait project ini
└── Architecture\  ← dokumentasi arsitektur & desain sistem
```

Buat folder yang belum ada secara otomatis saat pertama kali dibutuhkan.

> Catatan: aturan "Documentation Files" di bagian Laravel Boost (di bawah) berlaku untuk dokumentasi di dalam repo. Catatan di vault Obsidian dikecualikan, karena memang diwajibkan oleh file ini.

### Kapan pakai folder yang mana

- **Context/** — fakta dasar project yang jarang berubah. Termasuk: PRD, stack, constraint, glossary (WO, HOD, DGM, TL, Daily Work, Work Data).
- **Decisions/** — keputusan teknis kecil ("kenapa pakai X bukan Y") + alasannya. Termasuk hasil Round 1/2/3 dari PRD.
- **Patterns/** — konvensi kode berulang (penamaan endpoint, struktur controller, dst).
- **Mistakes/** — bug/kesalahan yang pernah terjadi dan cara menghindarinya lagi.
- **Sessions/** — log tiap sesi kerja (lihat Development Log di bawah).
- **Planning/** — hal yang MASIH AKAN dikerjakan: fitur berikutnya, backlog, roadmap. Tandai/pindahkan item ke Sessions/ begitu selesai dikerjakan.
- **Meetings/** — satu file per rapat, format nama `YYYY-MM-DD-topik-singkat.md`, berisi tanggal, siapa hadir (kalau disebutkan), poin bahasan, action item.
- **Architecture/** — desain sistem: struktur folder & tanggung jawab tiap bagian, alur data/request, diagram (boleh pakai kode Mermaid dalam markdown), dependency antar modul.

---

## Sebelum Membuat Catatan Baru: Cek Duplikat

Sebelum bikin file baru di folder manapun (kecuali Sessions/, yang memang selalu baru per sesi), cari dulu apakah sudah ada catatan dengan topik serupa:

- Ada yang serupa → update catatan itu, jangan bikin file baru terpisah.
- Cukup beda untuk dipisah → buat baru, tapi hubungkan `[[wikilink]]` ke yang lama.
- Ragu → tanya dulu sebelum memutuskan gabung atau bikin baru.

## Konvensi Penamaan File

- Format: `kebab-case-huruf-kecil.md` (contoh: `fix-qr-scan-bug.md`), kecuali Sessions/ dan Meetings/ yang pakai format tanggal.
- Hindari nama generik (`catatan.md`, `note1.md`) — nama harus deskriptif.

## Vault Sync (docs/ → vault)

- `docs/` di repo = arsip read-only. Sumber kebenaran = vault.
- Tiap sesi, cek file baru/berubah di `docs/`, salin isinya ke vault:
    - Roadmap/spesifikasi → `Context/`
    - Keputusan desain (ADR) → `Decisions/`
    - Pola berulang → `Patterns/`
- Jangan tulis balik dari vault ke `docs/` kecuali diminta eksplisit.
- File sekali-pakai / data test user (contoh: sample JSON berisi email) langsung buang, jangan masuk vault.

## Data Eksternal untuk Migrasi (`D:\resources\<nama-project>\`)

File data mentah untuk keperluan migrasi (Excel, CSV, dll) TETAP di lokasi aslinya (`D:\resources\<nama-project>\`) — JANGAN disalin/dipindah isinya ke dalam vault. Vault hanya menyimpan CATATAN REFERENSI tentang data itu, bukan datanya sendiri:

- Buat/update satu catatan di `Context/master-data.md` yang berisi:
    - Path lengkap ke file sumber (contoh: `D:\resources\opti-works\data-karyawan-2026.xlsx`)
    - Deskripsi singkat isi file (untuk migrasi apa, data apa saja)
    - Struktur/skema kolom penting (nama kolom + artinya), TANPA menyalin data baris/isi aslinya
    - Tanggal terakhir file itu diketahui berubah/diperbarui
    - Catatan status migrasi (belum diproses / sedang dikerjakan / sudah selesai)
- Kalau ada beberapa file data berbeda untuk project yang sama, tambahkan sebagai section terpisah dalam file yang sama (`Context/master-data.md`).
- JANGAN pernah menyalin isi baris data (nama, email, nomor telepon, data transaksi, dll) ke dalam catatan vault manapun — cukup strukturnya saja.
- Kalau file sumber sudah tidak relevan/migrasi selesai, update statusnya jadi "selesai" — jangan hapus catatannya (untuk jejak histori).

---

## Development Log

Pola: **bulan → tanggal → file per waktu kejadian**.

### Struktur folder per bulan, lalu per tanggal

```text
Sessions/
├── 2026-10/
│   ├── 03/
│   │   ├── 1120-setup-stancl-tenancy.md
│   │   ├── 1530-setup-spatie-rbac.md
│   │   └── ...
│   ├── 04/
│   │   └── ...
│   └── changelog.md   ← ringkasan seluruh sesi BULAN INI
├── 2026-11/
│   └── ...
```

- Tiap entri session = satu file di `Sessions/YYYY-MM/DD/`.
- Nama file: `HHmm-topik-singkat.md`, jam WITA (UTC+8). Contoh: `Sessions/2026-10/03/1120-setup-stancl-tenancy.md`.
- Isi tiap file: jam, apa yang dilakukan, folder/file yang diubah lengkap.

### changelog.md — ringkasan cepat per bulan

Struktur `Sessions/YYYY-MM/changelog.md`:

```markdown
## Ringkasan

- (diisi saat rollup bulanan: 3-5 poin highlight)

## Log

- 03, 11:20 — Setup stancl/tenancy single-database → [[Sessions/2026-10/03/1120-setup-stancl-tenancy]]
```

- Setiap entri sesi baru, tambahkan SATU baris ringkas di paling atas bagian `## Log` (urutan terbaru di atas).
- **Rollup bulanan:** setiap awal bulan / saat diminta "rapikan log bulan lalu", ringkas `## Log` bulan itu jadi 3-5 poin highlight dan simpan di bagian `## Ringkasan`. File detail per tanggal TIDAK dihapus.
- Kalau ada item di Planning/ yang selesai, tandai selesai dan sebutkan di changelog sesi.

### Relasi Sessions → Decisions

Sessions/ = log mentah. Decisions/ = rangkuman KEPUTUSAN/HASIL.

Setelah menyelesaikan sesuatu yang signifikan (bukan fix kecil harian):

1. Buat/update catatan di Decisions/ — APA yang diputuskan dan MENGAPA.
2. Tambahkan `[[wikilink]]` ke Sessions sumber.
3. Di Sessions terkait, tambahkan bagian `Terkait:` yang menyebut balik Decisions-nya.

Bug kecil / perubahan rutin cukup di Sessions.

---

## Memory Linking (Obsidian wikilink)

Format: `[[folder/nama-tanpa-md]]` (tanpa `.md`).

- Setiap file vault baru wajib di header:
    - Link balik `[[Index]]`.
    - Minimal satu link ke file terkait.
- Setiap sesi selesai, update `Index.md`: tambah baris link + ubah `Last updated`.
- Setiap session log wajib punya bagian `Terkait:`.
- Jangan biarkan file yatim (tanpa link masuk/keluar).

### Format Frontmatter

```yaml
---
created: <tanggal>
tags: [<tag relevan>]
status: <active|done|archived>
---
```

---

## Di Awal Sesi Baru

**WAJIB: baca `TODO.md` (root repo) PERTAMA — ini titik resume.**

Kalau user hanya bilang *"lanjut task terakhir"* / *"continue"* / *"pick up where we left off"*,
itu artinya: kerjakan **item checkbox pertama yang belum tercentang** di `TODO.md`.
Jangan mulai dari nol, jangan tunggu user menjelaskan lagi — `TODO.md` sudah
menjelaskan konteks, file yang disentuh, dan cara verifikasi.

1. **Baca `TODO.md`** — item teratas yang belum `[x]` = pekerjaan sesi ini.
2. Baca `Context/`, `Decisions/`, `Planning/` di vault.
3. Baca PRD (`.scratch/` atau `Context/prd.md`) untuk konteks fitur.
4. Cek `.scratch/<fitur>/issues/` untuk issue yang sedang dikerjakan.
5. Cek `docs/` untuk file baru/berubah yang perlu disync ke vault.

### Aturan Todo List (`TODO.md`)

- `TODO.md` = **sumber kebenaran status kerja yang sedang berjalan.** Selalu di-update
  di akhir setiap sesi kerja (centang `[x]`, tambah item baru, tulis blocker).
- Format: checkbox `- [ ]` / `- [x]`, setelahnya nama item, lalu baris detail
  (file yang disentuh + cara verifikasi) di indentasi.
- Update `TODO.md` **di sesi yang sama** saat item selesai — jangan ditunda ke sesi berikutnya.
- Commit `TODO.md` bersama perubahan kode, bukan terpisah.

---

## Coding Philosophy

- Baca kode yang ada sebelum menulis kode baru. Ikuti pola project (`opti-work2` sebagai referensi).
- Perubahan minimal: hanya yang diminta. Jangan refactor di luar scope.
- Perbaiki akar masalah, bukan gejalanya.
- Jangan implementasikan fitur yang ada di Non-Goals kecuali diminta eksplisit.

## Safety

- Konfirmasi dulu sebelum: `git push --force`, `rm -rf`, `DROP TABLE`, hapus branch.
- Jangan pernah commit: `.env`, file kredensial, API key, secrets.
- Jangan bypass `--no-verify` atau force tanpa izin eksplisit.
- Jangan pernah force-push ke branch `main`/`master`.

---

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application running on PHP 8.4. You are an expert with the Laravel ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Framework and package guidelines that only apply to specific paths (testing, frontend, components) also live there, under `.ai/rules/boost` — this is not just recorded decisions, it is load-bearing guidance you have not seen inline. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.
- Record a rule with `record-rule` only when the user explicitly asks for one. Instructions for the work at hand are not rules, no matter how emphatic: "remove this typo", "use X here" are work to do, not rules to record. Never record a rule on your own initiative, as a byproduct of a change, or to summarize what you just did. When the user does ask, pass a `glob` (e.g. `app/Http/Controllers/**`), a short `title`, and a few-line `note`. Use `record-rule` rather than your native memory or notes tool, because native memory is personal and session-scoped, while only `.ai/rules` is shared with the team and persists in the repo.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This project uses Pest. Create tests with `php artisan make:test --pest {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/pest` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.
- After the feature tests pass, ask the user to run the complete suite with `php artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
