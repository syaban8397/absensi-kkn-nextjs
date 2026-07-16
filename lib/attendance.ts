import { execute, query } from '@/lib/db';
import { formatTime, jakartaNow, minutesBetween, nowMysql } from '@/lib/date';
import type { AdminAttendanceRow, Attendance, AttendanceStatus, Period, ReportRow, User } from '@/lib/types';

export const PERIOD_PAGI: Period = 'pagi';
export const PERIOD_SORE: Period = 'sore';

export const STATUS_HADIR: AttendanceStatus = 'hadir';
export const STATUS_IZIN: AttendanceStatus = 'izin';
export const STATUS_SAKIT: AttendanceStatus = 'sakit';
export const STATUS_ALFA: AttendanceStatus = 'alfa';
export const STATUS_PULANG: AttendanceStatus = 'pulang';

export const PAGI_START = '05:00';
export const PAGI_END = '11:00';
export const SORE_START = '13:00';
export const SORE_END = '22:00';

export const statusLabels: Record<AttendanceStatus, string> = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alfa: 'Alfa',
  pulang: 'Pulang'
};

export function statusLabel(status?: string | null): string {
  if (!status) return '-';
  return statusLabels[status as AttendanceStatus] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export function periodLabel(period: Period): string {
  return period === PERIOD_PAGI ? 'Pagi' : 'Sore';
}

export function statusesForPeriod(period: Period): Partial<Record<AttendanceStatus, string>> {
  if (period === PERIOD_PAGI) {
    return {
      hadir: 'Hadir',
      izin: 'Izin',
      sakit: 'Sakit',
      alfa: 'Alfa'
    };
  }

  return statusLabels;
}

export function windowForPeriod(period: Period): [string, string] {
  return period === PERIOD_PAGI ? [PAGI_START, PAGI_END] : [SORE_START, SORE_END];
}

export function windowLabel(period: Period): string {
  const [start, end] = windowForPeriod(period);
  return `${start} - ${end}`;
}

function toMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function isWithinWindow(period: Period, time: Date = jakartaNow()): boolean {
  const [start, end] = windowForPeriod(period);
  const current = time.getHours() * 60 + time.getMinutes();
  return current >= toMinutes(start) && current <= toMinutes(end);
}

export function isPeriod(value: string): value is Period {
  return value === PERIOD_PAGI || value === PERIOD_SORE;
}

export async function ensureDateIsGenerated(date: string): Promise<void> {
  const participants = await query<Pick<User, 'id'>>("SELECT id FROM users WHERE role = 'peserta' ORDER BY id");
  const now = nowMysql();

  for (const participant of participants) {
    for (const period of [PERIOD_PAGI, PERIOD_SORE]) {
      await execute(
        `INSERT INTO attendances
          (user_id, attendance_date, period, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (user_id, attendance_date, period) DO NOTHING`,
        [participant.id, date, period, STATUS_ALFA, now, now]
      );
    }
  }
}

export async function getAttendance(userId: number, date: string, period: Period): Promise<Attendance | null> {
  const rows = await query<Attendance>(
    'SELECT * FROM attendances WHERE user_id = ? AND attendance_date = ? AND period = ? LIMIT 1',
    [userId, date, period]
  );
  return rows[0] ?? null;
}

export async function getUserHistory(userId: number, limit = 50): Promise<Attendance[]> {
  return query<Attendance>(
    `SELECT *
     FROM attendances
     WHERE user_id = ?
     ORDER BY attendance_date DESC, CASE period WHEN 'sore' THEN 0 ELSE 1 END
     LIMIT ?`,
    [userId, limit]
  );
}

export async function attendanceSummaryForUser(userId: number): Promise<Record<'hadir' | 'izin' | 'pulang' | 'alfa', number>> {
  const rows = await query<{ status: AttendanceStatus; total: number }>(
    `SELECT status, COUNT(*) total
     FROM attendances
     WHERE user_id = ?
     GROUP BY status`,
    [userId]
  );

  const summary = {
    hadir: 0,
    izin: 0,
    pulang: 0,
    alfa: 0
  };

  for (const row of rows) {
    if (row.status in summary) {
      summary[row.status as keyof typeof summary] = Number(row.total);
    }
  }

  return summary;
}

export async function reportSummary(date: string): Promise<ReportRow[]> {
  const users = await query<User>("SELECT * FROM users WHERE role = 'peserta' ORDER BY name");
  const rows: ReportRow[] = [];

  for (const user of users) {
    const todayAttendances = await query<Attendance>(
      `SELECT *
       FROM attendances
       WHERE user_id = ? AND attendance_date = ?
       ORDER BY CASE period WHEN 'pagi' THEN 0 ELSE 1 END`,
      [user.id, date]
    );

    const todayLabels = todayAttendances.map(
      (attendance) => `${periodLabel(attendance.period)}: ${statusLabel(attendance.status)}`
    );

    const counts = await attendanceSummaryForUser(user.id);

    rows.push({
      nama: user.name,
      status_kehadiran_hari: todayLabels.length ? todayLabels.join(' | ') : '-',
      hadir: counts.hadir,
      izin: counts.izin,
      pulang: counts.pulang,
      alfa: counts.alfa
    });
  }

  return rows;
}

export async function adminAttendanceRows(date: string, period: Period): Promise<AdminAttendanceRow[]> {
  return query<AdminAttendanceRow>(
    `SELECT attendances.*, users.name, users.username, users.division, users.position, users.photo_path
     FROM attendances
     JOIN users ON users.id = attendances.user_id
     WHERE attendances.attendance_date = ?
       AND attendances.period = ?
     ORDER BY users.name`,
    [date, period]
  );
}

export function formatAttendanceTime(value?: string | null): string {
  return formatTime(value);
}

export function pulangEligibility(morningAttendance: Attendance | null): { canPulang: boolean; message?: string } {
  if (!morningAttendance?.attendance_at) {
    return {
      canPulang: false,
      message: 'Status Pulang membutuhkan data absen pagi terlebih dahulu.'
    };
  }

  const minutes = minutesBetween(morningAttendance.attendance_at);
  const remainingMinutes = Math.max(0, 420 - minutes);

  if (remainingMinutes > 0) {
    const hours = Math.floor(remainingMinutes / 60);
    const minutesLeft = remainingMinutes % 60;
    return {
      canPulang: false,
      message: `Status Pulang aktif minimal 7 jam setelah absen pagi. Sisa waktu: ${hours} jam ${minutesLeft} menit.`
    };
  }

  return { canPulang: true };
}
