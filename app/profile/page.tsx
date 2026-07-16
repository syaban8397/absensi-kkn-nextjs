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
        <p className="eyebrow">Profil Akun</p>
        <h1>Profil dan keamanan akun</h1>
        <p>Perbarui foto profil atau kata sandi agar akun Anda tetap aman dan mudah dikenali.</p>
      </section>

      <Alert success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-2">
        <section className="card">
          <div className="card-header">
            <h2>Foto profil</h2>
            <p className="muted">Gunakan foto yang jelas agar admin mudah mengenali Anda.</p>
          </div>

          <div className="profile-overview">
            {user.photo_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="profile-photo" src={user.photo_path} alt={`Foto profil ${user.name}`} />
            ) : (
              <div className="profile-photo avatar-fallback">
                {userInitials(user)}
              </div>
            )}

            <h3>{user.name}</h3>
            <p className="muted">{userStructureLabel(user)}</p>
          </div>

          <form action={updateProfilePhotoAction} encType="multipart/form-data" className="form-grid">
            <div>
              <label htmlFor="photo">Pilih foto baru</label>
              <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" required />
              <p className="form-note">Format JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB.</p>
            </div>

            <button className="btn btn-primary" type="submit">Simpan foto</button>
          </form>

          {user.photo_path ? (
            <form action={deleteProfilePhotoAction} className="section-gap">
              <button className="btn btn-light btn-block" type="submit">Hapus foto saat ini</button>
            </form>
          ) : null}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Ganti kata sandi</h2>
            <p className="muted">Gunakan sedikitnya 8 karakter dan jangan bagikan kepada siapa pun.</p>
          </div>

          <form action={updatePasswordAction} className="form-grid">
            <div>
              <label htmlFor="current_password">Kata sandi saat ini</label>
              <input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
            </div>

            <div>
              <label htmlFor="password">Kata sandi baru</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required />
              <p className="form-note">Minimal 8 karakter.</p>
            </div>

            <div>
              <label htmlFor="password_confirmation">Ulangi kata sandi baru</label>
              <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required />
            </div>

            <button className="btn btn-dark" type="submit">Perbarui kata sandi</button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
