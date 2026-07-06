# Product Requirements Document (PRD)
## WhatsApp Gateway Management System (Integrasi WAHA)

| Metadata | Detail |
|---|---|
| Nama Fitur | WhatsApp Gateway Management |
| Versi Dokumen | 1.0 |
| Tanggal | 06 Juli 2026 |
| Status | Draft |
| Target Pengguna | Admin (Superadmin/IT Admin) |
| Backend WA Gateway | WAHA (WhatsApp HTTP API) |
| Tech Stack | Laravel 13, MySQL, Inertia.js, Laravel Echo |

---

## 1. Latar Belakang

Perusahaan membutuhkan sistem notifikasi otomatis via WhatsApp untuk memberi tahu **HOD (Head of Department)** setiap kali ada pengajuan/entri **worker (pekerja) baru** yang masuk ke sistem. Untuk mendukung kebutuhan ini, dibutuhkan sebuah modul internal **WhatsApp Gateway Management** yang memungkinkan Admin mengelola koneksi WhatsApp (melalui WAHA) langsung dari panel Laravel, tanpa perlu mengakses dashboard/backend WAHA secara terpisah.

Modul ini akan menjadi lapisan abstraksi (wrapper) antara aplikasi Laravel dan WAHA API, sehingga seluruh pengelolaan sesi WhatsApp (scan QR, cek status, logout, restart) terpusat di satu tempat dengan tampilan yang konsisten dan real-time.

---

## 2. Tujuan (Goals)

1. Memungkinkan Admin mengelola koneksi/sesi WhatsApp gateway (WAHA) sepenuhnya dari frontend Laravel.
2. Memberikan notifikasi WhatsApp otomatis ke HOD saat ada worker baru yang masuk ke sistem.
3. Menyediakan visibilitas status koneksi WA secara **real-time** tanpa perlu refresh halaman (via Laravel Echo).
4. Menyimpan konfigurasi API WAHA (base URL, API key, session name, dsb.) secara dinamis di database, bukan hardcode di `.env`.
5. Mengurangi ketergantungan Admin terhadap akses langsung ke server/dashboard WAHA.

### Non-Goals (Di Luar Cakupan)
- Fitur broadcast/mass messaging ke banyak nomor sekaligus (dapat menjadi fase berikutnya).
- Chat inbox dua arah (Admin membalas pesan masuk dari WhatsApp).
- Multi-tenant WA (banyak sesi untuk banyak perusahaan) — versi awal fokus pada satu atau beberapa sesi terbatas.

---

## 3. Target Pengguna & Role

| Role | Hak Akses |
|---|---|
| **Admin (Superadmin/IT)** | Full akses: konfigurasi API WAHA, scan QR, logout, restart session, monitoring status |
| **HOD** | Hanya penerima notifikasi WA (pasif, tidak ada akses ke modul ini) |
| **Sistem (internal)** | Trigger otomatis pengiriman notifikasi saat event "worker baru masuk" terjadi |

---

## 4. Ruang Lingkup Fitur (Scope)

### 4.1 Notifikasi WhatsApp ke HOD
- Saat data **worker baru** disimpan ke sistem, sistem otomatis mengirim pesan WA ke nomor HOD terkait departemen worker tersebut.
- Template pesan dapat dikonfigurasi (dynamic placeholder: nama worker, departemen, tanggal masuk, dsb.).
- Setiap pengiriman dicatat dalam log (sukses/gagal) untuk keperluan audit & retry.

### 4.2 Konfigurasi API WAHA di Database
- Admin dapat mengatur:
  - Base URL WAHA (contoh: `http://waha-server:3000`)
  - API Key / Bearer Token
  - Nama Session default
  - Webhook URL & Webhook Secret (untuk callback dari WAHA ke Laravel)
- Konfigurasi disimpan di tabel `whatsapp_configs`, bukan `.env`, sehingga bisa diubah tanpa deploy ulang.
- Terdapat fitur "Test Connection" untuk memvalidasi konfigurasi sebelum disimpan permanen.

### 4.3 Cek Session API & Tampilkan ke Frontend
- Laravel melakukan request ke endpoint WAHA (`GET /api/sessions` atau `GET /api/sessions/{session}`) untuk mengambil daftar & status seluruh session.
- Data ditampilkan dalam bentuk card/table di frontend Inertia: nama session, status (`STARTING`, `SCAN_QR_CODE`, `WORKING`, `FAILED`, `STOPPED`), nomor WA terhubung, waktu terakhir aktif.

