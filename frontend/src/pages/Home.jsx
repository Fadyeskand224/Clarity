import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard, useLogSmokingEvent } from '../api/hooks';
import ProgressRing from '../components/ProgressRing';
import { Card, Button } from '../components/ui';

export default function Home() {
  const { data, isLoading, isError } = useDashboard();
  const [logOpen, setLogOpen] = useState(false);

  if (isLoading) return <Centered>Loading your dashboard…</Centered>;
  if (isError || !data) return <Centered>Couldn't load your dashboard. Pull to refresh.</Centered>;

  const { streakDays, moneySaved, progressRingPct, latestFagerstrom, activeMedication } = data;

  return (
    <div className="safe-top animate-fade-up px-5">
      <header className="flex items-center justify-between pb-1">
        <div>
          <p className="text-sm text-ink-secondary">Welcome back</p>
          <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-bold text-transparent">
            Your recovery
          </h1>
        </div>
      </header>

      {/* FR-1.4: prominent one-tap Craving SOS entry point */}
      <Link to="/breathe/craving_sos" className="group relative mt-4 block">
        <div className="animate-glow-pulse absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 opacity-60 blur-xl" />
        <div className="relative flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 text-white shadow-[0_8px_30px_-8px_rgba(244,63,94,0.6)] transition-transform duration-200 group-active:scale-[0.98]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Craving right now?</p>
            <p className="text-lg font-bold">Start Craving SOS</p>
          </div>
          <span className="text-2xl transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </Link>

      <div className="mt-6 flex flex-col items-center">
        <ProgressRing pct={progressRingPct}>
          <span className="text-4xl font-extrabold text-ink">{streakDays}</span>
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">days smoke-free</span>
        </ProgressRing>
      </div>

      <Card className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Money saved</p>
          <p className="bg-gradient-to-r from-brand-300 to-cyan-glow bg-clip-text text-2xl font-bold text-transparent">
            ${moneySaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <Link to="/progress" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
          View progress →
        </Link>
      </Card>

      {/* FR-1.5: assessment entry point */}
      {!latestFagerstrom ? (
        <Card className="mt-4">
          <p className="text-sm font-semibold text-ink">Take the Fagerström Test</p>
          <p className="mt-1 text-sm text-ink-secondary">
            A 6-question clinical screening that tailors your medication guidance.
          </p>
          <Link to="/fagerstrom">
            <Button className="mt-3">Start assessment</Button>
          </Link>
        </Card>
      ) : (
        <Card className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Dependence level</p>
            <p className="text-sm font-bold text-ink">
              {latestFagerstrom.dependence_level} · {latestFagerstrom.score}/10
            </p>
          </div>
          <Link to="/fagerstrom" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Retake →
          </Link>
        </Card>
      )}

      {activeMedication && (
        <Card className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Today's regimen</p>
            <p className="text-sm font-bold text-ink">{activeMedication.medication_name}</p>
          </div>
          <Link to="/medications" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Log dose →
          </Link>
        </Card>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => setLogOpen(true)} className="text-xs font-medium text-ink-muted underline decoration-white/20 hover:text-ink-secondary">
          Had a slip? Log it — no streak shaming
        </button>
      </div>

      {logOpen && <SlipLogSheet onClose={() => setLogOpen(false)} />}
    </div>
  );
}

function SlipLogSheet({ onClose }) {
  const logEvent = useLogSmokingEvent();
  const [trigger, setTrigger] = useState('');
  const [mood, setMood] = useState('');

  async function submit(e) {
    e.preventDefault();
    await logEvent.mutateAsync({ trigger, mood });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong safe-bottom w-full rounded-t-3xl p-6 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-bold text-ink">Log what happened</p>
        <p className="mt-1 text-sm text-ink-secondary">
          This is a data point, not a failure. It helps you spot patterns — your streak resets from this
          moment, not from zero understanding.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <input
            placeholder="What triggered it? (e.g. stress, party, coffee)"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="input-glass"
          />
          <input
            placeholder="Mood at the time"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="input-glass"
          />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={logEvent.isPending} className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center text-ink-secondary">{children}</div>;
}
