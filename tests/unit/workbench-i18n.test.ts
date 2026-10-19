import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';

describe('tool workbench translations', () => {
  it('has the same action and status keys in all supported languages', () => {
    const expectedKeys = Object.keys(workbenchMessages.ko).sort();
    for (const locale of locales) expect(Object.keys(workbenchMessages[locale]).sort()).toEqual(expectedKeys);
  });
});
