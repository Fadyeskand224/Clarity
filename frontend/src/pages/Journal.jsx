import { useState } from 'react';
import { useJournalEntries, useCreateJournalEntry } from '../api/hooks';
import { PageHeader, Card, Button, EmptyState } from '../components/ui';

const MOODS = ['Stressed', 'Anxious', 'Bored', 'Social', 'Tired', 'Calm', 'Happy'];

export default function Journal() {
  const { data: entries, isLoading } = useJournalEntries();
  const createEntry = useCreateJournalEntry();

  const [trigger, setTrigger] = useState('');
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (!trigger && !mood && !note) return;
    await createEntry.mutateAsync({ trigger: trigger || null, mood: mood || null, note: note || null });
    setTrigger('');
    setMood('');
    setNote('');
  }

  return (
    <div className="safe-top animate-fade-up px-5">
      <PageHeader title="Journal" subtitle="Log triggers and mood to spot your patterns." />

      <Card className="mt-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Trigger (e.g. after coffee, driving)"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="input-glass"
          />
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMood(mood === m ? '' : m)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  mood === m
                    ? 'border-brand-400/50 bg-brand-400/15 text-brand-300 shadow-[0_0_12px_-4px_rgba(45,212,191,0.6)]'
                    : 'border-white/10 bg-white/[0.03] text-ink-secondary hover:border-white/20'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="input-glass resize-none"
          />
          <Button type="submit" disabled={createEntry.isPending} className="w-full">
            {createEntry.isPending ? 'Saving…' : 'Add entry'}
          </Button>
        </form>
      </Card>

      <div className="mt-5 mb-6">
        <p className="mb-2 text-sm font-semibold text-ink">Recent entries</p>
        {isLoading && <EmptyState>Loading…</EmptyState>}
        {!isLoading && (!entries || entries.length === 0) && <EmptyState>No entries yet — log your first one above.</EmptyState>}
        <div className="flex flex-col gap-2">
          {entries?.map((entry) => (
            <Card key={entry.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {[entry.trigger, entry.mood].filter(Boolean).join(' · ') || 'Check-in'}
                </p>
                {entry.note && <p className="mt-0.5 text-sm text-ink-secondary">{entry.note}</p>}
              </div>
              <span className="shrink-0 pl-3 text-xs text-ink-muted">
                {new Date(entry.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
