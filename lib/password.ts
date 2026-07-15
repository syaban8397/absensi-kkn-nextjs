import bcrypt from 'bcryptjs';

function normalizePhpBcrypt(hash: string): string {
  // PHP password_hash sering memakai prefix $2y$.
  // bcryptjs lebih aman dibandingkan setelah dinormalisasi ke $2a$.
  return hash.replace(/^\$2y\$/, '$2a$');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, normalizePhpBcrypt(hash));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