### 4.4 Scan QR Code dari Laravel (Tanpa Akses Backend WAHA)
- Admin klik tombol **"Connect / Scan QR"** di frontend Laravel.
- Laravel memanggil endpoint WAHA untuk start session & mengambil QR code (`GET /api/{session}/auth/qr` dengan format image/base64).
- QR code ditampilkan langsung dalam modal di halaman Inertia (auto-refresh QR jika expired, sekitar tiap 20–30 detik selama status masih `SCAN_QR_CODE`).
- Setelah berhasil discan (status berubah ke `WORKING`), modal otomatis tertutup dan UI ter-update secara real-time (via Echo).

### 4.5 Logout WhatsApp via Pengaturan
- Tombol **"Logout Session"** di halaman pengaturan.
- Laravel memanggil endpoint WAHA `POST /api/sessions/{session}/logout`.
- Konfirmasi modal sebelum eksekusi (karena akan memutus koneksi device WA).
- Status di frontend langsung berubah menjadi `STOPPED`/`LOGGED_OUT` secara real-time.

### 4.6 Restart Session
- Tombol **"Restart Session"** untuk kondisi session freeze/error.
- Laravel memanggil `POST /api/sessions/{session}/restart`.
- Menampilkan loading state dan notifikasi toast hasil restart (berhasil/gagal).

### 4.7 Status Real-Time via Laravel Echo
- Setiap perubahan status session (dari WAHA webhook maupun polling internal) di-broadcast melalui Laravel Echo (menggunakan **Laravel Reverb** sebagai WebSocket server, atau Pusher sebagai alternatif).
- Frontend Inertia subscribe ke channel privat, contoh: `private-whatsapp.session.{session}`.
- Event yang di-broadcast: `SessionStatusUpdated`, `QrCodeUpdated`, `SessionDisconnected`.
- Tidak perlu refresh manual — indikator status (badge hijau/merah/kuning) update otomatis.

---

## 5. Arsitektur Sistem

```
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│   Inertia.js     │◄──────►│   Laravel 13 (App)   │◄──────►│   WAHA API      │
│   (Frontend)     │  HTTP  │  - Controllers        │  HTTP  │  (Docker)       │
│                  │        │  - WahaService        │        │                 │
└────────▲─────────┘        │  - Jobs/Queue         │        └────────┬────────┘
         │                  │  - Events/Listeners    │                 │
         │  WebSocket       │  - Webhook Controller  │◄────────────────┘
         │  (Laravel Echo)  └──────────┬─────────────┘   Webhook Callback
         │                             │
         │                    ┌────────▼────────┐
         └────────────────────┤ Laravel Reverb  │
                               │ (Broadcasting)  │
                               └─────────────────┘
```

**Alur Real-Time:**
1. WAHA mengirim event (status berubah / pesan masuk) via **Webhook** ke Laravel (`/webhook/waha`).
2. Laravel memvalidasi signature webhook, memproses data, lalu meng-*update* database.
3. Laravel men-*dispatch* event (`SessionStatusUpdated`) melalui `ShouldBroadcast`.
4. Laravel Reverb mem-broadcast event tersebut ke channel yang di-subscribe frontend.
5. Frontend (Inertia + Echo) menerima event dan meng-update UI tanpa reload.

Sebagai pelengkap, disarankan juga ada **Scheduled Job** (setiap 1–2 menit) yang melakukan polling `GET /api/sessions` sebagai fallback jika webhook gagal terkirim (untuk menjaga konsistensi data).

---

## 6. Desain Database

### 6.1 Tabel `whatsapp_configs`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | |
| base_url | varchar | Base URL WAHA server |
| api_key | varchar (encrypted) | API Key/Token WAHA |
| default_session | varchar | Nama session default |
| webhook_url | varchar | URL callback Laravel |
| webhook_secret | varchar (encrypted) | Secret validasi webhook |
| is_active | boolean | Konfigurasi aktif dipakai |
| created_at / updated_at | timestamp | |

