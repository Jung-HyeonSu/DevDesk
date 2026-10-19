'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';
import type { ToolSlug } from '@/data/tools';

type WorkbenchProps = { locale: Locale };

const workbenches: Partial<Record<ToolSlug, ComponentType<WorkbenchProps>>> = {
  'sql-formatter': dynamic(() => import('./workbenches/sql-workbench').then((module) => module.SqlWorkbench)),
  'json-formatter': dynamic(() => import('./workbenches/json-workbench').then((module) => module.JsonWorkbench)),
  base64: dynamic(() => import('./workbenches/base64-workbench').then((module) => module.Base64Workbench)),
  'url-encoder': dynamic(() => import('./workbenches/url-workbench').then((module) => module.UrlWorkbench)),
  'unix-timestamp': dynamic(() => import('./workbenches/timestamp-workbench').then((module) => module.TimestampWorkbench)),
  'uuid-generator': dynamic(() => import('./workbenches/uuid-workbench').then((module) => module.UuidWorkbench)),
  'hash-generator': dynamic(() => import('./workbenches/hash-workbench').then((module) => module.HashWorkbench)),
};

export function ToolWorkbench({ locale, slug }: { locale: Locale; slug: ToolSlug }) {
  const Workbench = workbenches[slug];
  if (!Workbench) return null;
  return <div className="tool-workbench"><Workbench locale={locale} /></div>;
}
