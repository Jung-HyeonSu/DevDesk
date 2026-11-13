import type { Metadata } from 'next';
import { CloudflareWebAnalytics } from '@/components/analytics/cloudflare-web-analytics';
import '../globals.css';

export const metadata: Metadata = {
  title: 'DevDesk — Browser-based developer tools',
  description: 'Free developer utilities that run in your browser.',
};

export default function LandingRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <CloudflareWebAnalytics />
      </body>
    </html>
  );
}
