import { deleteProfilePhotoAction, updatePasswordAction, updateProfilePhotoAction } from '@/app/actions';
import { Alert } from '@/components/Alert';
import { AppShell } from '@/components/AppShell';
import { requireUser, userInitials, userStructureLabel } from '@/lib/auth';

type Props = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function ProfilePage({ searchParams }: Props) {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <section className="section-hero">
        <p className="eyebrow">Profile</p>
        <h1>Foto Profil & Password</h1>
        <p>Pengguna dapat mengubah foto profil dan password akunnya sendiri.</p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-2">
        <section className="card">
          <h2>Foto Profil</h2>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {user.photo_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="profile-photo" src={user.photo_path} alt={`Foto profil ${user.name}`} />
            ) : (
              <div className="profile-photo avatar-fallback" style={{ margin: '0 auto', fontSize: 34 }}>
                {userInitials(user)}
              </div>
            )}

            <h3 style={{ marginBottom: 4 }}>{user.name}</h3>
            <p className="muted" style={{ marginTop: 0 }}>{userStructureLabel(user)}</p>
          </div>

          <form action={updateProfilePhotoAction} encType="multipart/form-data" className="form-grid">
            <div>
              <label htmlFor="photo">Upload Foto</label>
              <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" required />
              <p className="muted">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
            </div>

            <button className="btn btn-primary" type="submit">Simpan Foto</button>
          </form>

          {user.photo_path ? (
            <form action={deleteProfilePhotoAction} style={{ marginTop: 12 }}>
              <button className="btn btn-light" type="submit">Hapus Foto</button>
            </form>
          ) : null}
        </section>

        <section className="card">
          <h2>Ganti Password</h2>

          <form action={updatePasswordAction} className="form-grid">
            <div>
              <label htmlFor="current_password">Password Lama</label>
              <input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
            </div>

            <div>
              <label htmlFor="password">Password Baru</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required />
              <p className="muted">Minimal 8 karakter.</p>
            </div>

            <div>
              <label htmlFor="password_confirmation">Konfirmasi Password Baru</label>
              <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required />
            </div>

            <button className="btn btn-dark" type="submit">Simpan Password</button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
