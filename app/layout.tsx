import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Absensi KKN',
  description: 'Sistem absensi KKN berbasis Next.js dan MySQL'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
