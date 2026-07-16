import { useCallback, useEffect, useRef, useState } from 'react';
import { BreathAudioEngine } from '../lib/audio';

// Drives the guided player: phase timing comes from performance.now() deltas
// (not tick-counting) so pacing stays accurate over a multi-minute session
// even if the tab throttles occasional animation frames (NFR-6).
export function useBreathingSession(session, { ambientEnabled = false } = {}) {
  const [status, setStatus] = useState('idle'); // idle | running | paused | complete
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pausedAccumRef = useRef(0);
  const pauseStartRef = useRef(null);
  const lastPhaseIndexRef = useRef(-1);

  if (!engineRef.current) engineRef.current = new BreathAudioEngine();

  const cycleLength = session.phases.reduce((sum, p) => sum + p.seconds, 0);

  const tick = useCallback(() => {
    const now = performance.now();
    const elapsedMs = now - startRef.current - pausedAccumRef.current;
    const elapsedSec = elapsedMs / 1000;

    if (elapsedSec >= session.durationSeconds) {
      setTotalElapsed(session.durationSeconds);
      setStatus('complete');
      engineRef.current.stopAmbient();
      return;
    }

    const cyclePos = elapsedSec % cycleLength;
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < session.phases.length; i += 1) {
      const next = acc + session.phases[i].seconds;
      if (cyclePos < next) {
        idx = i;
        break;
      }
      acc = next;
    }
    const elapsedInPhase = cyclePos - acc;

    if (idx !== lastPhaseIndexRef.current) {
      lastPhaseIndexRef.current = idx;
      engineRef.current.playPhaseChime(session.phases[idx].name);
    }

    setPhaseIndex(idx);
    setPhaseElapsed(elapsedInPhase);
    setTotalElapsed(elapsedSec);

    rafRef.current = requestAnimationFrame(tick);
  }, [session, cycleLength]);

  const start = useCallback(() => {
    startRef.current = performance.now();
    pausedAccumRef.current = 0;
    lastPhaseIndexRef.current = -1;
    setStatus('running');
    if (ambientEnabled) engineRef.current.startAmbient();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, ambientEnabled]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    pauseStartRef.current = performance.now();
    setStatus('paused');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    engineRef.current.stopAmbient();
  }, [status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    pausedAccumRef.current += performance.now() - pauseStartRef.current;
    setStatus('running');
    if (ambientEnabled) engineRef.current.startAmbient();
    rafRef.current = requestAnimationFrame(tick);
  }, [status, tick, ambientEnabled]);

  useEffect(() => {
    engineRef.current.setMuted(!ambientEnabled);
    if (status === 'running') {
      if (ambientEnabled) engineRef.current.startAmbient();
      else engineRef.current.stopAmbient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientEnabled]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      engineRef.current.teardown();
    },
    []
  );

  const currentPhase = session.phases[phaseIndex];
  const phaseProgress = currentPhase ? Math.min(1, phaseElapsed / currentPhase.seconds) : 0;
  const secondsRemainingTotal = Math.max(0, Math.ceil(session.durationSeconds - totalElapsed));

  return {
    status,
    start,
    pause,
    resume,
    phaseIndex,
    currentPhase,
    phaseProgress,
    secondsRemainingInPhase: currentPhase ? Math.max(0, Math.ceil(currentPhase.seconds - phaseElapsed)) : 0,
    secondsRemainingTotal,
    totalElapsed,
    progressPct: Math.min(100, (totalElapsed / session.durationSeconds) * 100),
  };
}
