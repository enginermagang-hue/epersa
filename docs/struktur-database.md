# Struktur Database E-PERSA

## 1. Gambaran Umum

E-PERSA adalah aplikasi persuratan dan arsip dokumen dengan arsitektur:

-   **Frontend/Backend:** Next.js + TypeScript
-   **ORM:** Drizzle ORM
-   **Database:** Turso (SQLite/libSQL)
-   **File Storage:** Google Drive
-   **Hosting:** Vercel

Database menyimpan data terstruktur dan metadata. File fisik seperti
PDF, DOCX, XLSX, JPG, dan PNG disimpan di Google Drive.

``` text
Next.js / TypeScript
        │
        ▼
   Drizzle ORM
        │
        ▼
      Turso
   (SQLite/libSQL)
        │
        ├── Data surat
        ├── Disposisi
        ├── Pengguna
        ├── Arsip & metadata
        └── Google Drive file ID
                         │
                         ▼
                  Google Drive
              (file/dokumen fisik)
```

------------------------------------------------------------------------

# 2. Daftar Tabel

Struktur utama terdiri dari 12 tabel:

1.  `roles`
2.  `departments`
3.  `users`
4.  `sessions`
5.  `incoming_letters`
6.  `outgoing_letters`
7.  `dispositions`
8.  `disposition_recipients`
9.  `disposition_logs`
10. `document_categories`
11. `documents`
12. `files`
13. `activity_logs`

> Catatan: daftar di atas sebenarnya terdiri dari **13 tabel**, termasuk
> `sessions`. Tabel `sessions` diperlukan untuk autentikasi berbasis
> session.

------------------------------------------------------------------------

# 3. Entity Relationship Diagram

``` mermaid
erDiagram

    roles ||--o{ users : has
    departments ||--o{ users : has

    users ||--o{ sessions : creates

    users ||--o{ incoming_letters : creates
    users ||--o{ outgoing_letters : creates

    incoming_letters ||--o{ dispositions : has

    users ||--o{ dispositions : creates

    dispositions ||--o{ disposition_recipients : has
    users ||--o{ disposition_recipients : receives

    dispositions ||--o{ disposition_logs : has
    users ||--o{ disposition_logs : performs

    document_categories ||--o{ documents : contains

    incoming_letters ||--o{ documents : references
    outgoing_letters ||--o{ documents : references

    documents ||--o{ files : has
    incoming_letters ||--o{ files : has
    outgoing_letters ||--o{ files : has

    users ||--o{ documents : creates
    users ||--o{ activity_logs : performs
```

------------------------------------------------------------------------

# 4. Tabel `roles`

Menyimpan role/hak akses utama pengguna.

  Field           Type      Constraint           Description
  --------------- --------- -------------------- ------------------
  `id`            INTEGER   PK, AUTO_INCREMENT   ID role
  `name`          TEXT      UNIQUE, NOT NULL     Nama role
  `description`   TEXT      NULL                 Deskripsi role
  `created_at`    INTEGER   NOT NULL             Waktu dibuat
  `updated_at`    INTEGER   NOT NULL             Waktu diperbarui

## Data awal

  name              description
  ----------------- ---------------------------------------
  `administrator`   Pengelola sistem
  `pimpinan`        Pimpinan instansi
  `sekretariat`     Pengelola administrasi dan persuratan
  `pegawai`         Pegawai/penerima disposisi

------------------------------------------------------------------------

# 5. Tabel `departments`

Menyimpan unit/bagian organisasi.

  Field           Type      Constraint           Description
  --------------- --------- -------------------- ------------------
  `id`            INTEGER   PK, AUTO_INCREMENT   ID unit
  `name`          TEXT      NOT NULL             Nama unit
  `code`          TEXT      UNIQUE, NOT NULL     Kode unit
  `description`   TEXT      NULL                 Deskripsi
  `created_at`    INTEGER   NOT NULL             Waktu dibuat
  `updated_at`    INTEGER   NOT NULL             Waktu diperbarui

Contoh:

``` text
UPTD Tekkomdik
├── Subbag Tata Usaha
├── Seksi/Bagian
└── Staf/Pegawai
```

------------------------------------------------------------------------

# 6. Tabel `users`

