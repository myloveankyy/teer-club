import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { Providers } from './providers';
import AdminNotificationPoller from '@/components/AdminNotificationPoller';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Teer Club Admin',
  description: 'Admin dashboard for Teer Club',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col h-screen w-full overflow-hidden`}>
        <AuthProvider>
          <Providers>
            {children}
            <AdminNotificationPoller />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
