Tentu. Untuk aplikasi majelis ta'lim seperti ini, saya sarankan arsitekturnya dibuat offline-first, dengan SQLite sebagai sumber data utama di sisi Flutter dan backend hanya sebagai sumber sinkronisasi konten.

Berikut PRD yang bisa langsung dijadikan dasar development.

# PRD: Aplikasi Majelis Ta'lim

## 1. Overview

Aplikasi Majelis Ta'lim adalah aplikasi mobile berbasis Flutter yang menyediakan kumpulan amalan, maulid, sholawat, qosidah, dan tawassul dalam format digital.

Aplikasi dirancang dengan pendekatan offline-first sehingga seluruh konten utama tetap dapat digunakan tanpa koneksi internet.

Pada instalasi pertama, aplikasi sudah membawa database SQLite yang berisi seluruh konten awal. Setiap kali aplikasi dijalankan, aplikasi akan memeriksa versi database ke backend API (Express.js + MongoDB) menggunakan API key.

Jika versi lokal berbeda dengan versi yang tersedia di server, aplikasi akan mengambil database atau dataset terbaru dari backend dan memperbarui database lokal.

Jika tidak tersedia koneksi internet, aplikasi langsung menggunakan database lokal tanpa mengganggu pengguna.

## 2. Tujuan

Tujuan utama:

1. Menyediakan kumpulan bacaan majelis ta'lim secara digital.
2. Memungkinkan seluruh konten dibaca tanpa koneksi internet.
3. Mempermudah pengelolaan dan pembaruan konten melalui backend.
4. Memastikan konten lokal selalu dapat digunakan meskipun server tidak tersedia.
5. Menghindari ketergantungan aplikasi terhadap koneksi internet saat kegiatan majelis berlangsung.
6. Memungkinkan penambahan dan perubahan konten tanpa harus menerbitkan versi aplikasi Flutter baru.

## 3. Platform

### Mobile

Flutter.

Target:

* Android
* iOS

### Local Database

SQLite.

Flutter menggunakan database lokal sebagai sumber data utama untuk tampilan konten.

### Backend

REST API berbasis **Node.js + Express.js**.

Database backend: **MongoDB**.

Seluruh request ke API (mobile sync maupun admin) wajib menggunakan **API key**.

Backend bertanggung jawab untuk:

* Menyimpan source of truth konten di MongoDB
* Menyediakan versi database
* Menyediakan konten terbaru
* Mengelola kategori
* Mengelola bacaan
* Mengelola urutan konten
* Mengelola perubahan konten
* Menerbitkan snapshot SQLite untuk sinkronisasi Flutter
* Mengautentikasi setiap request dengan API key

## 4. Struktur Konten

Aplikasi memiliki empat kelompok utama.

### Group Amalan

1. Ratib al-Aththas
2. Ratib al-Haddad
3. Hizib Nawawi
4. Niat Ta'lim
5. Dzikir Jalalah
6. Ya Robbana Tarofna

### Group Maulid

1. Maulid Adh-Dhiya Ulami
2. Maulid Diba
3. Maulid Simtudduror
4. Maulid Barzanji

### Group Sholawat & Qosidah

1. Sholawat Busyro
2. Sholawat Kheir
3. Qosidah Ilahi Bijahil Anbiya

### Group Tawassul

1. Doa Tawassul

Struktur ini harus bersifat dinamis sehingga admin dapat menambahkan kategori maupun bacaan baru dari backend tanpa perlu perubahan pada aplikasi.

## 5. User Flow

### 5.1 First Installation

Alur instalasi pertama:

```text
Install App
     |
     v
Initialize SQLite
     |
     v
Load Bundled Database
     |
     v
Database Ready
     |
     v
Open Home
```

Database awal sudah dibundel bersama aplikasi.

Contohnya:

```text
assets/database/majelis.db
```

Pada first launch:

