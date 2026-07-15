'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { clearLoginCookie, requireAdmin, requirePeserta, requireUser, setLoginCookie } from '@/lib/auth';
import { execute, query } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import {
  ensureDateIsGenerated,
  getAttendance,
  isPeriod,
  isWithinWindow,
  PERIOD_PAGI,
  PERIOD_SORE,
  STATUS_ALFA,
  STATUS_PULANG,
  statusesForPeriod,
  windowLabel
} from '@/lib/attendance';
import { minutesBetween, nowMysql, todayJakarta } from '@/lib/date';
import type { Attendance, AttendanceStatus, User } from '@/lib/types';

function clean(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

function backWithMessage(pathname: string, type: 'success' | 'error', message: string): never {
  const separator = pathname.includes('?') ? '&' : '?';
  redirect(`${pathname}${separator}${type}=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData): Promise<void> {
  const username = clean(formData.get('username'));
  const password = String(formData.get('password') ?? '');

  if (!username || !password) {
    backWithMessage('/login', 'error', 'Username dan password wajib diisi.');
  }

  const rows = await query<User>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password))) {
    backWithMessage('/login', 'error', 'Username atau password salah.');
  }

  setLoginCookie(user.id);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  clearLoginCookie();
  backWithMessage('/login', 'success', 'Kamu berhasil logout.');
}

export async function submitAttendanceAction(formData: FormData): Promise<void> {
  const user = await requirePeserta();

  const periodValue = clean(formData.get('period'));
  const status = clean(formData.get('status')) as AttendanceStatus;
  const note = clean(formData.get('note'));
  const today = todayJakarta();
  const errors: string[] = [];

  if (!isPeriod(periodValue)) {
    errors.push('Periode absensi tidak valid.');
  }

  const period = isPeriod(periodValue) ? periodValue : PERIOD_PAGI;
  const allowedStatuses = statusesForPeriod(period);

  if (!(status in allowedStatuses)) {
    errors.push('Status absensi tidak valid untuk periode ini.');
  }

  if (note.length > 500) {
    errors.push('Catatan maksimal 500 karakter.');
  }

  if (!isWithinWindow(period)) {
    errors.push(`Absensi ${period} hanya bisa diisi pada jam ${windowLabel(period)}. Jika tidak diisi sampai batas waktu selesai, status otomatis tetap Alfa.`);
  }

  if (period === PERIOD_PAGI && status === STATUS_PULANG) {
    errors.push('Status Pulang hanya boleh dipilih pada absensi sore.');
  }

  if (period === PERIOD_SORE && status === STATUS_PULANG) {
    const morning = await getAttendance(user.id, today, PERIOD_PAGI);

    if (!morning?.attendance_at) {
      errors.push('Kamu harus mengisi absen pagi dulu sebelum memilih status Pulang.');
    } else if (minutesBetween(morning.attendance_at) < 420) {
      errors.push('Absen pulang baru bisa dilakukan minimal 7 jam setelah absen pagi.');
    }
  }

  const backPath = period === PERIOD_SORE ? '/attendance/sore' : '/attendance/pagi';

  if (errors.length) {
    backWithMessage(backPath, 'error', errors.join(' '));
  }

  await ensureDateIsGenerated(today);
  const now = nowMysql();

  await execute(
    `UPDATE attendances
     SET status = ?,
         note = ?,
         attendance_at = ?,
         updated_at = ?
     WHERE user_id = ?
       AND attendance_date = ?
       AND period = ?`,
    [status, note || null, now, now, user.id, today, period]
  );

  revalidatePath(backPath);
  backWithMessage(backPath, 'success', `Absensi ${period} berhasil disimpan.`);
}

export async function updateAdminAttendanceAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(clean(formData.get('id')));
  const date = clean(formData.get('date')) || todayJakarta();
  const status = clean(formData.get('status')) as AttendanceStatus;
  const note = clean(formData.get('note'));

  const rows = await query<Attendance & { name: string }>(
    `SELECT attendances.*, users.name
     FROM attendances
     JOIN users ON users.id = attendances.user_id
     WHERE attendances.id = ?
     LIMIT 1`,
    [id]
  );

  const attendance = rows[0];

  if (!attendance) {
    backWithMessage(`/admin/dashboard?date=${encodeURIComponent(date)}`, 'error', 'Data absensi tidak ditemukan.');
  }

  const allowed = statusesForPeriod(attendance.period);
  if (!(status in allowed)) {
    backWithMessage(`/admin/dashboard?date=${encodeURIComponent(date)}`, 'error', 'Status tidak valid untuk periode ini.');
  }

  if (note.length > 500) {
    backWithMessage(`/admin/dashboard?date=${encodeURIComponent(date)}`, 'error', 'Catatan maksimal 500 karakter.');
  }

  const attendanceAt = status === STATUS_ALFA ? null : nowMysql();

  await execute(
    `UPDATE attendances
     SET status = ?,
         note = ?,
         attendance_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [status, note || null, attendanceAt, nowMysql(), id]
  );

  revalidatePath('/admin/dashboard');
  backWithMessage(
    `/admin/dashboard?date=${encodeURIComponent(date)}`,
    'success',
    `Absensi ${attendance.name} periode ${attendance.period} berhasil diubah admin.`
  );
}

export async function updateProfilePhotoAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const file = formData.get('photo');

  if (!(file instanceof File) || file.size === 0) {
    backWithMessage('/profile', 'error', 'Foto wajib diupload.');
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    backWithMessage('/profile', 'error', 'Ukuran foto maksimal 2MB.');
  }

  const allowed: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  const extension = allowed[file.type];
  if (!extension) {
    backWithMessage('/profile', 'error', 'Format foto harus JPG, PNG, atau WEBP.');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-photos');
  await fs.mkdir(uploadDir, { recursive: true });

  if (user.photo_path?.startsWith('/uploads/profile-photos/')) {
    const oldPath = path.join(process.cwd(), 'public', user.photo_path);
    await fs.unlink(oldPath).catch(() => undefined);
  }

  const filename = `user-${user.id}-${crypto.randomUUID()}.${extension}`;
  const relativePath = `/uploads/profile-photos/${filename}`;
  const destination = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destination, buffer);

  await execute('UPDATE users SET photo_path = ?, updated_at = ? WHERE id = ?', [relativePath, nowMysql(), user.id]);
  revalidatePath('/profile');
  backWithMessage('/profile', 'success', 'Foto profil berhasil diperbarui.');
}

export async function deleteProfilePhotoAction(): Promise<void> {
  const user = await requireUser();

  if (user.photo_path?.startsWith('/uploads/profile-photos/')) {
    const oldPath = path.join(process.cwd(), 'public', user.photo_path);
    await fs.unlink(oldPath).catch(() => undefined);
  }

  await execute('UPDATE users SET photo_path = NULL, updated_at = ? WHERE id = ?', [nowMysql(), user.id]);
  revalidatePath('/profile');
  backWithMessage('/profile', 'success', 'Foto profil berhasil dihapus.');
}

export async function updatePasswordAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const current = String(formData.get('current_password') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('password_confirmation') ?? '');

  if (!(await verifyPassword(current, user.password))) {
    backWithMessage('/profile', 'error', 'Password lama tidak sesuai.');
  }

  if (password.length < 8) {
    backWithMessage('/profile', 'error', 'Password baru minimal 8 karakter.');
  }

  if (password !== confirmation) {
    backWithMessage('/profile', 'error', 'Konfirmasi password baru tidak sama.');
  }

  await execute('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [
    await hashPassword(password),
    nowMysql(),
    user.id
  ]);

  revalidatePath('/profile');
  backWithMessage('/profile', 'success', 'Password berhasil diperbarui.');
}
