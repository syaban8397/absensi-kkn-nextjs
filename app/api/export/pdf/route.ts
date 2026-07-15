import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { ensureDateIsGenerated, reportSummary } from '@/lib/attendance';
import { getCurrentUser } from '@/lib/auth';
import { formatDateId, isValidDate, todayJakarta } from '@/lib/date';

export const runtime = 'nodejs';

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

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

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 36
  });

  const pdfReady = collectPdf(doc);

  doc.fontSize(20).text('Laporan Absensi Peserta KKN', { align: 'left' });
  doc.moveDown(0.25);
  doc.fontSize(10).fillColor('#64748b').text(`Tanggal status hari: ${formatDateId(date)}`);
  doc.moveDown(1);
  doc.fillColor('#111827');

  const startX = 36;
  const widths = [170, 230, 60, 60, 60, 60];
  const headers = ['Nama', 'Status Kehadiran Hari', 'Hadir', 'Izin', 'Pulang', 'Alfa'];
  const rowHeight = 26;

  let y = doc.y + 8;

  function drawRow(values: Array<string | number>, header = false) {
    let x = startX;

    if (y > 535) {
      doc.addPage();
      y = 36;
    }

    doc.rect(startX, y, widths.reduce((sum, width) => sum + width, 0), rowHeight)
      .fill(header ? '#ea580c' : '#ffffff');

    values.forEach((value, index) => {
      doc
        .fillColor(header ? '#ffffff' : '#111827')
        .font(header ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(header ? 9 : 8)
        .text(String(value), x + 6, y + 8, {
          width: widths[index] - 12,
          ellipsis: true
        });

      x += widths[index];
    });

    doc
      .strokeColor('#fed7aa')
      .lineWidth(0.5)
      .rect(startX, y, widths.reduce((sum, width) => sum + width, 0), rowHeight)
      .stroke();

    y += rowHeight;
  }

  drawRow(headers, true);

  rows.forEach((row) => {
    drawRow([
      row.nama,
      row.status_kehadiran_hari,
      row.hadir,
      row.izin,
      row.pulang,
      row.alfa
    ]);
  });

  doc.end();
  const pdf = await pdfReady;

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-absensi-kkn-${date}.pdf"`,
      'Cache-Control': 'no-store'
    }
  });
}
