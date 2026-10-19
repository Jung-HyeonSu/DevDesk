import { describe, expect, it } from 'vitest';
import { getAdSlotConfig, type AdEnvironment } from '@/lib/ads';

const configured: AdEnvironment = {
  NEXT_PUBLIC_ADS_ENABLED: 'true',
  NEXT_PUBLIC_ADSENSE_APPROVED: 'true',
  NEXT_PUBLIC_ADS_CONSENT_READY: 'true',
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456',
  NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID: '1234567890',
  NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID: '9876543210',
};

describe('disabled-first AdSense configuration', () => {
  it('stays disabled without explicit activation and consent readiness', () => {
    expect(getAdSlotConfig('tool-below', {})).toBeNull();
    expect(getAdSlotConfig('tool-below', { ...configured, NEXT_PUBLIC_ADS_ENABLED: 'false' })).toBeNull();
    expect(getAdSlotConfig('tool-below', { ...configured, NEXT_PUBLIC_ADSENSE_APPROVED: undefined })).toBeNull();
    expect(getAdSlotConfig('tool-below', { ...configured, NEXT_PUBLIC_ADS_CONSENT_READY: undefined })).toBeNull();
  });

  it('requires a real publisher ID and placement-specific slot ID', () => {
    expect(getAdSlotConfig('tool-below', { ...configured, NEXT_PUBLIC_ADSENSE_CLIENT_ID: 'ca-pub-placeholder' })).toBeNull();
    expect(getAdSlotConfig('tool-below', { ...configured, NEXT_PUBLIC_ADSENSE_TOOL_SLOT_ID: '' })).toBeNull();
    expect(getAdSlotConfig('content-inline', { ...configured, NEXT_PUBLIC_ADSENSE_CONTENT_SLOT_ID: 'slot-placeholder' })).toBeNull();
  });

  it('returns only the configured public IDs for the requested placement', () => {
    expect(getAdSlotConfig('tool-below', configured)).toEqual({
      clientId: 'ca-pub-1234567890123456',
      slotId: '1234567890',
    });
    expect(getAdSlotConfig('content-inline', configured)).toEqual({
      clientId: 'ca-pub-1234567890123456',
      slotId: '9876543210',
    });
  });
});
