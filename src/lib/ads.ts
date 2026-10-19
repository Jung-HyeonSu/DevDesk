export type AdPlacement = 'tool-below' | 'content-inline';

export type AdEnvironment = {
  NEXT_PUBLIC_ADS_ENABLED?: string;
  NEXT_PUBLIC_ADSENSE_APPROVED?: string;
  NEXT_PUBLIC_ADS_CONSENT_READY?: string;
  NEXT_PUBLIC_ADSENSE_CLIENT_ID?: string;
  NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID?: string;
  NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID?: string;
};

export type AdSlotConfig = { clientId: string; slotId: string };

export function getAdSlotConfig(placement: AdPlacement, environment: AdEnvironment): AdSlotConfig | null {
  if (
    environment.NEXT_PUBLIC_ADS_ENABLED !== 'true'
    || environment.NEXT_PUBLIC_ADSENSE_APPROVED !== 'true'
    || environment.NEXT_PUBLIC_ADS_CONSENT_READY !== 'true'
  ) return null;
  const clientId = environment.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? '';
  const slotId = (placement === 'tool-below'
    ? environment.NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID
    : environment.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID)?.trim() ?? '';
  if (!/^ca-pub-\d{16}$/.test(clientId) || !/^\d+$/.test(slotId)) return null;
  return { clientId, slotId };
}