Menyimpan akun pengguna aplikasi.

  Field             Type      Constraint                    Description
  ----------------- --------- ----------------------------- ------------------
  `id`              INTEGER   PK, AUTO_INCREMENT            ID user
  `role_id`         INTEGER   FK → `roles.id`, NOT NULL     Role
  `department_id`   INTEGER   FK → `departments.id`, NULL   Unit kerja
  `name`            TEXT      NOT NULL                      Nama lengkap
  `username`        TEXT      UNIQUE, NOT NULL              Username login
  `email`           TEXT      UNIQUE, NULL                  Email
  `password`        TEXT      NOT NULL                      Password hash
  `position`        TEXT      NULL                          Jabatan
  `is_active`       BOOLEAN   NOT NULL, DEFAULT true        Status akun
  `created_at`      INTEGER   NOT NULL                      Waktu dibuat
  `updated_at`      INTEGER   NOT NULL                      Waktu diperbarui

### Catatan keamanan

`password` tidak boleh menyimpan password asli.

Gunakan:

``` text
Argon2id
```

atau algoritma hashing password yang sesuai.

Contoh:

``` text
password asli:
ChangeMe123!

disimpan:
$argon2id$v=19$...
```

------------------------------------------------------------------------

# 7. Tabel `sessions`

Menyimpan session login pengguna.

  Field          Type      Constraint                  Description
  -------------- --------- --------------------------- ------------------
  `id`           TEXT      PK                          Session ID/hash
  `user_id`      INTEGER   FK → `users.id`, NOT NULL   Pemilik session
  `expires_at`   INTEGER   NOT NULL                    Waktu kadaluarsa
  `created_at`   INTEGER   NOT NULL                    Waktu dibuat

Relasi:

``` text
users
  │
  └──< sessions
```

Session token sebaiknya disimpan pada cookie `HttpOnly`, sedangkan
database menyimpan hash token.

------------------------------------------------------------------------

# 8. Tabel `incoming_letters`

Menyimpan surat masuk.

  Field                Type        Constraint                  Description
  -------------------- ----------- --------------------------- -------------------
  `id`                 INTEGER     PK, AUTO_INCREMENT          ID surat
  `agenda_number`      TEXT        NULL                        Nomor agenda
  `letter_number`      TEXT        NOT NULL                    Nomor surat
  `letter_date`        TEXT/DATE   NOT NULL                    Tanggal surat
  `received_date`      TEXT/DATE   NOT NULL                    Tanggal diterima
  `sender`             TEXT        NOT NULL                    Pengirim
  `subject`            TEXT        NOT NULL                    Perihal
  `classification`     TEXT        NULL                        Klasifikasi surat
  `priority`           TEXT        NOT NULL                    Sifat/prioritas
  `attachment_count`   INTEGER     DEFAULT 0                   Jumlah lampiran
  `description`        TEXT        NULL                        Keterangan
  `status`             TEXT        NOT NULL                    Status surat
  `created_by`         INTEGER     FK → `users.id`, NOT NULL   Pembuat
  `created_at`         INTEGER     NOT NULL                    Waktu dibuat
  `updated_at`         INTEGER     NOT NULL                    Waktu diperbarui

## Status

``` text
received
registered
dispositioned
processed
archived
```

## Priority

``` text
normal
important
urgent
confidential
```

------------------------------------------------------------------------

# 9. Tabel `outgoing_letters`

Menyimpan surat keluar.

  Field                Type        Constraint                  Description
  -------------------- ----------- --------------------------- ------------------
  `id`                 INTEGER     PK, AUTO_INCREMENT          ID surat
  `letter_number`      TEXT        NOT NULL                    Nomor surat
  `letter_date`        TEXT/DATE   NOT NULL                    Tanggal surat
  `recipient`          TEXT        NOT NULL                    Tujuan
  `subject`            TEXT        NOT NULL                    Perihal
  `classification`     TEXT        NULL                        Klasifikasi
  `priority`           TEXT        NOT NULL                    Sifat/prioritas
  `attachment_count`   INTEGER     DEFAULT 0                   Jumlah lampiran
  `description`        TEXT        NULL                        Keterangan
  `status`             TEXT        NOT NULL                    Status
  `created_by`         INTEGER     FK → `users.id`, NOT NULL   Pembuat
  `created_at`         INTEGER     NOT NULL                    Waktu dibuat
  `updated_at`         INTEGER     NOT NULL                    Waktu diperbarui

## Status

