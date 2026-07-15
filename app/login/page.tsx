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
    <div className="login-screen">
      <div className="login-card">
        <section className="login-hero">
          <div>
            <span className="badge">Sistem Absensi KKN</span>
            <h1>Absensi peserta yang rapi, aman, dan terukur.</h1>
            <p>
              Peserta login memakai akun masing-masing. Admin dapat memantau data absensi,
              mengoreksi data, dan mengunduh laporan PDF atau Excel.
            </p>
          </div>
          <div className="hero-stats">
            <div>
              <strong>05-11</strong>
              <span>Absen Pagi</span>
            </div>
            <div>
              <strong>13-22</strong>
              <span>Absen Sore</span>
            </div>
            <div>
              <strong>PDF</strong>
              <span>Excel Export</span>
            </div>
          </div>
        </section>

        <section className="login-form">
          <div className="login-logo">KKN</div>
          <h2>Masuk Absensi</h2>
          <p>Gunakan username dan password dari admin.</p>

          <Alert success={searchParams?.success} error={searchParams?.error} />

          <form action={loginAction} className="form-grid">
            <div>
              <label htmlFor="username">Username</label>
              <input id="username" type="text" name="username" required autoFocus autoComplete="username" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" required autoComplete="current-password" />
            </div>

            <button className="btn btn-primary" type="submit">Login</button>
          </form>
        </section>
      </div>
    </div>
  );
}
