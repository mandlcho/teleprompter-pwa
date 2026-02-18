import { useCallback, useEffect, useRef, useState } from 'react';
import type { TeleprompterStatus } from '@/types';
import { countWords } from '@/utils/wordCounter';

interface UseTeleprompterEngineProps {
  text: string;
  wpm: number;
  contentHeightPx: number;
  viewportHeightPx: number;
  onDone: () => void;
}

interface UseTeleprompterEngineReturn {
  status: TeleprompterStatus;
  scrollOffsetPx: number;
  countdownValue: 3 | 2 | 1 | null;
  elapsedSeconds: number;
  totalSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  togglePause: () => void;
}

export function useTeleprompterEngine({
  text,
  wpm,
  contentHeightPx,
  viewportHeightPx,
  onDone,
}: UseTeleprompterEngineProps): UseTeleprompterEngineReturn {
  const [status, setStatus] = useState<TeleprompterStatus>('idle');
  const [scrollOffsetPx, setScrollOffsetPx] = useState(0);
  const [countdownValue, setCountdownValue] = useState<3 | 2 | 1 | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const currentOffsetRef = useRef(0);
  const elapsedRef = useRef(0);
  const wpmRef = useRef(wpm);
  const contentHeightRef = useRef(contentHeightPx);
  const viewportHeightRef = useRef(viewportHeightPx);
  const statusRef = useRef<TeleprompterStatus>('idle');
  const onDoneRef = useRef(onDone);

  // Keep refs in sync with props/state
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { contentHeightRef.current = contentHeightPx; }, [contentHeightPx]);
  useEffect(() => { viewportHeightRef.current = viewportHeightPx; }, [viewportHeightPx]);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const wordCount = countWords(text);
  const totalSeconds = wpm > 0 && wordCount > 0 ? Math.round((wordCount / wpm) * 60) : 0;

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const runFrame = useCallback((timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }
    const delta = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    const h = contentHeightRef.current;
    const vh = viewportHeightRef.current;
    const wc = countWords(text);
    const w = wpmRef.current;
    const pxPerSecond = w > 0 && wc > 0 ? h / ((wc / w) * 60) : 0;

    const newOffset = currentOffsetRef.current - pxPerSecond * delta;
    const stopPoint = -(h - vh * 0.3);

    elapsedRef.current += delta;
    setElapsedSeconds(Math.floor(elapsedRef.current));

    if (newOffset <= stopPoint) {
      currentOffsetRef.current = stopPoint;
      setScrollOffsetPx(stopPoint);
      stopRaf();
      setStatus('done');
      statusRef.current = 'done';
      onDoneRef.current();
      return;
    }

    currentOffsetRef.current = newOffset;
    setScrollOffsetPx(newOffset);
    rafRef.current = requestAnimationFrame(runFrame);
  }, [text, stopRaf]);

  const startScrolling = useCallback(() => {
    setStatus('scrolling');
    statusRef.current = 'scrolling';
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const start = useCallback(() => {
    if (text.trim() === '' || contentHeightRef.current === 0) return;

    stopRaf();
    currentOffsetRef.current = 0;
    elapsedRef.current = 0;
    setScrollOffsetPx(0);
    setElapsedSeconds(0);
    setCountdownValue(3);
    setStatus('countdown');
    statusRef.current = 'countdown';

    let count = 3;
    const tick = () => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count as 3 | 2 | 1);
        setTimeout(tick, 1000);
      } else {
        setCountdownValue(null);
        startScrolling();
      }
    };
    setTimeout(tick, 1000);
  }, [text, stopRaf, startScrolling]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'scrolling') return;
    stopRaf();
    setStatus('paused');
    statusRef.current = 'paused';
  }, [stopRaf]);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    setStatus('scrolling');
    statusRef.current = 'scrolling';
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const restart = useCallback(() => {
    stopRaf();
    currentOffsetRef.current = 0;
    elapsedRef.current = 0;
    setScrollOffsetPx(0);
    setElapsedSeconds(0);
    start();
  }, [stopRaf, start]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'scrolling') pause();
    else if (statusRef.current === 'paused') resume();
  }, [pause, resume]);

  // Cleanup on unmount
  useEffect(() => () => stopRaf(), [stopRaf]);

  return {
    status,
    scrollOffsetPx,
    countdownValue,
    elapsedSeconds,
    totalSeconds,
    start,
    pause,
    resume,
    restart,
    togglePause,
  };
}
