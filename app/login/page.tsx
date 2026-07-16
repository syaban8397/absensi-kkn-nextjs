import Image from 'next/image';
import { redirect } from 'next/navigation';
import { loginAction } from '@/app/actions';
import { Alert } from '@/components/Alert';
import { getCurrentUser } from '@/lib/auth';

type Props = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="login-screen">
      <div className="login-card">
        <section className="login-hero">
          <div className="login-hero-copy">
            <div className="hero-brand">
              <span className="hero-brand-mark">
                <Image src="/logo-kkn.png" alt="" width={56} height={59} priority />
              </span>
              <span>
                <strong>Absensi KKN</strong>
                <small>Catat kehadiran dengan lebih tertib</small>
              </span>
            </div>

            <p className="eyebrow light">Sistem Kehadiran Peserta</p>
            <h1>Satu tempat untuk absensi yang jelas dan terpercaya.</h1>
            <p className="hero-description">
              Peserta dapat mencatat kehadiran pagi dan sore. Admin memantau data,
              melakukan koreksi, serta menyiapkan laporan dalam format PDF dan Excel.
            </p>
          </div>

          <div className="hero-stats" aria-label="Ringkasan jadwal absensi">
            <div>
              <strong>05.00–11.00</strong>
              <span>Absensi pagi</span>
            </div>
            <div>
              <strong>13.00–22.00</strong>
              <span>Absensi sore</span>
            </div>
            <div>
              <strong>PDF · XLSX</strong>
              <span>Laporan siap unduh</span>
            </div>
          </div>
        </section>

        <section className="login-form">
          <div className="login-logo">
            <Image src="/logo-kkn.png" alt="Logo KKN" width={86} height={91} priority />
          </div>

          <div className="login-heading">
            <p className="eyebrow">Selamat Datang</p>
            <h2>Masuk ke akun</h2>
            <p>Gunakan nama pengguna dan kata sandi yang diberikan admin.</p>
          </div>

          <Alert success={searchParams?.success} error={searchParams?.error} />

          <form action={loginAction} className="form-grid">
            <div className="field-group">
              <label htmlFor="username">Nama pengguna</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Masukkan nama pengguna"
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">Kata sandi</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary btn-block btn-login" type="submit">
              Masuk
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="login-help">Kesulitan masuk? Hubungi admin KKN.</p>
        </section>
      </div>
    </main>
  );
}
