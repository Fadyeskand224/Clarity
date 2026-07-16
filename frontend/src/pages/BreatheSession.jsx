import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession, getPhaseScaleRanges } from '../lib/sessionLibrary';
import { useBreathingSession } from '../hooks/useBreathingSession';
import { useLogBreathingSession } from '../api/hooks';
import { Button } from '../components/ui';

export default function BreatheSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = getSession(sessionId);

  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [preUrgeRating, setPreUrgeRating] = useState(null);

  if (!session) {
    return (
      <div className="safe-top px-5 py-10 text-center text-ink-secondary">
        Session not found. <button onClick={() => navigate('/breathe')} className="text-brand-600 underline">Back to library</button>
      </div>
    );
  }

  if (preUrgeRating === null) {
    return <PreCheckIn session={session} onContinue={setPreUrgeRating} />;
  }

  return (
    <SessionPlayer
      session={session}
      preUrgeRating={preUrgeRating}
      ambientEnabled={ambientEnabled}
      setAmbientEnabled={setAmbientEnabled}
    />
  );
}

function PreCheckIn({ session, onContinue }) {
  return (
    <div className="safe-top flex min-h-screen flex-col justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{session.title}</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">How strong is the urge right now?</h1>
      <p className="mt-2 text-sm text-ink-secondary">{session.rationale}</p>
      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onContinue(n)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-surface text-lg font-bold text-ink active:bg-brand-50"
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted">1 = barely there · 5 = overwhelming</p>
    </div>
  );
}

function SessionPlayer({ session, preUrgeRating, ambientEnabled, setAmbientEnabled }) {
  const navigate = useNavigate();
  const logSession = useLogBreathingSession();
  const engine = useBreathingSession(session, { ambientEnabled });
  const scaleRanges = useMemo(() => getPhaseScaleRanges(session.phases), [session]);

  if (engine.status === 'complete') {
    return (
      <PostReflection
        session={session}
        preUrgeRating={preUrgeRating}
        onSave={async (postUrgeRating) => {
          await logSession.mutateAsync({
            sessionType: session.id,
            durationSeconds: session.durationSeconds,
            preUrgeRating,
            postUrgeRating,
          });
          navigate('/breathe', { replace: true });
        }}
      />
    );
  }

  const [start, end] = scaleRanges[engine.phaseIndex] || [0.6, 0.6];
  const scale = engine.status === 'idle' ? 0.6 : start + (end - start) * engine.phaseProgress;

  return (
    <div className={`safe-top flex min-h-screen flex-col items-center px-6 pb-10 bg-gradient-to-b ${session.accent} text-white`}>
      <div className="flex w-full items-center justify-between pt-2">
        <button onClick={() => navigate('/breathe')} className="text-sm font-medium opacity-90">
          ← Exit
        </button>
        <button
          onClick={() => setAmbientEnabled((v) => !v)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${ambientEnabled ? 'bg-white/30' : 'bg-white/10'}`}
        >
          {ambientEnabled ? '🔊 Ambient on' : '🔈 Ambient off'}
        </button>
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide opacity-90">{session.title}</p>
      <p className="text-xs opacity-75">{Math.max(0, Math.ceil(engine.secondsRemainingTotal))}s remaining</p>

      <div className="flex flex-1 items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full bg-white/25 backdrop-blur-sm"
          style={{
            width: 220,
            height: 220,
            transform: `scale(${scale})`,
            transition: engine.status === 'running' ? 'none' : 'transform 0.4s ease',
          }}
        >
          <div className="flex h-3/5 w-3/5 flex-col items-center justify-center rounded-full bg-white/40 text-center">
            <span className="text-xl font-bold">{engine.currentPhase?.name ?? 'Ready'}</span>
            <span className="text-sm opacity-90">
              {engine.status === 'running' || engine.status === 'paused' ? engine.secondsRemainingInPhase : ''}
            </span>
          </div>
        </div>
      </div>

      <p className="mb-4 min-h-[1.5em] text-center text-sm opacity-90">{engine.currentPhase?.cue}</p>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full bg-white transition-[width]" style={{ width: `${engine.progressPct}%` }} />
      </div>

      <div className="mt-6 flex gap-3">
        {engine.status === 'idle' && (
          <Button onClick={engine.start} className="bg-white !text-brand-700">
            Begin
          </Button>
        )}
        {engine.status === 'running' && (
          <Button onClick={engine.pause} className="bg-white/20 text-white">
            Pause
          </Button>
        )}
        {engine.status === 'paused' && (
          <Button onClick={engine.resume} className="bg-white !text-brand-700">
            Resume
          </Button>
        )}
      </div>
    </div>
  );
}

function PostReflection({ session, preUrgeRating, onSave }) {
  const [postUrgeRating, setPostUrgeRating] = useState(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="safe-top flex min-h-screen flex-col justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Session complete</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">You worked through that craving.</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        You didn't smoke — the urge was managed, not just waited out. How strong is it now?
      </p>

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setPostUrgeRating(n)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold ${
              postUrgeRating === n ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-black/10 bg-surface text-ink'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {preUrgeRating != null && postUrgeRating != null && postUrgeRating < preUrgeRating && (
        <p className="mt-4 text-sm font-semibold text-brand-600">
          Urge dropped from {preUrgeRating} to {postUrgeRating}. That's the craving fading, on its own.
        </p>
      )}

      <Button
        disabled={postUrgeRating === null || saving}
        onClick={async () => {
          setSaving(true);
          await onSave(postUrgeRating);
        }}
        className="mt-8"
      >
        {saving ? 'Saving…' : 'Done'}
      </Button>
    </div>
  );
}
