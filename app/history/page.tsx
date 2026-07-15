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
        <p className="eyebrow">Riwayat Peserta</p>
        <h1>Data Absensi Saya</h1>
        <p>Semua data absensi milik akun {user.name} ditampilkan di halaman ini.</p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-4">
        <div className="stat-card"><span>Hadir</span><strong>{summary.hadir}</strong></div>
        <div className="stat-card"><span>Izin</span><strong>{summary.izin}</strong></div>
        <div className="stat-card"><span>Pulang</span><strong>{summary.pulang}</strong></div>
        <div className="stat-card"><span>Alfa</span><strong>{summary.alfa}</strong></div>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Riwayat Absensi</h2>

        <div className="table-wrap">
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
                <tr><td colSpan={5}>Belum ada data absensi.</td></tr>
              ) : null}

              {history.map((attendance) => (
                <tr key={attendance.id}>
                  <td>{formatDateId(attendance.attendance_date)}</td>
                  <td>{periodLabel(attendance.period)}</td>
                  <td>{formatAttendanceTime(attendance.attendance_at)}</td>
                  <td><StatusBadge status={attendance.status} /></td>
                  <td>{attendance.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