``` text
draft
registered
signed
sent
archived
```

------------------------------------------------------------------------

# 10. Tabel `dispositions`

Menyimpan disposisi yang diberikan terhadap surat masuk.

  -----------------------------------------------------------------------------------
  Field                  Type              Constraint               Description
  ---------------------- ----------------- ------------------------ -----------------
  `id`                   INTEGER           PK, AUTO_INCREMENT       ID disposisi

  `incoming_letter_id`   INTEGER           FK →                     Surat masuk
                                           `incoming_letters.id`,   
                                           NOT NULL                 

  `from_user_id`         INTEGER           FK → `users.id`, NOT     Pemberi disposisi
                                           NULL                     

  `instruction`          TEXT              NOT NULL                 Instruksi

  `note`                 TEXT              NULL                     Catatan

  `deadline`             TEXT/DATE         NULL                     Batas waktu

  `status`               TEXT              NOT NULL                 Status

  `created_at`           INTEGER           NOT NULL                 Waktu dibuat

  `updated_at`           INTEGER           NOT NULL                 Waktu diperbarui
  -----------------------------------------------------------------------------------

## Status

``` text
pending
in_progress
completed
cancelled
```

------------------------------------------------------------------------

# 11. Tabel `disposition_recipients`

Menyimpan penerima disposisi.

Satu disposisi dapat diberikan kepada beberapa pegawai.

``` text
Disposisi #1
├── Pegawai A
├── Pegawai B
└── Pegawai C
```

  ---------------------------------------------------------------------------
  Field              Type              Constraint           Description
  ------------------ ----------------- -------------------- -----------------
  `id`               INTEGER           PK, AUTO_INCREMENT   ID

  `disposition_id`   INTEGER           FK →                 Disposisi
                                       `dispositions.id`,   
                                       NOT NULL             

  `user_id`          INTEGER           FK → `users.id`, NOT Penerima
                                       NULL                 

  `status`           TEXT              NOT NULL             Status penerima

  `note`             TEXT              NULL                 Catatan penerima

  `completed_at`     INTEGER           NULL                 Waktu selesai

  `created_at`       INTEGER           NOT NULL             Waktu dibuat
  ---------------------------------------------------------------------------

## Status

``` text
pending
in_progress
completed
```

------------------------------------------------------------------------

# 12. Tabel `disposition_logs`

Menyimpan riwayat aktivitas disposisi.

Contoh:

``` text
Pimpinan
   ↓
Sekretariat
   ↓
Kepala Seksi
   ↓
Pegawai
```

  ---------------------------------------------------------------------------
  Field              Type              Constraint           Description
  ------------------ ----------------- -------------------- -----------------
  `id`               INTEGER           PK, AUTO_INCREMENT   ID

  `disposition_id`   INTEGER           FK →                 Disposisi
                                       `dispositions.id`,   
                                       NOT NULL             

  `user_id`          INTEGER           FK → `users.id`, NOT Pengguna
                                       NULL                 

  `action`           TEXT              NOT NULL             Aktivitas

  `note`             TEXT              NULL                 Catatan

  `created_at`       INTEGER           NOT NULL             Waktu
  ---------------------------------------------------------------------------

## Action

``` text
created
forwarded
received
started
completed
returned
```

------------------------------------------------------------------------

# 13. Tabel `document_categories`

Kategori arsip/dokumen.

  Field           Type      Constraint           Description
  --------------- --------- -------------------- ------------------
  `id`            INTEGER   PK, AUTO_INCREMENT   ID kategori
  `name`          TEXT      NOT NULL             Nama kategori
  `code`          TEXT      UNIQUE, NOT NULL     Kode kategori
  `description`   TEXT      NULL                 Deskripsi
  `created_at`    INTEGER   NOT NULL             Waktu dibuat
  `updated_at`    INTEGER   NOT NULL             Waktu diperbarui

Contoh:

``` text
SURAT-MASUK
SURAT-KELUAR
SK
SE
NOTA-DINAS
UNDANGAN
LAPORAN
PERATURAN
DOKUMEN-LAINNYA
```

------------------------------------------------------------------------

# 14. Tabel `documents`

