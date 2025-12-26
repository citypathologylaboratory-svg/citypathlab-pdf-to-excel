import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'City Pathology PDF to Excel',
  description: 'Convert pathology PDFs to Excel format',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
