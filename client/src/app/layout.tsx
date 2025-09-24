import type { Metadata } from "next";
import "./globals.css";
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: "LogiTrack - Logistics Management System",
  description: "Comprehensive logistics management system with role-based dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