1. Flutter membuka database bawaan.
2. Database disalin ke lokasi database aplikasi.
3. Database lokal menjadi database aktif.
4. Aplikasi dapat langsung digunakan.

Tidak diperlukan koneksi internet untuk proses tersebut.

## 6. Application Startup

Setiap kali aplikasi dibuka:

```text
             Start App
                 |
                 v
        Open Local SQLite
                 |
                 v
        Show Local Content
                 |
                 v
       Check Internet Connection
             /         \
           No           Yes
           |             |
           v             v
     Use Local DB   Check DB Version
                         |
                    /            \
              Same Version    Different
                   |              |
                   v              v
             Continue App    Download Update
                                  |
                                  v
                           Validate Update
                                  |
                                  v
                            Replace SQLite
                                  |
                                  v
                             Reload Data
```

Penting: pengecekan update tidak boleh membuat pengguna harus menunggu aplikasi terbuka.

Aplikasi sebaiknya langsung menampilkan data lokal terlebih dahulu, kemudian melakukan sinkronisasi di background.

## 7. Offline First

Prinsip utama aplikasi:

> Local database is the primary runtime data source.

Artinya seluruh halaman konten membaca SQLite, bukan API secara langsung.

Contoh:

```text
Flutter UI
   |
   v
Repository
   |
   v
SQLite
```

API hanya digunakan untuk proses synchronization.

Dengan demikian:

* Tidak ada internet: aplikasi tetap berjalan.
* API down: aplikasi tetap berjalan.
* Server lambat: aplikasi tetap berjalan.
* Internet putus ketika membaca: aplikasi tetap berjalan.
* Update gagal: database lama tetap digunakan.

## 8. Database Versioning

Backend memiliki sebuah database version.

Contoh:

```text
Local DB Version: 12
Server DB Version: 13
```

Saat aplikasi melakukan pengecekan:

```http
GET /api/v1/database/version
X-API-Key: <app_api_key>
```

Response:

```json
{
  "version": 13,
  "updated_at": "2026-09-28T08:00:00Z"
}
```

Flutter membandingkan:

```text
local_version == server_version
```

Jika sama:

```text
12 == 12

No update required
```

Jika berbeda:

```text
12 != 13

Update required
```

## 9. Database Metadata

SQLite memiliki tabel metadata.

Contoh:

```sql
CREATE TABLE app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

Data:

```text
database_version = 12
```

Atau dapat dibuat lebih spesifik:

```sql
CREATE TABLE database_info (
    id INTEGER PRIMARY KEY,
    version INTEGER NOT NULL,
    updated_at TEXT NOT NULL
);
```

## 10. Database Schema

### Categories

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);
```

Contoh:

```text
1 | Group Amalan              | amalan
2 | Group Maulid              | maulid
3 | Sholawat & Qosidah        | sholawat-qosidah
4 | Group Tawassul            | tawassul
```

### Contents

```sql
CREATE TABLE contents (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);
```

Content dapat menyimpan teks Arab, latin, terjemahan, dan informasi lainnya.

Namun agar lebih fleksibel, saya menyarankan struktur berikut.

### Content Sections

```sql
CREATE TABLE content_sections (
    id INTEGER PRIMARY KEY,
    content_id INTEGER NOT NULL,
    section_type TEXT NOT NULL,
    title TEXT,
    arabic TEXT,
    transliteration TEXT,
    translation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(content_id) REFERENCES contents(id)
);
```

Contoh:

```text
content
  |
  +-- Section 1
  |      Arabic
  |      Latin
  |      Translation
  |
  +-- Section 2
  |      Arabic
  |      Latin
  |      Translation
  |
  +-- Section 3
         Arabic
         Latin
         Translation
```

Ini lebih cocok untuk Ratib, Maulid, dan Hizib yang terdiri dari banyak bagian.

## 11. Contoh Data

Contoh:

```text
Category
--------
ID: 1
Name: Group Amalan

Content
-------
ID: 1
Category: 1
Title: Ratib al-Aththas
Sort Order: 1
```