Menyimpan metadata arsip dokumen.

  --------------------------------------------------------------------------------------
  Field                  Type              Constraint                  Description
  ---------------------- ----------------- --------------------------- -----------------
  `id`                   INTEGER           PK, AUTO_INCREMENT          ID dokumen

  `category_id`          INTEGER           FK →                        Kategori
                                           `document_categories.id`,   
                                           NOT NULL                    

  `incoming_letter_id`   INTEGER           FK → `incoming_letters.id`, Surat masuk
                                           NULL                        terkait

  `outgoing_letter_id`   INTEGER           FK → `outgoing_letters.id`, Surat keluar
                                           NULL                        terkait

  `document_number`      TEXT              NULL                        Nomor dokumen

  `title`                TEXT              NOT NULL                    Judul dokumen

  `document_date`        TEXT/DATE         NULL                        Tanggal dokumen

  `year`                 INTEGER           NULL                        Tahun

  `description`          TEXT              NULL                        Keterangan

  `created_by`           INTEGER           FK → `users.id`, NOT NULL   Pembuat

  `created_at`           INTEGER           NOT NULL                    Waktu dibuat

  `updated_at`           INTEGER           NOT NULL                    Waktu diperbarui
  --------------------------------------------------------------------------------------

> File fisik tidak disimpan di tabel ini. File disimpan di Google Drive
> dan direferensikan melalui tabel `files`.

------------------------------------------------------------------------

# 15. Tabel `files`

Tabel ini menyimpan metadata file yang berada di Google Drive.

  -----------------------------------------------------------------------------------
  Field                  Type              Constraint               Description
  ---------------------- ----------------- ------------------------ -----------------
  `id`                   INTEGER           PK, AUTO_INCREMENT       ID

  `document_id`          INTEGER           FK → `documents.id`,     Dokumen terkait
                                           NULL                     

  `incoming_letter_id`   INTEGER           FK →                     Surat masuk
                                           `incoming_letters.id`,   
                                           NULL                     

  `outgoing_letter_id`   INTEGER           FK →                     Surat keluar
                                           `outgoing_letters.id`,   
                                           NULL                     

  `file_name`            TEXT              NOT NULL                 Nama file

  `drive_file_id`        TEXT              UNIQUE, NOT NULL         ID file Google
                                                                    Drive

  `drive_folder_id`      TEXT              NULL                     ID folder Google
                                                                    Drive

  `mime_type`            TEXT              NULL                     MIME type

  `file_size`            INTEGER           NULL                     Ukuran file dalam
                                                                    byte

  `description`          TEXT              NULL                     Deskripsi

  `created_at`           INTEGER           NOT NULL                 Waktu dibuat
  -----------------------------------------------------------------------------------

Contoh:

``` text
files
│
├── Surat_001.pdf
│     └── drive_file_id: 1AbCdEf...
│
├── Lampiran_01.pdf
│     └── drive_file_id: 2XyZaBc...
│
└── Lampiran_02.xlsx
      └── drive_file_id: 3LmNoPq...
```

------------------------------------------------------------------------

# 16. Tabel `activity_logs`

Menyimpan seluruh aktivitas penting pengguna.

  Field           Type      Constraint              Description
  --------------- --------- ----------------------- -----------------
  `id`            INTEGER   PK, AUTO_INCREMENT      ID log
  `user_id`       INTEGER   FK → `users.id`, NULL   Pengguna
  `action`        TEXT      NOT NULL                Jenis aktivitas
  `entity_type`   TEXT      NULL                    Jenis data
  `entity_id`     INTEGER   NULL                    ID data
  `description`   TEXT      NULL                    Deskripsi
  `ip_address`    TEXT      NULL                    IP pengguna
  `user_agent`    TEXT      NULL                    Browser/device
  `created_at`    INTEGER   NOT NULL                Waktu aktivitas

Contoh:

``` text
13-08-2026 08:32
User: Obeth
Action: CREATE
Entity: incoming_letters
Entity ID: 125
Description: Menambahkan surat masuk 005/UPTD/2026
```

------------------------------------------------------------------------

# 17. Relasi Pengguna

``` text
roles
   │
   └────< users >──── departments
              │
              └────< sessions
```

Artinya:

-   Satu role memiliki banyak user.
-   Satu department memiliki banyak user.
-   Satu user dapat memiliki beberapa session login.

------------------------------------------------------------------------

# 18. Relasi Surat Masuk

