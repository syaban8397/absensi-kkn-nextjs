import Link from 'next/link';
import { Alert } from '@/components/Alert';
import { AppShell } from '@/components/AppShell';
import { ensureDateIsGenerated, reportSummary } from '@/lib/attendance';
import { requireAdmin } from '@/lib/auth';
import { isValidDate, todayJakarta } from '@/lib/date';

type Props = {
  searchParams?: {
    date?: string;
    success?: string;
    error?: string;
  };
};

export default async function ReportsPage({ searchParams }: Props) {
  const user = await requireAdmin();
  const date = searchParams?.date && isValidDate(searchParams.date) ? searchParams.date : todayJakarta();

  await ensureDateIsGenerated(date);
  const rows = await reportSummary(date);

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Laporan Kehadiran</p>
        <h1>Rekap yang siap dibagikan</h1>
        <p>
          Tinjau ringkasan kehadiran peserta, lalu unduh laporan dalam format PDF atau Excel.
        </p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <section className="card section-gap-bottom">
        <div className="card-header">
          <h2>Atur laporan</h2>
          <p className="muted">Pilih tanggal sebelum melihat atau mengunduh rekap kehadiran.</p>
        </div>

        <form className="actions">
          <div>
            <label htmlFor="date">Tanggal laporan</label>
            <input id="date" type="date" name="date" defaultValue={date} />
          </div>
          <button className="btn btn-primary" type="submit">Tampilkan rekap</button>
          <Link className="btn btn-dark" href={`/api/export/pdf?date=${date}`}>Unduh PDF</Link>
          <Link className="btn btn-success" href={`/api/export/excel?date=${date}`}>Unduh Excel</Link>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Pratinjau laporan</h2>
          <p className="muted">Ringkasan status kehadiran setiap peserta untuk tanggal yang dipilih.</p>
        </div>

        <div className="table-wrap responsive-table">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Status hari ini</th>
                <th>Hadir</th>
                <th>Izin</th>
                <th>Pulang</th>
                <th>Alfa</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="empty-cell" colSpan={6}>Belum ada data laporan untuk tanggal ini.</td></tr>
              ) : null}

              {rows.map((row) => (
                <tr key={row.nama}>
                  <td data-label="Nama"><strong>{row.nama}</strong></td>
                  <td data-label="Status">{row.status_kehadiran_hari}</td>
                  <td data-label="Hadir">{row.hadir}</td>
                  <td data-label="Izin">{row.izin}</td>
                  <td data-label="Pulang">{row.pulang}</td>
                  <td data-label="Alfa">{row.alfa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