Kemudian:

```text
Content Sections

1. Pembukaan
2. Bacaan 1
3. Bacaan 2
4. Bacaan 3
5. Penutup
```

## 12. Backend API

Backend diimplementasikan dengan **Express.js**.

Setiap endpoint di bawah `/api/v1` wajib menyertakan API key. Request tanpa key, dengan key invalid, atau dengan key yang tidak punya scope yang sesuai ditolak (`401` / `403`).

Header:

```http
X-API-Key: <api_key>
```

Minimal API yang diperlukan:

### Get Database Version

```http
GET /api/v1/database/version
X-API-Key: <app_api_key>
```

Response:

```json
{
  "version": 13,
  "updated_at": "2026-09-28T08:00:00Z"
}
```

### Get Categories

```http
GET /api/v1/categories
X-API-Key: <app_api_key>
```

Response:

```json
{
  "version": 13,
  "data": [
    {
      "id": 1,
      "name": "Group Amalan",
      "slug": "amalan",
      "sort_order": 1
    }
  ]
}
```

### Get Contents

```http
GET /api/v1/contents
X-API-Key: <app_api_key>
```

### Get Content

```http
GET /api/v1/contents/{slug}
X-API-Key: <app_api_key>
```

### Get Full Database

Untuk aplikasi offline-first, saya justru menyarankan menyediakan endpoint khusus:

```http
GET /api/v1/database/download
X-API-Key: <app_api_key>
```

Response dapat berupa file SQLite:

```text
majelis-v13.db
```

atau archive:

```text
majelis-v13.zip
```

## 13. Recommended Synchronization Strategy

Daripada Flutter mengambil seluruh data melalui banyak API request:

```text
GET categories
GET contents
GET sections
GET translations
GET ...
```

lebih sederhana untuk aplikasi ini jika backend menyediakan snapshot database.

Contoh:

```text
GET /api/v1/database/version
X-API-Key: <app_api_key>
             |
             v
       version = 13
             |
             v
GET /api/v1/database/download
X-API-Key: <app_api_key>
             |
             v
       majelis-v13.db
```

Keuntungannya:

* Sinkronisasi lebih sederhana.
* Tidak ada masalah partial update.
* Tidak ada kondisi category sudah update tetapi content belum.
* Database selalu konsisten.
* Lebih mudah rollback.
* Cocok untuk aplikasi dengan jumlah konten yang relatif kecil.

## 14. Safe Database Update

Jangan langsung overwrite database aktif.

Gunakan mekanisme temporary database.

Contoh:

```text
Current:
majelis.db

Download:
majelis-v13.tmp.db

        |
        v
Validate
        |
        v
Replace
        |
        v
majelis.db
```

Flow:

```text
Download DB
     |
     v
Temporary File
     |
     v
Check File Integrity
     |
     v
Check Database Schema
     |
     v
Check Database Version
     |
     v
Close Current DB
     |
     v
Replace Database
     |
     v
Open New DB
```

Jika proses update gagal:

```text
Temporary DB deleted

Old DB remains untouched
```

Ini sangat penting supaya pengguna tidak kehilangan konten karena update yang corrupt atau koneksi terputus.

## 15. Integrity Check

Backend sebaiknya menyediakan checksum.

Contoh response:

```json
{
  "version": 13,
  "download_url": "/api/v1/database/download",
  "size": 5242880,
  "checksum": "sha256:abc123..."
}
```

Flutter:

```text
Download
   |
Calculate SHA-256
   |
Compare checksum
   |
Valid?
 /    \
No     Yes
 |       |
Delete   Install
```

## 16. UI Structure

### Home