``` text
users
  │
  └────< incoming_letters
               │
               ├────< dispositions
               │          │
               │          ├────< disposition_recipients
               │          │
               │          └────< disposition_logs
               │
               └────< files
```

Alur bisnis:

``` text
Surat Masuk
     │
     ▼
Registrasi
     │
     ▼
Disposisi
     │
     ├── Pegawai A
     ├── Pegawai B
     └── Pegawai C
     │
     ▼
Tindak Lanjut
     │
     ▼
Selesai
     │
     ▼
Arsip
```

------------------------------------------------------------------------

# 19. Relasi Surat Keluar

``` text
users
  │
  └────< outgoing_letters
                │
                └────< files
```

Alur:

``` text
Draft
  ↓
Registrasi
  ↓
Penandatanganan
  ↓
Dikirim
  ↓
Arsip
```

------------------------------------------------------------------------

# 20. Relasi Arsip

``` text
document_categories
        │
        └────< documents
                  │
                  └────< files
                              │
                              ▼
                       Google Drive
```

Database:

``` text
documents
    │
    └── file metadata
            │
            └── drive_file_id
```

Google Drive:

``` text
📁 SISTEM-PERSURATAN
│
├── 📁 Surat Masuk
│   └── 📁 2026
│
├── 📁 Surat Keluar
│   └── 📁 2026
│
├── 📁 Disposisi
│   └── 📁 2026
│
└── 📁 Arsip
    └── 📁 2026
```

------------------------------------------------------------------------

# 21. Struktur Google Drive

Google Drive tidak menjadi database.

Google Drive hanya menyimpan file.

Rekomendasi struktur:

``` text
📁 E-PERSA
│
├── 📁 Surat Masuk
│   ├── 📁 2026
│   │   ├── 📁 01
│   │   ├── 📁 02
│   │   ├── 📁 03
│   │   └── ...
│
├── 📁 Surat Keluar
│   └── 📁 2026
│       ├── 📁 01
│       ├── 📁 02
│       └── ...
│
├── 📁 Disposisi
│   └── 📁 2026
│
└── 📁 Arsip
    ├── 📁 2024
    ├── 📁 2025
    └── 📁 2026
```

Database hanya menyimpan:

``` text
drive_file_id
drive_folder_id
file_name
mime_type
file_size
```

------------------------------------------------------------------------

# 22. Index yang Direkomendasikan

Karena aplikasi akan sering melakukan pencarian surat, beberapa kolom
sebaiknya diberi index.

## `users`

``` text
username
email
role_id
department_id
```

## `incoming_letters`

``` text
letter_number
agenda_number
letter_date
received_date
sender
status
classification
```

## `outgoing_letters`

``` text
letter_number
letter_date
recipient
status
classification
```

## `dispositions`

``` text
incoming_letter_id
from_user_id
status
deadline
```

## `disposition_recipients`

``` text
disposition_id
user_id
status
```

## `documents`

``` text
category_id
document_number
year
document_date
```

## `files`

``` text
drive_file_id
document_id
incoming_letter_id
outgoing_letter_id
```

## `activity_logs`

``` text
user_id
entity_type
entity_id
created_at
```

------------------------------------------------------------------------

# 23. Status Flow

## Surat Masuk

``` text
received
    ↓
registered
    ↓
dispositioned
    ↓
processed
    ↓
archived
```

## Surat Keluar

``` text
draft
    ↓
registered
    ↓
signed
    ↓
sent
    ↓
archived
```

## Disposisi

``` text
pending
    ↓
in_progress
    ↓
completed
```

------------------------------------------------------------------------

# 24. Prinsip Penyimpanan File

Jangan menyimpan file sebagai BLOB di Turso.

### Tidak direkomendasikan

``` text
Turso
└── PDF/BLOB
```

### Direkomendasikan

``` text
Turso
└── Metadata
    └── drive_file_id
             │
             ▼
       Google Drive
             └── PDF
```

Keuntungannya:

-   database tetap ringan;
-   file dapat dikelola melalui Google Drive;
-   backup file lebih mudah;
-   database hanya menangani data terstruktur;
-   aplikasi dapat mengambil file berdasarkan `drive_file_id`.

------------------------------------------------------------------------

# 25. Rekomendasi Constraint

Beberapa constraint penting:

``` text
roles.name
    UNIQUE

departments.code
    UNIQUE

users.username
    UNIQUE

users.email
    UNIQUE

files.drive_file_id
    UNIQUE
```