### 6.2 Tabel `whatsapp_sessions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | |
| session_name | varchar (unique) | Nama session di WAHA |
| status | enum | STARTING, SCAN_QR_CODE, WORKING, FAILED, STOPPED |
| phone_number | varchar (nullable) | Nomor WA yang terhubung |
| qr_code | text (nullable) | Base64 QR terakhir |
| last_connected_at | timestamp (nullable) | |
| created_at / updated_at | timestamp | |

### 6.3 Tabel `whatsapp_notification_logs`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | |
| worker_id | bigint (FK, nullable) | Relasi ke data worker |
| hod_id | bigint (FK, nullable) | Relasi ke user HOD |
| phone_number | varchar | Nomor tujuan |
| message | text | Isi pesan terkirim |
| status | enum | PENDING, SENT, FAILED |
| response_payload | json (nullable) | Response mentah dari WAHA |
| retry_count | int (default 0) | |
| created_at / updated_at | timestamp | |

### 6.4 Tabel `whatsapp_message_templates` (opsional, untuk fleksibilitas)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint (PK) | |
| code | varchar (unique) | contoh: `worker_new_entry` |
| template | text | Isi template dengan placeholder `{nama}`, `{departemen}`, dsb. |
| is_active | boolean | |

---

## 7. Kebutuhan Fungsional (Functional Requirements)

| ID | Requirement | Prioritas |
|---|---|---|
| FR-01 | Admin dapat menambah/mengubah konfigurasi API WAHA (base URL, API key, webhook) | Must Have |
| FR-02 | Sistem dapat melakukan "Test Connection" ke WAHA sebelum konfigurasi disimpan | Must Have |
| FR-03 | Admin dapat melihat daftar semua session WAHA beserta statusnya | Must Have |
| FR-04 | Admin dapat memulai session baru & menampilkan QR code langsung di halaman Laravel | Must Have |
| FR-05 | Admin dapat logout session WA melalui UI, dengan konfirmasi | Must Have |
| FR-06 | Admin dapat restart session WA yang bermasalah | Must Have |
| FR-07 | Status koneksi WA (connect/disconnect) ter-update secara real-time tanpa reload | Must Have |
| FR-08 | Sistem otomatis mengirim notifikasi WA ke HOD saat worker baru masuk | Must Have |
| FR-09 | Setiap pengiriman notifikasi tercatat dalam log dengan status sukses/gagal | Should Have |
| FR-10 | Sistem dapat retry otomatis (queue) jika pengiriman notifikasi gagal | Should Have |
| FR-11 | Admin dapat mengelola template pesan notifikasi | Could Have |
| FR-12 | Sistem menerima & memproses webhook dari WAHA dengan validasi signature | Must Have |

---

## 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | API Key & Webhook Secret WAHA disimpan terenkripsi (Laravel `encrypted` cast). Endpoint webhook wajib validasi signature/token. Semua endpoint pengaturan WA dibatasi middleware role `admin`. |
| **Performa** | Pengiriman notifikasi WA dijalankan via **Queue Job** (async), tidak boleh blocking request utama saat worker baru disimpan. |
| **Reliabilitas** | Jika WAHA server down, sistem tetap dapat menyimpan data worker; notifikasi masuk antrian retry (backoff strategy, misal 3x percobaan). |
| **Real-time** | Update status maksimal delay 2–3 detik dari saat event terjadi di WAHA. |
| **Usability** | UI harus jelas menampilkan status (warna: hijau = connected, merah = disconnected, kuning = scanning/loading). |
| **Skalabilitas** | Desain database & service layer mendukung penambahan multi-session di masa depan. |
| **Observability** | Semua request ke WAHA API dicatat di log (Laravel log channel `whatsapp`) untuk debugging. |

---

## 9. Desain UI/UX — Glassmorphism (Modern & Professional)

### 9.1 Prinsip Desain
- **Efek Glass**: `backdrop-filter: blur(16-24px)`, background semi-transparan (`rgba(255,255,255,0.08–0.15)`), border tipis `1px solid rgba(255,255,255,0.2)`.
- **Warna dasar**: gradient background gelap-modern (dark navy → soft purple/blue) sebagai kontras agar efek glass terlihat jelas, dengan aksen warna brand (misal teal/indigo) untuk CTA.
- **Tipografi**: Font modern sans-serif (misal Inter/Plus Jakarta Sans), hierarki jelas antara heading dan body.
- **Shadow & Depth**: Soft shadow (`box-shadow` lembut) untuk memberi kesan card melayang.
- **Micro-interaction**: Transisi halus (200–300ms) saat status berubah, hover state pada tombol, skeleton loading saat fetch data session.

