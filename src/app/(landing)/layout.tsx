import type { Metadata } from 'next';
import { CloudflareWebAnalytics } from '@/components/analytics/cloudflare-web-analytics';
import { AdSenseAutoAds } from '@/components/ads/adsense-auto-ads';
import '../globals.css';

export const metadata: Metadata = {
  title: 'DevDesk — Browser-based developer tools',
  description: 'Free developer utilities that run in your browser.',
};

export default function LandingRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AdSenseAutoAds />
        {children}
        <CloudflareWebAnalytics />
      </body>
    </html>
  );
}
