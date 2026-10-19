'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';
import type { ToolSlug } from '@/data/tools';

type WorkbenchProps = { locale: Locale };

const workbenches: Partial<Record<ToolSlug, ComponentType<WorkbenchProps>>> = {
  'json-formatter': dynamic(() => import('./workbenches/json-workbench').then((module) => module.JsonWorkbench)),
};

export function ToolWorkbench({ locale, slug }: { locale: Locale; slug: ToolSlug }) {
  const Workbench = workbenches[slug];
  if (!Workbench) return null;
  return <div className="tool-workbench"><Workbench locale={locale} /></div>;
}