```text
+--------------------------------+
|       MAJELIS TA'LIM           |
+--------------------------------+

[ Group Amalan ]

Ratib al-Aththas
Ratib al-Haddad
Hizib Nawawi
Niat Ta'lim
Dzikir Jalalah
Ya Robbana Tarofna

[ Group Maulid ]

Maulid Adh-Dhiya Ulami
Maulid Diba
Maulid Simtudduror
Maulid Barzanji

[ Sholawat & Qosidah ]

Sholawat Busyro
Sholawat Kheir
Qosidah Ilahi Bijahil Anbiya

[ Group Tawassul ]

Doa Tawassul
```

### Content Detail

Contoh:

```text
< Ratib al-Haddad

بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

...

Latin:

Bismillahirrahmanirrahim

...

Terjemahan:

Dengan nama Allah Yang Maha Pengasih...
```

## 17. Fitur Reader

Halaman pembacaan sebaiknya memiliki:

* Teks Arab
* Latin/transliterasi
* Terjemahan
* Scroll
* Bookmark
* Font size
* Dark mode
* Light mode
* Search
* Copy text
* Posisi bacaan terakhir

Contoh pengaturan:

```text
Font Arab
[ A- ] [ 24 ] [ A+ ]

Translation
[ ON ]

Dark Mode
[ ON ]
```

## 18. Bookmark

Pengguna dapat menyimpan bacaan favorit.

Bookmark tidak perlu disimpan ke server.

SQLite:

```sql
CREATE TABLE bookmarks (
    content_id INTEGER PRIMARY KEY,
    created_at TEXT NOT NULL
);
```

Karena bookmark merupakan data personal pengguna, data tersebut tidak boleh ikut ter-overwrite ketika database konten diperbarui.

## 19. Reading Progress

Aplikasi dapat menyimpan posisi terakhir.

```sql
CREATE TABLE reading_progress (
    content_id INTEGER PRIMARY KEY,
    section_id INTEGER,
    updated_at TEXT NOT NULL
);
```

Misalnya pengguna membaca Maulid Diba sampai bagian ke-15.

Ketika dibuka kembali:

```text
Lanjutkan dari bacaan terakhir?
```

## 20. Search

Search dilakukan terhadap SQLite.

Contoh:

```text
Search: Allah
```

SQLite melakukan pencarian terhadap:

* Judul
* Arabic
* Transliteration
* Translation

Karena seluruh konten lokal, search tetap berfungsi ketika offline.

## 21. Admin Backend

Backend Express.js menyediakan API CMS di atas MongoDB. Dashboard admin memanggil API tersebut dengan API key scope `admin`.

Fitur:

### Category Management

Admin dapat:

* Create category
* Edit category
* Delete/deactivate category
* Sort category

### Content Management

Admin dapat:

* Create content
* Edit content
* Delete content
* Sort content
* Activate/deactivate content

### Section Management

Admin dapat:

* Menambah section
* Mengubah urutan section
* Mengubah teks Arab
* Mengubah transliterasi
* Mengubah terjemahan

### Publish

Perubahan tidak langsung dianggap sebagai database production.

Admin melakukan:

```text
Draft
  |
  v
Review
  |
  v
Publish
  |
  v
Database Version +1
```

Misalnya:

```text
Version 12
    |
Admin update Maulid Diba
    |
Publish
    |
Version 13
```

## 22. Content Versioning

Backend menyimpan:

```text
Database Version
13
```

Setiap perubahan yang dipublish:

```text
13 -> 14
```

Tidak perlu menaikkan version setiap kali admin menyimpan draft.

Version hanya naik ketika perubahan dipublish.

## 23. Sync State

Flutter dapat memiliki state:

```text
SYNCED
UPDATING
UPDATED
FAILED
OFFLINE
```

Contoh UI kecil:

```text
Konten terbaru
```

atau:

```text
Memperbarui konten...
```

Namun proses tersebut tidak boleh memblokir penggunaan konten lokal.

## 24. Startup Behavior

Recommended behavior:

