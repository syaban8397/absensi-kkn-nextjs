import { Alert } from '@/components/Alert';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import {
  attendanceSummaryForUser,
  ensureDateIsGenerated,
  formatAttendanceTime,
  getUserHistory,
  periodLabel
} from '@/lib/attendance';
import { requirePeserta } from '@/lib/auth';
import { formatDateId, todayJakarta } from '@/lib/date';

type Props = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function HistoryPage({ searchParams }: Props) {
  const user = await requirePeserta();
  await ensureDateIsGenerated(todayJakarta());

  const [history, summary] = await Promise.all([
    getUserHistory(user.id, 50),
    attendanceSummaryForUser(user.id)
  ]);

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Riwayat Kehadiran</p>
        <h1>Catatan absensi Anda</h1>
        <p>
          Lihat ringkasan dan detail absensi terbaru atas nama {user.name}.
        </p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-4">
        <div className="stat-card"><span>Hadir</span><strong>{summary.hadir}</strong></div>
        <div className="stat-card"><span>Izin</span><strong>{summary.izin}</strong></div>
        <div className="stat-card"><span>Pulang</span><strong>{summary.pulang}</strong></div>
        <div className="stat-card"><span>Alfa</span><strong>{summary.alfa}</strong></div>
      </div>

      <section className="card section-gap">
        <div className="card-header">
          <h2>Riwayat absensi</h2>
          <p className="muted">Menampilkan hingga 50 catatan terbaru.</p>
        </div>

        <div className="table-wrap responsive-table">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Periode</th>
                <th>Jam</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td className="empty-cell" colSpan={5}>Belum ada data absensi.</td></tr>
              ) : null}

              {history.map((attendance) => (
                <tr key={attendance.id}>
                  <td data-label="Tanggal">{formatDateId(attendance.attendance_date)}</td>
                  <td data-label="Periode">{periodLabel(attendance.period)}</td>
                  <td data-label="Jam">{formatAttendanceTime(attendance.attendance_at)}</td>
                  <td data-label="Status"><StatusBadge status={attendance.status} /></td>
                  <td data-label="Catatan">{attendance.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