### 9.2 Halaman Utama Modul

**a. Dashboard WhatsApp Gateway**
- Card ringkasan: Total session, session aktif (connected), session terputus.
- List/grid card per session dengan glass-effect, masing-masing menampilkan:
  - Nama session
  - Badge status real-time (dot indikator + label)
  - Nomor WA terhubung (jika ada)
  - Tombol aksi: Connect/Scan QR, Logout, Restart

**b. Modal Scan QR**
- Modal dengan efek glass, QR code di tengah, countdown timer refresh, animasi loading saat menunggu scan, auto-close saat status `WORKING`.

**c. Halaman Pengaturan Konfigurasi API**
- Form glassmorphism: Base URL, API Key (masked/password field dengan toggle show), Webhook URL (readonly, auto-generate + tombol copy), tombol "Test Connection" dengan indikator hasil (✅/❌).

**d. Halaman Log Notifikasi**
- Tabel log dengan filter status (Sent/Failed/Pending), pencarian berdasarkan nama worker/HOD, tombol "Retry" untuk yang gagal.

### 9.3 Referensi Komponen (Inertia + Tailwind)
- Gunakan Tailwind CSS dengan custom utility class untuk efek glass, contoh:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}
```

---

## 10. Integrasi API WAHA (Referensi Endpoint)

> Catatan: nama endpoint mengikuti dokumentasi resmi WAHA (dapat berbeda tergantung versi WAHA yang digunakan — perlu validasi ulang saat implementasi).

| Fungsi | Method & Endpoint | Digunakan Untuk |
|---|---|---|
| List semua session | `GET /api/sessions` | FR-03 |
| Detail session | `GET /api/sessions/{session}` | FR-03, cek status |
| Start session | `POST /api/sessions/{session}/start` | FR-04 |
| Ambil QR code | `GET /api/{session}/auth/qr` | FR-04 |
| Logout session | `POST /api/sessions/{session}/logout` | FR-05 |
| Restart session | `POST /api/sessions/{session}/restart` | FR-06 |
| Stop session | `POST /api/sessions/{session}/stop` | Tambahan |
| Kirim pesan teks | `POST /api/sendText` | FR-08 |
| Set webhook | Dikonfigurasi saat start session (payload `webhooks`) | FR-12 |

### 10.1 Service Layer (Laravel)
Disarankan membuat class `App\Services\WahaService` sebagai wrapper seluruh HTTP call ke WAHA, agar controller tetap bersih (Single Responsibility). Contoh method:
- `getSessions()`
- `getSessionStatus($session)`
- `startSession($session)`
- `getQrCode($session)`
- `logoutSession($session)`
- `restartSession($session)`
- `sendTextMessage($session, $phone, $message)`

### 10.2 Webhook Handler
- Endpoint: `POST /webhook/waha`
- Validasi: cocokkan `webhook_secret` dari header/payload dengan yang tersimpan di `whatsapp_configs`.
- Event yang ditangani minimal: `session.status`, `message` (opsional untuk fase depan).
- Setelah data diproses → update tabel `whatsapp_sessions` → dispatch broadcast event.

---

## 11. Alur Kerja Utama (User Flow)

### 11.1 Flow: Menghubungkan WhatsApp (Scan QR)
1. Admin membuka halaman **WhatsApp Gateway > Dashboard**.
2. Admin klik **"Connect Session"**.
3. Laravel memanggil `startSession()` lalu `getQrCode()`.
4. QR ditampilkan di modal.
5. Admin scan QR menggunakan HP.
6. WAHA mengirim webhook status `WORKING` → Laravel broadcast event → Frontend auto-update, modal tertutup, badge berubah hijau.

### 11.2 Flow: Notifikasi Worker Baru ke HOD
1. User/staff menginput data worker baru melalui modul terkait.
2. Event `WorkerCreated` di-*fire* oleh sistem.
3. Listener `SendWorkerNotificationToHod` menangkap event → dispatch ke **Queue Job**.
4. Job memanggil `WahaService::sendTextMessage()` dengan nomor HOD & pesan sesuai template.
5. Hasil pengiriman dicatat di `whatsapp_notification_logs`.
6. Jika gagal → job retry otomatis (maksimal 3x, dengan backoff).

### 11.3 Flow: Logout / Restart Session
1. Admin membuka halaman pengaturan session.
2. Klik **Logout** atau **Restart** → muncul modal konfirmasi.
3. Setelah dikonfirmasi, Laravel memanggil endpoint terkait ke WAHA.
4. Status di-update di database & broadcast real-time ke frontend.

---

## 12. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Admin dapat menyimpan konfigurasi WAHA dan berhasil "Test Connection".
- [ ] Admin dapat melihat QR code langsung di Laravel dan berhasil connect tanpa membuka dashboard WAHA.
- [ ] Status session berubah otomatis di UI (tanpa refresh) dalam waktu ≤ 3 detik setelah perubahan aktual di WAHA.
- [ ] Admin dapat logout & restart session dari UI dengan konfirmasi, dan hasilnya tercermin real-time.
- [ ] Saat worker baru disimpan, HOD terkait menerima pesan WA dalam waktu wajar (≤ 1 menit, tergantung antrian).
- [ ] Semua percobaan pengiriman notifikasi (sukses/gagal) tercatat di log dan dapat di-retry manual oleh Admin.
- [ ] Data sensitif (API Key, Webhook Secret) tidak tampil dalam bentuk plain text di frontend maupun database.

---

## 13. Asumsi & Batasan (Assumptions & Constraints)

- WAHA sudah ter-deploy dan dapat diakses oleh server Laravel (baik dalam satu jaringan/Docker network maupun via domain publik).
- Laravel Reverb (atau alternatif seperti Pusher/Soketi) sudah dikonfigurasi untuk mendukung broadcasting real-time.
- Nomor WhatsApp yang digunakan sebagai gateway adalah nomor bisnis/dedicated (bukan nomor pribadi), karena berisiko banned jika volume pengiriman tinggi.
- Relasi antara Worker → Departemen → HOD sudah ada di sistem existing (di luar cakupan PRD ini, hanya dikonsumsi datanya).

---

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| WAHA server down | Notifikasi tidak terkirim | Queue dengan retry + alert ke Admin jika gagal berkali-kali |
| Session logout otomatis oleh WhatsApp (misal ban/limit) | HOD tidak menerima notifikasi | Monitoring status real-time + notifikasi internal (email/dashboard alert) ke Admin saat status `FAILED`/`STOPPED` |
| Webhook tidak sampai ke Laravel (network issue) | Status di UI tidak update | Fallback scheduled polling tiap 1–2 menit |
| Kebocoran API Key/Webhook Secret | Akses tidak sah ke WAHA | Enkripsi di database, tidak pernah expose di response API/frontend |

---

## 15. Roadmap Pengembangan (Saran Fase)

| Fase | Cakupan |
|---|---|
| **Fase 1** | Konfigurasi WAHA, koneksi session (scan QR, logout, restart), status real-time |
| **Fase 2** | Notifikasi otomatis worker → HOD + log notifikasi + retry |
| **Fase 3** | Template pesan dinamis, alerting ke Admin saat session terputus |
| **Fase 4 (opsional)** | Multi-session, broadcast message, laporan analitik pengiriman |

---

## 16. Lampiran — Tech Stack Detail

| Layer | Teknologi |
|---|---|
| Backend Framework | Laravel 13 |
| Database | MySQL |
| Frontend | Inertia.js (Vue/React — sesuaikan dengan stack tim) + Tailwind CSS |
| Real-time Broadcasting | Laravel Echo + Laravel Reverb (rekomendasi) |
| Queue | Laravel Queue (database/redis driver) untuk pengiriman notifikasi async |
| WhatsApp Gateway | WAHA (WhatsApp HTTP API) |
| Styling | Glassmorphism design system (Tailwind custom utilities) |

---

*Dokumen ini adalah draft awal dan dapat disesuaikan lebih lanjut berdasarkan diskusi teknis dengan tim development dan hasil eksplorasi dokumentasi resmi WAHA versi yang digunakan.*
