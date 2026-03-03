import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { Providers } from './providers';
import AdminNotificationPoller from '@/components/AdminNotificationPoller';

const inter = Inter({ subsets: ['latin'] });

const INTERNAL_API = process.env.INTERNAL_API_URL || "http://127.0.0.1:5000";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Teer Club";
  let siteFavicon = "/favicon.ico";
  try {
    const res = await fetch(`${INTERNAL_API}/api/admin/settings`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const settings = await res.json();
      siteName = settings.site_name || siteName;
      siteFavicon = settings.site_favicon || siteFavicon;
    }
  } catch (e) {
    console.warn("Failed to fetch settings for metadata", e);
  }

  return {
    title: `${siteName} Admin Panel`,
    description: `Admin dashboard for ${siteName}`,
    icons: {
      icon: siteFavicon,
      apple: siteFavicon,
    },
  };
}

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