```text
App Start
   |
   +--------------------+
   |                    |
Load SQLite        Check Network
   |                    |
   v                    v
Show Home           API Request + X-API-Key
                        |
                   +----+----+
                   |         |
                 Failed     Success
                   |         |
                   v         v
                Offline   Compare Version
                             |
                       +-----+-----+
                       |           |
                      Same      Different
                       |           |
                       v           v
                     Done       Download
                                   |
                                   v
                                Validate
                                   |
                                   v
                                 Update
```

Dengan demikian pengguna tidak mengalami:

```text
Opening app
    ↓
Loading...
    ↓
Waiting API...
    ↓
Timeout
```

Sebaliknya:

```text
Opening app
    ↓
SQLite
    ↓
Home langsung tampil
    ↓
Background sync
```

## 25. Flutter Architecture

Saya menyarankan struktur:

```text
lib/
├── core/
│   ├── database/
│   │   ├── database.dart
│   │   ├── database_version.dart
│   │   └── migrations.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── api_key.dart
│   │   └── connectivity.dart
│   └── sync/
│       ├── sync_service.dart
│       └── sync_manager.dart
│
├── features/
│   ├── home/
│   ├── category/
│   ├── content/
│   ├── bookmark/
│   ├── search/
│   └── settings/
│
├── data/
│   ├── models/
│   ├── repositories/
│   ├── datasources/
│   │   ├── local/
│   │   └── remote/
│
└── main.dart
```

Repository:

```text
UI
 |
 v
Repository
 |
 +------ Local DataSource
 |
 +------ Remote DataSource
```

Tetapi untuk read operation:

```text
UI
 |
 v
Repository
 |
 v
SQLite
```

Remote hanya digunakan oleh:

```text
SyncManager
```

## 26. Sync Manager

Contoh pseudocode:

```text
sync()

if no internet:
    return OFFLINE

serverVersion = API.getDatabaseVersion()  // X-API-Key required

localVersion = SQLite.getDatabaseVersion()

if serverVersion == localVersion:
    return SYNCED

download database

validate database

if valid:
    replace local database
    return UPDATED

return FAILED
```

## 27. Initial Database

Database awal harus dibundel dalam Flutter:

```text
assets/
└── database/
    └── majelis.db
```

Pada first installation:

```text
assets/database/majelis.db
            |
            v
Application Documents Directory
            |
            v
majelis.db
```

Setelah itu Flutter selalu menggunakan database pada application storage.

## 28. Important Separation

Ada dua jenis data:

### Content Data

Dapat di-update dari backend.

Contoh:

* Categories
* Contents
* Sections
* Arabic text
* Latin
* Translation

### User Data

Tidak boleh tertimpa ketika database content diperbarui.

Contoh:

* Bookmark
* Reading progress
* Settings
* Font size
* Theme
* Last opened content

Karena itu ada dua pendekatan.

### Recommended

Pisahkan database:

```text
content.db
user.db
```

Content:

```text
content.db
```

User:

```text
user.db
```

Ketika server mengirim database baru:

```text
content.db
```

hanya file tersebut yang diganti.

Sedangkan:

```text
user.db
```

tetap.

Ini lebih aman daripada mencampurkan semuanya dalam satu database.

## 29. Recommended Database Architecture

```text
Flutter App
│
├── content.db
│   ├── database_info
│   ├── categories
│   ├── contents
│   └── content_sections
│
└── user.db
    ├── bookmarks
    ├── reading_progress
    └── settings
```

Backend hanya mengontrol:

```text
content.db
```

## 30. Backend Architecture

Stack backend yang ditetapkan:

* Runtime: Node.js
* Framework: Express.js
* Database: MongoDB
* Autentikasi request: API key (`X-API-Key`)
* Snapshot distribusi Flutter: file SQLite (disimpan di object storage atau filesystem server)

```text
                    Flutter App
                         |
                      HTTPS
                         |
                         | X-API-Key
                         v
                  Load Balancer
                         |
                         v
              Express.js API Server
                    /          \
                   /            \
                  v              v
              MongoDB          Object Storage
              /                    |
             /                     |
            v                      v
     Content Source of Truth   majelis-v13.db
     (categories, contents,
      sections, versions,
      api_keys)
```

