import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaveProfile } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { Button, ErrorText } from '../components/ui';
import { Brand } from './Login';

export const REASONS = ['Health', 'Family', 'Money', 'Fitness', 'Pregnancy', 'A doctor recommended it'];

export default function Onboarding() {
  const { setHasProfile } = useAuth();
  const navigate = useNavigate();
  const saveProfile = useSaveProfile();

  const [quitDate, setQuitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reasons, setReasons] = useState([]);
  const [cigarettesPerDay, setCigarettesPerDay] = useState(10);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  const [costPerPack, setCostPerPack] = useState(10);
  const [error, setError] = useState('');

  function toggleReason(reason) {
    setReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await saveProfile.mutateAsync({
        quitDate,
        reasons,
        cigarettesPerDay: Number(cigarettesPerDay),
        cigarettesPerPack: Number(cigarettesPerPack),
        costPerPack: Number(costPerPack),
      });
      setHasProfile(true);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your profile.'));
    }
  }

  return (
    <div className="safe-top relative z-10 min-h-screen px-6 pb-12">
      <div className="animate-fade-up mx-auto max-w-sm">
        <Brand />
        <h1 className="mt-8 text-2xl font-bold text-ink">Let's set up your quit</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          This feeds your streak, savings, and clinician summary — you can change it anytime.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
          <Field label="Quit date">
            <input
              type="date"
              required
              value={quitDate}
              onChange={(e) => setQuitDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="input-glass w-full"
            />
          </Field>

          <Field label="Why are you quitting? (optional)">
            <div className="flex flex-wrap gap-2">
              {REASONS.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => toggleReason(reason)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    reasons.includes(reason)
                      ? 'border-brand-400/50 bg-brand-400/15 text-brand-300 shadow-[0_0_12px_-4px_rgba(45,212,191,0.6)]'
                      : 'border-white/10 bg-white/[0.03] text-ink-secondary hover:border-white/20'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Cigarettes per day (before quitting)">
            <input
              type="number"
              min="0"
              required
              value={cigarettesPerDay}
              onChange={(e) => setCigarettesPerDay(e.target.value)}
              className="input-glass w-full"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cigarettes per pack">
              <input
                type="number"
                min="1"
                required
                value={cigarettesPerPack}
                onChange={(e) => setCigarettesPerPack(e.target.value)}
                className="input-glass w-full"
              />
            </Field>
            <Field label="Cost per pack ($)">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={costPerPack}
                onChange={(e) => setCostPerPack(e.target.value)}
                className="input-glass w-full"
              />
            </Field>
          </div>

          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={saveProfile.isPending} className="w-full">
            {saveProfile.isPending ? 'Saving…' : 'Start tracking'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
