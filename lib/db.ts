import { Pool, types } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var absensiKknPool: Pool | undefined;
}

// Kembalikan kolom DATE (1082) dan TIMESTAMP (1114) sebagai string apa adanya,
// bukan di-parse jadi objek Date oleh node-postgres. Ini menjaga perilaku
// yang sama seperti opsi `dateStrings: true` di driver mysql2 sebelumnya,
// supaya lib/date.ts (yang mengharapkan string "YYYY-MM-DD HH:MM:SS") tetap jalan.
types.setTypeParser(1082, (value) => value); // date
types.setTypeParser(1114, (value) => value); // timestamp without time zone
types.setTypeParser(1184, (value) => value); // timestamp with time zone

function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export function getPool(): Pool {
  if (!global.absensiKknPool) {
    const connectionString = env('DATABASE_URL');

    global.absensiKknPool = connectionString
      ? new Pool({
          connectionString,
          ssl: env('PGSSL', 'true') === 'false' ? undefined : { rejectUnauthorized: false },
          max: 10
        })
      : new Pool({
          host: env('DB_HOST', '127.0.0.1'),
          port: Number(env('DB_PORT', '5432')),
          database: env('DB_DATABASE', 'postgres'),
          user: env('DB_USERNAME', 'postgres'),
          password: env('DB_PASSWORD', ''),
          ssl: env('PGSSL', 'true') === 'false' ? undefined : { rejectUnauthorized: false },
          max: 10
        });
  }

  return global.absensiKknPool;
}

// Ubah placeholder gaya mysql2 ("?") menjadi placeholder gaya Postgres ("$1", "$2", ...)
// supaya seluruh query di lib/attendance.ts, lib/auth.ts, app/actions.ts tidak perlu diubah satu-satu.
function toPgQuery(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await getPool().query(toPgQuery(sql), params);
  return result.rows as T[];
}

export async function execute(sql: string, params: any[] = []) {
  const result = await getPool().query(toPgQuery(sql), params);
  return result;
}
