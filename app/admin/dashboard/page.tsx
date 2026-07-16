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
      <div className="card-header">
        <h2>{title}</h2>
        <p className="muted">{caption} Terdapat {rows.length} data peserta.</p>
      </div>

      <div className="table-wrap responsive-table">
        <table>
          <thead>
            <tr>
              <th>Peserta</th>
              <th>Jam</th>
              <th>Status dan catatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="empty-cell" colSpan={3}>Belum ada data untuk tanggal ini.</td></tr>
            ) : null}

            {rows.map((attendance) => (
              <tr key={attendance.id}>
                <td data-label="Peserta">
                  <div className="avatar">
                    {attendance.photo_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={attendance.photo_path} alt={`Foto profil ${attendance.name}`} />
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
                <td data-label="Jam">{formatAttendanceTime(attendance.attendance_at)}</td>
                <td data-label="Status">
                  <form action={updateAdminAttendanceAction} className="inline-form">
                    <input type="hidden" name="id" value={attendance.id} />
                    <input type="hidden" name="date" value={date} />

                    <select name="status" defaultValue={attendance.status} aria-label={`Status ${attendance.name}`} required>
                      {Object.entries(statusesForPeriod(period)).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="note"
                      defaultValue={attendance.note ?? ''}
                      placeholder="Tambahkan catatan"
                      aria-label={`Catatan ${attendance.name}`}
                    />

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
        <h1>Pantau kehadiran peserta</h1>
        <p>
          Tinjau absensi pagi dan sore, perbarui status peserta, lalu siapkan laporan untuk tanggal yang dipilih.
        </p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <section className="card section-gap-bottom">
        <div className="card-header">
          <h2>Pilih tanggal</h2>
          <p className="muted">Gunakan filter untuk melihat data kehadiran pada hari tertentu.</p>
        </div>

        <form className="actions">
          <div>
            <label htmlFor="date">Tanggal absensi</label>
            <input id="date" type="date" name="date" defaultValue={date} />
          </div>
          <button className="btn btn-primary" type="submit">Tampilkan data</button>
          <Link className="btn btn-success" href={`/admin/reports?date=${date}`}>Lihat laporan</Link>
        </form>
      </section>

      <div className="grid grid-2">
        <TableBlock
          title="Absensi pagi"
          caption="Jadwal peserta pukul 05.00–11.00 WIB."
          period={PERIOD_PAGI}
          rows={morningAttendances}
          date={date}
        />

        <TableBlock
          title="Absensi sore"
          caption="Jadwal peserta pukul 13.00–22.00 WIB. Admin dapat memperbarui status kapan saja."
          period={PERIOD_SORE}
          rows={eveningAttendances}
          date={date}
        />
      </div>
    </AppShell>
  );
}