MongoDB adalah source of truth untuk CMS dan publish. Flutter tidak membaca MongoDB secara langsung. Setelah admin publish, backend men-generate snapshot SQLite dari data MongoDB, lalu aplikasi mobile mengunduh snapshot tersebut.

Object storage atau folder server digunakan untuk menyimpan snapshot SQLite.

Misalnya:

```text
/database/majelis-v10.db
/database/majelis-v11.db
/database/majelis-v12.db
/database/majelis-v13.db
```

Tidak perlu menghapus versi lama secara langsung karena dapat berguna untuk rollback.

### 30.1 Express.js Structure

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   └── mongodb.js
│   ├── middleware/
│   │   ├── apiKey.js
│   │   ├── errorHandler.js
│   │   └── requireScope.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Content.js
│   │   ├── ContentSection.js
│   │   ├── DatabaseVersion.js
│   │   └── ApiKey.js
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── database.js
│   │   │   ├── categories.js
│   │   │   ├── contents.js
│   │   │   └── admin.js
│   ├── services/
│   │   ├── syncService.js
│   │   ├── publishService.js
│   │   └── sqliteSnapshotService.js
│   └── utils/
├── package.json
└── .env
```

### 30.2 MongoDB Collections

```text
categories
contents
content_sections
database_versions
api_keys
admins   (opsional, jika dashboard admin butuh login terpisah)
```

Contoh dokumen `categories`:

```json
{
  "_id": "ObjectId",
  "name": "Group Amalan",
  "slug": "amalan",
  "description": null,
  "sort_order": 1,
  "is_active": true,
  "updated_at": "2026-09-28T08:00:00Z"
}
```

Contoh dokumen `contents`:

```json
{
  "_id": "ObjectId",
  "category_id": "ObjectId",
  "title": "Ratib al-Aththas",
  "slug": "ratib-al-aththas",
  "description": null,
  "sort_order": 1,
  "is_active": true,
  "status": "published",
  "updated_at": "2026-09-28T08:00:00Z"
}
```

Contoh dokumen `content_sections`:

```json
{
  "_id": "ObjectId",
  "content_id": "ObjectId",
  "section_type": "bacaan",
  "title": "Pembukaan",
  "arabic": "...",
  "transliteration": "...",
  "translation": "...",
  "sort_order": 1
}
```

Contoh dokumen `database_versions`:

```json
{
  "_id": "ObjectId",
  "version": 13,
  "updated_at": "2026-09-28T08:00:00Z",
  "size": 4812392,
  "checksum": "sha256:xxxx",
  "snapshot_path": "/database/majelis-v13.db",
  "is_current": true
}
```

ID integer di SQLite Flutter (`id`) diisi saat generate snapshot, bukan harus sama dengan `_id` MongoDB. Mapping ini dilakukan oleh `sqliteSnapshotService` saat publish.

### 30.3 API Key

Setiap request ke Express.js harus melewati middleware `apiKey`.

```text
Request
  |
  v
Express middleware: apiKey
  |
  +-- Header X-API-Key missing     -> 401
  +-- Key not found / inactive     -> 401
  +-- Scope tidak sesuai endpoint  -> 403
  +-- Valid                        -> next()
