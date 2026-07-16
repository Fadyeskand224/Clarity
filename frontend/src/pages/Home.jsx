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
    <div className="safe-top px-5">
      <header className="flex items-center justify-between pb-1">
        <div>
          <p className="text-sm text-ink-secondary">Welcome back</p>
          <h1 className="text-2xl font-bold text-ink">Your recovery</h1>
        </div>
      </header>

      {/* FR-1.4: prominent one-tap Craving SOS entry point */}
      <Link
        to="/breathe/craving_sos"
        className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 text-white shadow-md active:opacity-90"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Craving right now?</p>
          <p className="text-lg font-bold">Start Craving SOS</p>
        </div>
        <span className="text-2xl">→</span>
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
          <p className="text-2xl font-bold text-brand-700">
            ${moneySaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <Link to="/progress" className="text-sm font-semibold text-brand-600">
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
          <Link to="/fagerstrom" className="text-sm font-semibold text-brand-600">
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
          <Link to="/medications" className="text-sm font-semibold text-brand-600">
            Log dose →
          </Link>
        </Card>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => setLogOpen(true)} className="text-xs font-medium text-ink-muted underline">
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
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="safe-bottom w-full rounded-t-3xl bg-surface p-6"
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
            className="rounded-xl border border-black/10 bg-page px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            placeholder="Mood at the time"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="rounded-xl border border-black/10 bg-page px-4 py-3 text-sm outline-none focus:border-brand-500"
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
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-ink-secondary">{children}</div>;
}
