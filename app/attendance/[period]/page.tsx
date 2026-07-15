import { notFound } from 'next/navigation';
import { submitAttendanceAction } from '@/app/actions';
import { Alert } from '@/components/Alert';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ensureDateIsGenerated,
  formatAttendanceTime,
  getAttendance,
  isPeriod,
  isWithinWindow,
  periodLabel,
  PERIOD_PAGI,
  PERIOD_SORE,
  pulangEligibility,
  STATUS_ALFA,
  STATUS_PULANG,
  statusesForPeriod,
  windowLabel
} from '@/lib/attendance';
import { requirePeserta } from '@/lib/auth';
import { formatDateId, nowMysql, todayJakarta } from '@/lib/date';

type Props = {
  params: {
    period: string;
  };
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function AttendancePage({ params, searchParams }: Props) {
  if (!isPeriod(params.period)) notFound();

  const user = await requirePeserta();
  const period = params.period;
  const today = todayJakarta();

  await ensureDateIsGenerated(today);

  const attendance = await getAttendance(user.id, today, period);
  const morningAttendance = await getAttendance(user.id, today, PERIOD_PAGI);

  const periodOpen = isWithinWindow(period);
  const eligibility = period === PERIOD_SORE ? pulangEligibility(morningAttendance) : { canPulang: true };

  const periodName = periodLabel(period);
  const windowMessage = periodOpen
    ? 'Form absensi sedang dibuka.'
    : `Form hanya bisa diisi pada jam ${windowLabel(period)}. Jika tidak diisi sampai batas waktu selesai, status tetap Alfa.`;

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Absensi {periodName}</p>
        <h1>Halo, {user.name}</h1>
        <p>
          Tanggal {formatDateId(today)}. Jam server: <strong>{nowMysql()}</strong>.
          {' '}Jadwal absen {periodName.toLowerCase()}: {windowLabel(period)} WIB.
        </p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-2">
        <section className="card">
          <h2>Form Absensi {periodName}</h2>

          <div className={`alert ${periodOpen ? 'alert-success' : 'alert-warning'}`}>
            {windowMessage}
          </div>

          {eligibility.message ? (
            <div className="alert alert-warning">{eligibility.message}</div>
          ) : null}

          <form action={submitAttendanceAction} className="form-grid">
            <input type="hidden" name="period" value={period} />

            <div>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={attendance?.status ?? STATUS_ALFA}
                disabled={!periodOpen}
                required
              >
                {Object.entries(statusesForPeriod(period)).map(([value, label]) => {
                  const disabled = period === PERIOD_SORE && value === STATUS_PULANG && !eligibility.canPulang;

                  return (
                    <option key={value} value={value} disabled={disabled}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="note">Catatan</label>
              <textarea
                id="note"
                name="note"
                placeholder="Opsional, contoh: izin kegiatan, sakit, atau keterangan lain."
                defaultValue={attendance?.note ?? ''}
                disabled={!periodOpen}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={!periodOpen}>Simpan Absensi</button>
          </form>
        </section>

        <aside className="card">
          <h2>Status Hari Ini</h2>

          <div className="grid">
            <div className="stat-card">
              <span>Periode</span>
              <strong>{periodName}</strong>
            </div>

            <p>
              Status saat ini: <StatusBadge status={attendance?.status ?? STATUS_ALFA} />
            </p>

            <p><strong>Jam absen:</strong> {formatAttendanceTime(attendance?.attendance_at)}</p>
            <p><strong>Catatan:</strong> {attendance?.note || '-'}</p>

            {period === PERIOD_SORE ? (
              <>
                <hr />
                <p><strong>Absen pagi:</strong> {formatAttendanceTime(morningAttendance?.attendance_at)}</p>
                <p className="muted">Status pulang baru aktif minimal 7 jam setelah absen pagi.</p>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
