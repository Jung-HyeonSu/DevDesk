'use client';

import { useRouter } from 'next/navigation';
import { useToolHandoff } from '@/components/tools/tool-handoff';
import type { ToolSlug } from '@/data/tools';
import type { Locale } from '@/i18n/config';

export function WorkflowToolAction({ locale, toolSlug, value, label }: {
  locale: Locale;
  toolSlug: ToolSlug;
  value: string;
  label: string;
}) {
  const router = useRouter();
  const { sendHandoff } = useToolHandoff();

  const openExample = () => {
    sendHandoff(toolSlug, value);
    router.push(`/${locale}/tools/${toolSlug}/`);
  };

  return (
    <button className="action-button action-secondary workflow-tool-action" data-workflow-tool={toolSlug} onClick={openExample} type="button">
      {label}<span aria-hidden="true"> →</span>
    </button>
  );
}
