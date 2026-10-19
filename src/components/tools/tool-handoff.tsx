'use client';

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';

export type ToolHandoff = {
  value: string;
  mode?: 'json-to-yaml';
};

type PendingHandoff = ToolHandoff & { targetToolId: string };
type ToolHandoffContextValue = {
  sendHandoff: (targetToolId: string, value: string, mode?: ToolHandoff['mode']) => void;
  peekHandoff: (targetToolId: string) => ToolHandoff | null;
  receiveHandoff: (targetToolId: string) => ToolHandoff | null;
  discardUnlessTarget: (targetToolId: string | null) => void;
};

const ToolHandoffContext = createContext<ToolHandoffContextValue | null>(null);

export function ToolHandoffProvider({ children }: { children: ReactNode }) {
  // Tool input exists only in memory and is consumed once by its destination.
  const pending = useRef<PendingHandoff | null>(null);
  const sendHandoff = useCallback((targetToolId: string, value: string, mode?: ToolHandoff['mode']) => {
    pending.current = { targetToolId, value, mode };
  }, []);
  const peekHandoff = useCallback((targetToolId: string) => {
    if (pending.current?.targetToolId !== targetToolId) return null;
    return { value: pending.current.value, mode: pending.current.mode };
  }, []);
  const receiveHandoff = useCallback((targetToolId: string) => {
    if (pending.current?.targetToolId !== targetToolId) return null;
    const handoff: ToolHandoff = { value: pending.current.value, mode: pending.current.mode };
    pending.current = null;
    return handoff;
  }, []);
  const discardUnlessTarget = useCallback((targetToolId: string | null) => {
    if (pending.current && pending.current.targetToolId !== targetToolId) pending.current = null;
  }, []);
  const value = useMemo(() => ({ sendHandoff, peekHandoff, receiveHandoff, discardUnlessTarget }), [sendHandoff, peekHandoff, receiveHandoff, discardUnlessTarget]);

  return <ToolHandoffContext.Provider value={value}>{children}</ToolHandoffContext.Provider>;
}

export function useToolHandoff() {
  const value = useContext(ToolHandoffContext);
  if (!value) throw new Error('useToolHandoff must be used inside AppShell');
  return value;
}
