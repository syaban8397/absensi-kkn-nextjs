import { statusLabel } from '@/lib/attendance';

export function StatusBadge({ status }: { status?: string | null }) {
  const safeStatus = status || 'alfa';

  return (
    <span className={`status status-${safeStatus}`}>
      {statusLabel(safeStatus)}
    </span>
  );
}