```

Collection `api_keys`:

```json
{
  "_id": "ObjectId",
  "name": "Flutter Production",
  "key_hash": "<hashed_api_key>",
  "prefix": "mtl_live_",
  "scope": "app",
  "is_active": true,
  "created_at": "2026-09-28T08:00:00Z",
  "last_used_at": "2026-09-28T10:00:00Z"
}
```

Scope:

* `app`: endpoint sync/read untuk Flutter (`/database/*`, `/categories`, `/contents`)
* `admin`: endpoint CMS (create/update/delete/publish)

Aturan:

* API key disimpan di MongoDB dalam bentuk hash, bukan plaintext.
* Flutter menyimpan app API key di sisi client (secure storage / compile-time config), hanya untuk scope `app`.
* Flutter tidak boleh memakai admin API key.
* Admin dashboard / CMS memakai API key scope `admin` (atau kombinasi login admin + API key).
* Key dapat di-rotate tanpa merilis ulang aplikasi jika aplikasi mendukung remote key config; untuk MVP, app key dibundel dan rotasi mengikuti rilis aplikasi atau mekanisme update config.

## 31. Update API

Contoh:

```http
GET /api/v1/database/version
X-API-Key: <app_api_key>
```

Response:

```json
{
  "version": 13,
  "size": 4812392,
  "checksum": "sha256:xxxx",
  "download_url": "/api/v1/database/download/13"
}
```

Kemudian:

```http
GET /api/v1/database/download/13
X-API-Key: <app_api_key>
```

menghasilkan:

```text
majelis-v13.db
```

## 32. Security

API menggunakan:

```text
HTTPS + API Key
```

Tidak ada endpoint publik tanpa autentikasi.

Setiap request wajib menyertakan:

```http
X-API-Key: <api_key>
```

Contoh error:

```json
{
  "error": "unauthorized",
  "message": "Missing or invalid API key"
}
```

Flutter hanya menyimpan API key dengan scope `app`. Flutter tidak memiliki credential admin.

Admin API wajib memakai API key scope `admin`:

```text
Admin Client
  |
  v
HTTPS
  |
  v
X-API-Key (scope: admin)
  |
  v
Express.js middleware
  |
  v
Authorization / scope check
  |
  v
CMS (MongoDB)
```

Tambahan:

* Rate limiting pada Express.js untuk mencegah abuse API key.
* Jangan log API key di plaintext.
* Gunakan hash (misalnya SHA-256 / bcrypt sesuai kebijakan) saat menyimpan key di MongoDB.
* CORS dikonfigurasi ketat untuk admin dashboard.
* Snapshot download hanya dilayani setelah API key tervalidasi.

## 33. Error Handling

### Tidak ada internet

```text
Use local database
```

### API timeout

```text
Use local database
```

### Database download gagal

```text
Delete temporary file
Keep old database
```

### Checksum gagal

```text
Reject downloaded database
Keep old database
```

### Database corrupt

```text
Reject database
Keep old database
```

### Server error 500

```text
Use local database
```

### API key invalid / unauthorized (401 / 403)

```text
Use local database
Do not treat as available update
```

Prinsipnya:

> Failed synchronization must never destroy a working local database.

## 34. Performance Requirements

Target:

| Requirement               |                   Target |
| ------------------------- | -----------------------: |
| App startup with local DB |              < 2 seconds |
| Home page load            |                 < 500 ms |
| Content opening           |                 < 500 ms |
| Local search              |                 < 500 ms |
| Version check             |      < 3 seconds timeout |
| Database download         |               Background |
| Offline availability      | 100% for bundled content |

Target tersebut merupakan target engineering dan dapat disesuaikan setelah profiling perangkat nyata.

## 35. Functional Requirements

### FR-01

User dapat melihat daftar kategori.

### FR-02

User dapat melihat daftar bacaan dalam kategori.

### FR-03

User dapat membaca konten secara offline.

### FR-04

User dapat melakukan pencarian konten.

### FR-05

User dapat mengubah ukuran font.

### FR-06

User dapat mengaktifkan dark mode.

### FR-07

User dapat membuat bookmark.

### FR-08

User dapat melanjutkan bacaan terakhir.

### FR-09

Aplikasi melakukan pengecekan versi database saat startup.

### FR-10

Aplikasi melakukan update database jika tersedia versi baru.

### FR-11

Aplikasi tetap dapat digunakan jika update gagal.

### FR-12

Aplikasi tidak kehilangan database lama jika proses update gagal.

### FR-13

Admin dapat mengelola kategori.

### FR-14

Admin dapat mengelola konten.

### FR-15

Admin dapat publish database baru.

### FR-16

Publish menghasilkan database version baru.

### FR-17

Setiap request ke backend API wajib menyertakan API key yang valid.

### FR-18

Request tanpa API key, dengan API key invalid, atau dengan scope yang tidak sesuai ditolak dan tidak boleh mengubah data.

## 36. Non Functional Requirements

### Reliability

Aplikasi harus tetap berfungsi tanpa internet.

### Availability

Konten lokal harus selalu tersedia setelah first installation.

### Consistency

Database baru harus tervalidasi sebelum menggantikan database lama.

### Security

Seluruh komunikasi backend menggunakan HTTPS. Setiap request API wajib memakai API key.

### Maintainability

Penambahan konten tidak membutuhkan release aplikasi baru.

### Scalability

Backend harus dapat melayani banyak aplikasi yang melakukan version check secara bersamaan.

## 37. MVP

Untuk versi pertama, saya menyarankan jangan terlalu banyak fitur.

MVP:

```text
Home
  |
  +-- Group Amalan
  |
  +-- Group Maulid
  |
  +-- Sholawat & Qosidah
  |
  +-- Group Tawassul
          |
          v
      Content Reader
```

Dengan:

* SQLite (Flutter)
* Express.js + MongoDB (backend)
* API key pada setiap request
* Offline-first
* Database version check
* Background synchronization
* Full database replacement
* Arabic
* Latin
* Translation
* Search
* Font size
* Dark mode

Bookmark dan reading progress dapat masuk MVP juga jika implementasinya sederhana.

## 38. Future Development

Versi berikutnya dapat menambahkan:

* Audio bacaan
* Playlist audio
* Download audio
* Bookmark
* History
* Reading progress
* Jadwal majelis
* Lokasi majelis
* Pengumuman
* Push notification
* Multiple language
* Tafsir/penjelasan
* Mode imam/pemimpin
* Mode synchronized reading
* Counter dzikir
* Statistik penggunaan

## 39. Final Architecture

Arsitektur yang saya rekomendasikan secara keseluruhan:

```text
                         BACKEND
                    Express.js + MongoDB
                            |
                    +-------+-------+
                    |               |
                    v               v
              MongoDB          SQLite Snapshot
           (source of truth)        |
                    |          v13.db
                    |               |
                    +-------+-------+
                            |
                            | HTTPS + X-API-Key
                            v
                     Flutter Mobile
                            |
                +-----------+-----------+
                |                       |
                v                       v
          content.db                 user.db
                |                       |
        +-------+-------+        +------+------+
        |       |       |        |             |
    Category Content Section  Bookmark    Progress
        |
        v
       UI
        |
        +----------------+
        |                |
     Search           Reader
```

Dan flow sinkronisasinya:

```text
                 APP START
                     |
                     v
              Open content.db
                     |
                     v
                Show UI
                     |
                     +--------------------+
                     |                    |
                     v                    v
              Check Network        User reads content
                     |
                +----+----+
                |         |
              Offline    Online
                |         |
                |         v
                |    Get Server Version
                |    (X-API-Key)
                |         |
                |    +----+----+
                |    |         |
                |   Same    Different
                |    |         |
                |    |         v
                |    |    Download DB
                |    |         |
                |    |      Validate
                |    |         |
                |    |      Replace
                |    |         |
                +----+---------+
                     |
                     v
                 Continue
```

**Kunci desainnya adalah jangan menjadikan API sebagai sumber data runtime.** SQLite lokal menjadi sumber data aplikasi. Backend Express.js + MongoDB hanya bertindak sebagai CMS dan mekanisme distribusi versi konten, dan setiap request ke API wajib memakai API key. Dengan pola ini, aplikasi tetap cocok untuk digunakan saat majelis berlangsung di lokasi yang koneksinya tidak stabil.
