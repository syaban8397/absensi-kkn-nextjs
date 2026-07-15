import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === 'admin') {
    redirect('/admin/dashboard');
  }

  redirect('/attendance/pagi');
}
