import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { ensureDateIsGenerated, reportSummary } from '@/lib/attendance';
import { getCurrentUser } from '@/lib/auth';
import { isValidDate, todayJakarta } from '@/lib/date';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const requestedDate = request.nextUrl.searchParams.get('date') || todayJakarta();
  const date = isValidDate(requestedDate) ? requestedDate : todayJakarta();

  await ensureDateIsGenerated(date);
  const rows = await reportSummary(date);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Absensi KKN Next.js';

  const sheet = workbook.addWorksheet('Laporan Absensi');
  sheet.columns = [
    { header: 'Nama', key: 'nama', width: 32 },
    { header: 'Status Kehadiran Hari', key: 'status_kehadiran_hari', width: 42 },
    { header: 'Hadir', key: 'hadir', width: 10 },
    { header: 'Izin', key: 'izin', width: 10 },
    { header: 'Pulang', key: 'pulang', width: 10 },
    { header: 'Alfa', key: 'alfa', width: 10 }
  ];

  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: 'middle' };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-absensi-kkn-${date}.xlsx"`,
      'Cache-Control': 'no-store'
    }
  });
}
