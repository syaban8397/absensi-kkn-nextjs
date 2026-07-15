const TZ = process.env.APP_TIMEZONE || 'Asia/Jakarta';

export function jakartaNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

export function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function todayJakarta(): string {
  const now = jakartaNow();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function nowMysql(): string {
  const now = jakartaNow();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function formatDateId(date: string): string {
  if (!date) return '-';
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}-${month}-${year}`;
}

export function formatDateLongId(date: string): string {
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(parsed);
}

export function formatTime(datetime?: string | null): string {
  if (!datetime) return 'Belum absen';

  const normalized = datetime.includes('T') ? datetime : datetime.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return 'Belum absen';

  return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function minutesBetween(startDateTime: string, end: Date = jakartaNow()): number {
  const start = new Date(startDateTime.replace(' ', 'T'));
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}