Foreign key utama:

``` text
users.role_id
    → roles.id

users.department_id
    → departments.id

sessions.user_id
    → users.id

incoming_letters.created_by
    → users.id

outgoing_letters.created_by
    → users.id

dispositions.incoming_letter_id
    → incoming_letters.id

dispositions.from_user_id
    → users.id

disposition_recipients.disposition_id
    → dispositions.id

disposition_recipients.user_id
    → users.id

disposition_logs.disposition_id
    → dispositions.id

disposition_logs.user_id
    → users.id

documents.category_id
    → document_categories.id

documents.incoming_letter_id
    → incoming_letters.id

documents.outgoing_letter_id
    → outgoing_letters.id

documents.created_by
    → users.id

files.document_id
    → documents.id

files.incoming_letter_id
    → incoming_letters.id

files.outgoing_letter_id
    → outgoing_letters.id

activity_logs.user_id
    → users.id
```

------------------------------------------------------------------------

# 26. Struktur Folder Source Code yang Direkomendasikan

Struktur database ini nantinya dapat dipetakan ke project:

``` text
src/
│
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── surat-masuk/
│   ├── surat-keluar/
│   ├── disposisi/
│   ├── arsip/
│   └── users/
│
├── db/
│   ├── index.ts
│   ├── schema.ts
│   └── relations.ts
│
├── lib/
│   ├── auth/
│   ├── google-drive/
│   └── utils/
│
├── modules/
│   ├── incoming-letters/
│   ├── outgoing-letters/
│   ├── dispositions/
│   ├── documents/
│   └── users/
│
└── components/
```

------------------------------------------------------------------------

# 27. Alur Data Utama E-PERSA

``` text
                         E-PERSA
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    Surat Masuk       Surat Keluar        Arsip
          │                 │                 │
          ▼                 ▼                 │
      Disposisi         Penandatanganan       │
          │                 │                 │
          ▼                 ▼                 │
    Tindak Lanjut        Pengiriman           │
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼
                          Arsip
                            │
                            ▼
                      Google Drive
```

------------------------------------------------------------------------

# 28. Catatan Pengembangan

Schema ini dirancang agar dapat dikembangkan lebih lanjut untuk:

-   nomor surat otomatis;
-   klasifikasi surat;
-   disposisi berjenjang;
-   notifikasi disposisi;
-   batas waktu tindak lanjut;
-   pencarian arsip;
-   filter berdasarkan tahun;
-   filter berdasarkan unit kerja;
-   audit trail;
-   dashboard statistik;
-   upload beberapa lampiran;
-   integrasi Google Drive;
-   role-based access control;
-   laporan surat masuk/keluar;
-   export laporan;
-   backup database.

## Tahap implementasi yang disarankan

``` text
1. Authentication
2. User & Role Management
3. Master Department
4. Surat Masuk
5. Upload Google Drive
6. Disposisi
7. Tindak Lanjut Disposisi
8. Surat Keluar
9. Arsip Dokumen
10. Activity Log
11. Dashboard
12. Reporting
13. Deployment Vercel
```

------------------------------------------------------------------------

# 29. Stack Final

``` text
Frontend
    └── Next.js
         ├── React
         ├── TypeScript
         └── Tailwind CSS

Backend
    └── Next.js Server/API

ORM
    └── Drizzle ORM

Database
    └── Turso
         └── SQLite/libSQL

Authentication
    ├── Argon2id
    ├── Session
    └── HttpOnly Cookie

File Storage
    └── Google Drive

Hosting
    └── Vercel
```

------------------------------------------------------------------------

# 30. Kesimpulan

Database E-PERSA menggunakan **Turso sebagai database utama** dan
**Google Drive sebagai penyimpanan file**.

Turso menyimpan:

-   pengguna;
-   role;
-   unit kerja;
-   surat masuk;
-   surat keluar;
-   disposisi;
-   tindak lanjut;
-   arsip;
-   metadata file;
-   activity log.

Google Drive menyimpan:

-   PDF surat;
-   dokumen Word;
-   spreadsheet;
-   hasil scan;
-   lampiran;
-   dokumen arsip.

Dengan pemisahan tersebut, aplikasi tetap ringan, mudah dikembangkan,
dan tidak menjadikan database sebagai tempat penyimpanan file berukuran
besar.
