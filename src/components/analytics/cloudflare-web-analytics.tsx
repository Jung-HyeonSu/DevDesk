import Script from 'next/script';

export function CloudflareWebAnalytics() {
  return (
    <Script
      id="cloudflare-web-analytics"
      type="module"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "7189007c6da44a52a05277d1351c1882"}'
      strategy="afterInteractive"
    />
  );
}
