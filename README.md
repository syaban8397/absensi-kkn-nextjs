# Absensi KKN Next.js + MySQL

Project ini adalah hasil konversi dari versi Laravel/PHP Native menjadi **Next.js App Router + MySQL**.

## Fitur

- Login username/password
- Role `admin` dan `peserta`
- Absen pagi dan sore
- Batas jam absen:
  - Pagi: 05.00 - 11.00 WIB
  - Sore: 13.00 - 22.00 WIB
- Status pulang minimal 7 jam setelah absen pagi
- Dashboard admin
- Edit absensi oleh admin
- Riwayat absensi peserta
- Laporan PDF
- Laporan Excel
- Upload foto profil
- Ganti password
- Database SQL + akun default

## Kebutuhan

- Node.js 18 atau lebih baru
- MySQL/MariaDB
- npm

## Cara Menjalankan

### 1. Install dependency

```bash
npm install
```

### 2. Import database

Buka phpMyAdmin atau MySQL client, lalu import:

```text
database/absensi_kkn_nextjs.sql
```

Database yang dibuat:

```text
absensi_kkn_nextjs
```

### 3. Buat file `.env`

Copy file:

```bash
cp .env.example .env
```

Di Windows CMD:

```bat
copy .env.example .env
```

Isi contoh:

```env
APP_NAME="Absensi KKN Next.js"
APP_TIMEZONE=Asia/Jakarta

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=absensi_kkn_nextjs
DB_USERNAME=root
DB_PASSWORD=

AUTH_SECRET=ganti-dengan-secret-panjang-minimal-32-karakter
AUTH_COOKIE=absensi_kkn_session
```

Untuk XAMPP default, biasanya:

```env
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Akun Default

Admin:

```text
username: admin
password: AdminKKN#2026
```

Peserta:

```text
password semua peserta: kkn2026
```

Contoh username peserta:

```text
rizky.syaban
azzahra.salsabila
sundawi.sabina
nazma.malihah
widya.amelia
rini.nurjanah
```

## Build Production

```bash
npm run build
npm run start
```

## Catatan Penting

- Project ini sudah tidak memakai Laravel, PHP Native, Blade, Composer, atau Apache.
- Export PDF memakai package `pdfkit`.
- Export Excel memakai package `exceljs`.
- Koneksi database memakai `mysql2`.
- Hash password lama dari PHP `$2y$` tetap bisa dipakai karena sudah dinormalisasi saat verifikasi bcrypt.
- Upload foto disimpan ke:

```text
public/uploads/profile-photos
```

Untuk deployment serverless, upload file sebaiknya dipindahkan ke object storage seperti S3/R2/Supabase Storage.
