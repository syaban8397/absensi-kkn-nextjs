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
        <p className="eyebrow">Dokumentasi</p>
        <h1>Laporan PDF & Excel</h1>
        <p>Laporan menampilkan rekap nama, status hari, hadir, izin, pulang, dan alfa.</p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <section className="card" style={{ marginBottom: 20 }}>
        <form className="actions">
          <div style={{ minWidth: 240 }}>
            <label htmlFor="date">Tanggal</label>
            <input id="date" type="date" name="date" defaultValue={date} />
          </div>
          <button className="btn btn-primary" type="submit">Filter</button>
          <Link className="btn btn-dark" href={`/api/export/pdf?date=${date}`}>Download PDF</Link>
          <Link className="btn btn-success" href={`/api/export/excel?date=${date}`}>Download Excel</Link>
        </form>
      </section>

      <section className="card">
        <h2>Preview Laporan</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Status Kehadiran Hari</th>
                <th>Hadir</th>
                <th>Izin</th>
                <th>Pulang</th>
                <th>Alfa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.nama}>
                  <td><strong>{row.nama}</strong></td>
                  <td>{row.status_kehadiran_hari}</td>
                  <td>{row.hadir}</td>
                  <td>{row.izin}</td>
                  <td>{row.pulang}</td>
                  <td>{row.alfa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
