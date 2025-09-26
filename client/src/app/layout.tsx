import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'LogiTrack - Logistics Management System',
  description: 'Comprehensive logistics management system with role-based dashboards',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
