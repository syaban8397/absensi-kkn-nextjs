import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Absensi KKN',
    template: '%s · Absensi KKN'
  },
  description: 'Sistem kehadiran peserta KKN untuk absensi pagi, sore, dan laporan kegiatan.',
  icons: {
    icon: '/icon.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fffaf4'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
