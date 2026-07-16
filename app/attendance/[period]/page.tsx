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
    ? 'Form absensi sedang dibuka. Silakan isi status kehadiran Anda.'
    : `Form tersedia pada pukul ${windowLabel(period)} WIB. Jika tidak diisi hingga waktu berakhir, status tetap tercatat sebagai Alfa.`;

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Absensi {periodName}</p>
        <h1>Selamat datang, {user.name}</h1>
        <p>
          {formatDateId(today)} · Waktu server {nowMysql()} · Jadwal absensi {periodName.toLowerCase()} pukul {windowLabel(period)} WIB.
        </p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-2">
        <section className="card">
          <div className="card-header">
            <h2>Isi absensi {periodName.toLowerCase()}</h2>
            <p className="muted">Pilih status yang sesuai lalu tambahkan catatan bila diperlukan.</p>
          </div>

          <div className={`alert ${periodOpen ? 'alert-success' : 'alert-warning'}`}>
            {windowMessage}
          </div>

          {eligibility.message ? (
            <div className="alert alert-warning">{eligibility.message}</div>
          ) : null}

          <form action={submitAttendanceAction} className="form-grid">
            <input type="hidden" name="period" value={period} />

            <div>
              <label htmlFor="status">Status kehadiran</label>
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
                placeholder="Contoh: izin mengikuti kegiatan, sakit, atau keterangan lain."
                defaultValue={attendance?.note ?? ''}
                disabled={!periodOpen}
              />
              <p className="form-note">Catatan bersifat opsional.</p>
            </div>

            <button className="btn btn-primary" type="submit" disabled={!periodOpen}>
              Simpan absensi
            </button>
          </form>
        </section>

        <aside className="card">
          <div className="card-header">
            <h2>Status hari ini</h2>
            <p className="muted">Ringkasan absensi untuk periode yang sedang Anda buka.</p>
          </div>

          <div className="stat-card section-gap-bottom">
            <span>Periode</span>
            <strong>{periodName}</strong>
          </div>

          <dl className="status-detail">
            <div className="status-detail-row">
              <dt>Status saat ini</dt>
              <dd><StatusBadge status={attendance?.status ?? STATUS_ALFA} /></dd>
            </div>
            <div className="status-detail-row">
              <dt>Waktu absen</dt>
              <dd>{formatAttendanceTime(attendance?.attendance_at)}</dd>
            </div>
            <div className="status-detail-row">
              <dt>Catatan</dt>
              <dd>{attendance?.note || '—'}</dd>
            </div>

            {period === PERIOD_SORE ? (
              <>
                <div className="status-detail-row">
                  <dt>Absen pagi</dt>
                  <dd>{formatAttendanceTime(morningAttendance?.attendance_at)}</dd>
                </div>
              </>
            ) : null}
          </dl>

          {period === PERIOD_SORE ? (
            <p className="form-note section-gap">
              Status Pulang baru tersedia minimal 7 jam setelah absensi pagi.
            </p>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
