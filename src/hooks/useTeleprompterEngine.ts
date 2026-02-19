import { useState, useEffect, useRef, useCallback } from 'react';
import type { TeleprompterStatus } from '@/types';
import { FONT_SIZE_PX } from '@/types';
import type { FontSize } from '@/types';

interface EngineOptions {
  text: string;
  wpm: number;
  fontSize: FontSize;
  showCountdown: boolean;
  onDone?: () => void;
  onStatusChange?: (status: TeleprompterStatus) => void;
  onProgress?: (progress: number, remainingSeconds: number) => void;
}

interface EngineState {
  status: TeleprompterStatus;
  countdownValue: number;
  scrollY: number;
  progress: number;
  remainingSeconds: number;
}

interface EngineControls {
  start: () => void;
  togglePause: () => void;
  restart: () => void;
  adjustWpm: (delta: number) => void;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function useTeleprompterEngine(options: EngineOptions): EngineState & EngineControls {
  const { text, wpm, fontSize, showCountdown, onDone, onStatusChange, onProgress } = options;

  const [status, setStatus] = useState<TeleprompterStatus>('idle');
  const [countdownValue, setCountdownValue] = useState(3);
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);
  const wpmRef = useRef(wpm);
  const statusRef = useRef<TeleprompterStatus>('idle');

  // Keep wpmRef in sync for RAF access without stale closure
  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  const updateStatus = useCallback((s: TeleprompterStatus) => {
    statusRef.current = s;
    setStatus(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  const getMaxScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return 0;
    return Math.max(0, el.scrollHeight - el.parentElement!.clientHeight);
  }, []);

  const getPixelsPerSecond = useCallback(() => {
    // Approximate: one word ≈ 5 chars wide ≈ fontSize * 0.6 px
    // One word takes 60/wpm seconds
    // px/s = fontSize_px * 0.6 / (60 / wpm) = fontSize_px * 0.6 * wpm / 60
    const fsPx = FONT_SIZE_PX[fontSize];
    return (fsPx * 0.6 * wpmRef.current) / 60;
  }, [fontSize]);

  const getTotalDuration = useCallback(() => {
    const maxScroll = getMaxScroll();
    const pps = getPixelsPerSecond();
    return pps > 0 ? maxScroll / pps : 0;
  }, [getMaxScroll, getPixelsPerSecond]);

  const scroll = useCallback((timestamp: number) => {
    if (statusRef.current !== 'scrolling') return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const pps = getPixelsPerSecond();
    const newScrollY = scrollYRef.current + pps * delta;
    const maxScroll = getMaxScroll();

    if (newScrollY >= maxScroll) {
      scrollYRef.current = maxScroll;
      setScrollY(maxScroll);
      setProgress(1);
      setRemainingSeconds(0);
      onProgress?.(1, 0);
      updateStatus('done');
      onDone?.();
      return;
    }

    scrollYRef.current = newScrollY;
    setScrollY(newScrollY);

    const totalDuration = getTotalDuration();
    const elapsed = newScrollY / pps;
    const prog = totalDuration > 0 ? elapsed / totalDuration : 0;
    const remaining = Math.max(0, totalDuration - elapsed);
    setProgress(prog);
    setRemainingSeconds(remaining);
    onProgress?.(prog, remaining);

    rafRef.current = requestAnimationFrame(scroll);
  }, [getPixelsPerSecond, getMaxScroll, getTotalDuration, onDone, onProgress, updateStatus]);

  const startScrolling = useCallback(() => {
    lastTimeRef.current = null;
    updateStatus('scrolling');
    rafRef.current = requestAnimationFrame(scroll);
  }, [scroll, updateStatus]);

  const runCountdown = useCallback(() => {
    if (!showCountdown) {
      startScrolling();
      return;
    }
    updateStatus('countdown');
    setCountdownValue(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        startScrolling();
      } else {
        setCountdownValue(count);
      }
    }, 800);
  }, [showCountdown, startScrolling, updateStatus]);

  const start = useCallback(() => {
    if (status !== 'idle') return;
    scrollYRef.current = 0;
    setScrollY(0);
    setProgress(0);
    runCountdown();
  }, [status, runCountdown]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'scrolling') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      updateStatus('paused');
    } else if (statusRef.current === 'paused') {
      updateStatus('scrolling');
      rafRef.current = requestAnimationFrame(scroll);
    }
  }, [scroll, updateStatus]);

  const restart = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    scrollYRef.current = 0;
    setScrollY(0);
    setProgress(0);
    lastTimeRef.current = null;
    updateStatus('idle');
  }, [updateStatus]);

  const adjustWpm = useCallback((_delta: number) => {
    // WPM changes are driven by the parent; this is a no-op hook
    // The parent component should update the wpm prop via state
  }, []);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Reset when text changes
  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    scrollYRef.current = 0;
    setScrollY(0);
    setProgress(0);
    setRemainingSeconds(0);
    updateStatus('idle');
  }, [text, updateStatus]);

  return {
    status,
    countdownValue,
    scrollY,
    progress,
    remainingSeconds,
    start,
    togglePause,
    restart,
    adjustWpm,
    contentRef,
  };
}
