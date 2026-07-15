import mysql, { Pool } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var absensiKknPool: Pool | undefined;
}

function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export function getPool(): Pool {
  if (!global.absensiKknPool) {
    global.absensiKknPool = mysql.createPool({
      host: env('DB_HOST', '127.0.0.1'),
      port: Number(env('DB_PORT', '3306')),
      database: env('DB_DATABASE', 'absensi_kkn_nextjs'),
      user: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      charset: 'utf8mb4'
    });
  }

  return global.absensiKknPool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: any[] = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}
