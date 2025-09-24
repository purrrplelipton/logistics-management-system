import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
