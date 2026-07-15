export type UserRole = 'admin' | 'peserta';
export type Period = 'pagi' | 'sore';
export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alfa' | 'pulang';

export type User = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  password: string;
  role: UserRole;
  division: string | null;
  position: string | null;
  photo_path: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Attendance = {
  id: number;
  user_id: number;
  attendance_date: string;
  period: Period;
  status: AttendanceStatus;
  note: string | null;
  attendance_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminAttendanceRow = Attendance & {
  name: string;
  username: string;
  division: string | null;
  position: string | null;
  photo_path: string | null;
};

export type ReportRow = {
  nama: string;
  status_kehadiran_hari: string;
  hadir: number;
  izin: number;
  pulang: number;
  alfa: number;
};
