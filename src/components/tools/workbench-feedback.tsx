'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';

const toolSuccessEvent = 'devdesk:tool-success';

export type WorkbenchStatus = { kind: 'success' | 'error' | 'info'; message: string };

export function notifyWorkbenchSuccess() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(toolSuccessEvent));
  }
}

export function useWorkbenchStatus(initialStatus: WorkbenchStatus | null = null) {
  const [status, setStatus] = useState(initialStatus);
  const statusRef = useRef(status);
  const setWorkbenchStatus = useCallback<Dispatch<SetStateAction<WorkbenchStatus | null>>>((nextState) => {
    const nextStatus = typeof nextState === 'function' ? nextState(statusRef.current) : nextState;
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    if (nextStatus?.kind === 'success') notifyWorkbenchSuccess();
  }, []);

  return [status, setWorkbenchStatus] as const;
}

type ConfettiPieceStyle = CSSProperties & {
  '--confetti-x': string;
  '--confetti-rise': string;
  '--confetti-spin': string;
};

type ConfettiPiece = { id: string; isRound: boolean; style: ConfettiPieceStyle };
const confettiColors = ['#ff2ba6', '#6d7cff', '#ffc857', '#36c995', '#a779ff', '#ff786b'];

function createConfettiPieces(burstId: number): ConfettiPiece[] {
  return Array.from({ length: 48 }, (_, index) => ({
    id: `${burstId}-${index}`,
    isRound: index % 4 === 0,
    style: {
      animationDelay: `${Math.round(Math.random() * 120)}ms`,
      backgroundColor: confettiColors[index % confettiColors.length],
      left: `calc(50% + ${(Math.random() * 12 - 6).toFixed(1)}vw)`,
      top: '94%',
      '--confetti-x': `${(Math.random() * 96 - 48).toFixed(1)}vw`,
      '--confetti-rise': `${(Math.random() * 50 + 35).toFixed(1)}vh`,
      '--confetti-spin': `${Math.round(Math.random() * 900 - 450)}deg`,
    },
  }));
}

export function SuccessConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const burstIdRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleSuccess = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      burstIdRef.current += 1;
      setPieces(createConfettiPieces(burstIdRef.current));
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setPieces([]), 2400);
    };

    window.addEventListener(toolSuccessEvent, handleSuccess);
    return () => {
      window.removeEventListener(toolSuccessEvent, handleSuccess);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!pieces.length) return null;

  return (
    <div aria-hidden="true" className="success-confetti">
      {pieces.map((piece) => <span className={`success-confetti-piece${piece.isRound ? ' is-round' : ''}`} key={piece.id} style={piece.style} />)}
    </div>
  );
}
