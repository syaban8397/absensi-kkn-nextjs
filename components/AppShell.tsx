import Image from 'next/image';
import Link from 'next/link';
import { logoutAction } from '@/app/actions';
import { userInitials, userStructureLabel } from '@/lib/auth';
import type { User } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
};

function photoOrInitial(user: User, className = '') {
  if (user.photo_path) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={user.photo_path} alt={`Foto profil ${user.name}`} />;
  }

  return <span className={`avatar-fallback ${className}`}>{userInitials(user)}</span>;
}

function NavigationLinks({ items, mobile = false }: { items: NavItem[]; mobile?: boolean }) {
  return (
    <>
      {items.map((item) => (
        <Link className={mobile ? 'mobile-nav-link' : 'nav-link'} href={item.href} key={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const isAdmin = user.role === 'admin';
  const navItems: NavItem[] = isAdmin
    ? [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/reports', label: 'Laporan' },
        { href: '/profile', label: 'Profil' }
      ]
    : [
        { href: '/attendance/pagi', label: 'Absen Pagi' },
        { href: '/attendance/sore', label: 'Absen Sore' },
        { href: '/history', label: 'Riwayat' },
        { href: '/profile', label: 'Profil' }
      ];

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/dashboard" aria-label="Beranda Absensi KKN">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/logo-kkn.png" alt="" width={48} height={51} priority />
          </span>
          <span className="brand-copy">
            <strong>Absensi KKN</strong>
            <small>Sistem kehadiran peserta</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Navigasi utama">
          <NavigationLinks items={navItems} />
        </nav>

        <div className="header-actions">
          <div className="user-chip">
            <div className="user-chip-copy">
              <strong>{user.name}</strong>
              <small>{userStructureLabel(user)}</small>
            </div>
            {photoOrInitial(user)}
          </div>

          <form action={logoutAction} className="desktop-logout">
            <button className="btn btn-dark btn-compact" type="submit">Keluar</button>
          </form>
        </div>

        <details className="mobile-nav">
          <summary aria-label="Buka menu navigasi">
            <span className="menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </summary>

          <div className="mobile-nav-panel">
            <div className="mobile-user">
              {photoOrInitial(user, 'mobile-user-avatar')}
              <div>
                <strong>{user.name}</strong>
                <small>{userStructureLabel(user)}</small>
              </div>
            </div>

            <nav aria-label="Navigasi seluler">
              <NavigationLinks items={navItems} mobile />
            </nav>

            <form action={logoutAction}>
              <button className="btn btn-dark btn-block" type="submit">Keluar dari akun</button>
            </form>
          </div>
        </details>
      </header>

      <main className="page">{children}</main>
    </>
  );
}
