import Script from 'next/script';
import { getAdSlotConfig, type AdPlacement } from '@/lib/ads';
import type { Locale } from '@/i18n/config';

const adLabels: Record<Locale, string> = {
  ko: '광고',
  en: 'Advertisement',
  ja: '広告',
  zh: '广告',
};

export function AdSlot({ locale, placement }: { locale: Locale; placement: AdPlacement }) {
  const config = getAdSlotConfig(placement, {
    NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
    NEXT_PUBLIC_ADSENSE_APPROVED: process.env.NEXT_PUBLIC_ADSENSE_APPROVED,
    NEXT_PUBLIC_ADS_CONSENT_READY: process.env.NEXT_PUBLIC_ADS_CONSENT_READY,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID,
    NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID,
  });
  if (!config) return null;

  return (
    <aside aria-label={adLabels[locale]} className="ad-slot" data-ad-placement={placement}>
      <p className="ad-slot-label">{adLabels[locale]}</p>
      <ins
        className="adsbygoogle"
        data-ad-client={config.clientId}
        data-ad-format="auto"
        data-ad-slot={config.slotId}
        data-full-width-responsive="true"
        style={{ display: 'block', minHeight: '280px' }}
      />
      <Script
        async
        crossOrigin="anonymous"
        id="devdesk-adsense-loader"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}`}
        strategy="afterInteractive"
      />
      <Script id={`devdesk-adsense-${placement}`} strategy="afterInteractive">
        {'(window.adsbygoogle = window.adsbygoogle || []).push({});'}
      </Script>
    </aside>
  );
}
