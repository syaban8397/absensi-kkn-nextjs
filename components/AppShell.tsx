import Link from 'next/link';
import { logoutAction } from '@/app/actions';
import { userInitials, userStructureLabel } from '@/lib/auth';
import type { User } from '@/lib/types';

function photoOrInitial(user: User, className = '') {
  if (user.photo_path) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={user.photo_path} alt={`Foto ${user.name}`} />;
  }

  return <span className={`avatar-fallback ${className}`}>{userInitials(user)}</span>;
}

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const isAdmin = user.role === 'admin';

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">KKN</span>
          <span>
            <strong>Absensi KKN</strong>
            <small>Next.js + MySQL</small>
          </span>
        </Link>

        <nav className="nav-links open">
          {isAdmin ? (
            <>
              <Link href="/admin/dashboard">Dashboard Admin</Link>
              <Link href="/admin/reports">Laporan</Link>
              <Link href="/profile">Profil</Link>
            </>
          ) : (
            <>
              <Link href="/attendance/pagi">Absen Pagi</Link>
              <Link href="/attendance/sore">Absen Sore</Link>
              <Link href="/history">Riwayat</Link>
              <Link href="/profile">Profil</Link>
            </>
          )}

          <form action={logoutAction}>
            <button className="btn btn-dark" type="submit">Logout</button>
          </form>
        </nav>

        <div className="user-chip">
          <div>
            <strong>{user.name}</strong>
            <small>{userStructureLabel(user)}</small>
          </div>
          {photoOrInitial(user)}
        </div>
      </header>

      <main className="page">
        {children}
      </main>
    </>
  );
}
