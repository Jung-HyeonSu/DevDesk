import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { handoffMessages } from '@/i18n/handoff';
import { workbenchMessages } from '@/i18n/workbench';

describe('tool workbench translations', () => {
  it('has the same action and status keys in all supported languages', () => {
    const expectedKeys = Object.keys(workbenchMessages.ko).sort();
    for (const locale of locales) expect(Object.keys(workbenchMessages[locale]).sort()).toEqual(expectedKeys);
  });

  it('provides localized labels and status for every in-memory tool handoff', () => {
    const expectedKeys = Object.keys(handoffMessages.ko).sort();
    for (const locale of locales) {
      expect(Object.keys(handoffMessages[locale]).sort()).toEqual(expectedKeys);
      for (const message of Object.values(handoffMessages[locale])) expect(message.trim()).not.toBe('');
    }
  });
});
