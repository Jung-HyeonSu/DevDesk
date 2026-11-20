import Script from 'next/script';
import { getAdSenseClientId } from '@/lib/ads';

export function AdSenseAutoAds() {
  const clientId = getAdSenseClientId({
    NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
    NEXT_PUBLIC_ADSENSE_APPROVED: process.env.NEXT_PUBLIC_ADSENSE_APPROVED,
    NEXT_PUBLIC_ADS_CONSENT_READY: process.env.NEXT_PUBLIC_ADS_CONSENT_READY,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  });
  if (!clientId) return null;

  return (
    <Script
      async
      crossOrigin="anonymous"
      id="devdesk-adsense-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
      strategy="beforeInteractive"
    />
  );
}
