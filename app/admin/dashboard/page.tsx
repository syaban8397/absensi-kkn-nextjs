import Link from 'next/link';
import { updateAdminAttendanceAction } from '@/app/actions';
import { Alert } from '@/components/Alert';
import { AppShell } from '@/components/AppShell';
import {
  adminAttendanceRows,
  ensureDateIsGenerated,
  formatAttendanceTime,
  PERIOD_PAGI,
  PERIOD_SORE,
  periodLabel,
  statusesForPeriod
} from '@/lib/attendance';
import { requireAdmin, userInitials } from '@/lib/auth';
import { isValidDate, todayJakarta } from '@/lib/date';
import type { AdminAttendanceRow, Period } from '@/lib/types';

type Props = {
  searchParams?: {
    date?: string;
    success?: string;
    error?: string;
  };
};

function TableBlock({ title, caption, period, rows, date }: {
  title: string;
  caption: string;
  period: Period;
  rows: AdminAttendanceRow[];
  date: string;
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="muted">{caption} Total: {rows.length} data.</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Peserta</th>
              <th>Jam</th>
              <th>Status & Catatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3}>Belum ada data untuk tanggal ini.</td></tr>
            ) : null}

            {rows.map((attendance) => (
              <tr key={attendance.id}>
                <td>
                  <div className="avatar">
                    {attendance.photo_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={attendance.photo_path} alt={`Foto ${attendance.name}`} />
                    ) : (
                      <span className="avatar-fallback">{userInitials({ name: attendance.name })}</span>
                    )}
                    <div>
                      <strong>{attendance.name}</strong><br />
                      <small className="muted">
                        {[attendance.division, attendance.position].filter(Boolean).join(' • ') || attendance.username}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{formatAttendanceTime(attendance.attendance_at)}</td>
                <td>
                  <form action={updateAdminAttendanceAction} className="inline-form">
                    <input type="hidden" name="id" value={attendance.id} />
                    <input type="hidden" name="date" value={date} />

                    <select name="status" defaultValue={attendance.status} required>
                      {Object.entries(statusesForPeriod(period)).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <input type="text" name="note" defaultValue={attendance.note ?? ''} placeholder="Catatan admin" />

                    <button className="btn btn-dark" type="submit">Simpan</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const user = await requireAdmin();
  const date = searchParams?.date && isValidDate(searchParams.date) ? searchParams.date : todayJakarta();

  await ensureDateIsGenerated(date);

  const [morningAttendances, eveningAttendances] = await Promise.all([
    adminAttendanceRows(date, PERIOD_PAGI),
    adminAttendanceRows(date, PERIOD_SORE)
  ]);

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Panel Admin</p>
        <h1>Data Peserta Absensi</h1>
        <p>Admin bisa memantau absensi pagi dan sore, serta mengubah status tanpa aturan tunggu 7 jam.</p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <section className="card" style={{ marginBottom: 20 }}>
        <form className="actions">
          <div style={{ minWidth: 240 }}>
            <label htmlFor="date">Tanggal</label>
            <input id="date" type="date" name="date" defaultValue={date} />
          </div>
          <button className="btn btn-primary" type="submit">Filter</button>
          <Link className="btn btn-success" href={`/admin/reports?date=${date}`}>Buka Laporan</Link>
        </form>
      </section>

      <div className="grid grid-2">
        <TableBlock
          title="Tabel Absen Pagi"
          caption="Jam peserta 05.00 - 11.00 WIB."
          period={PERIOD_PAGI}
          rows={morningAttendances}
          date={date}
        />

        <TableBlock
          title="Tabel Absen Sore"
          caption="Jam peserta 13.00 - 22.00 WIB. Admin bisa edit kapan saja, termasuk status Pulang."
          period={PERIOD_SORE}
          rows={eveningAttendances}
          date={date}
        />
      </div>
    </AppShell>
  );
}
