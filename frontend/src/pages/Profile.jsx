import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useSaveProfile, useChangePassword } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { PageHeader, Card, Button, ErrorText } from '../components/ui';
import { REASONS } from './Onboarding';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="safe-top animate-fade-up px-5">
      <PageHeader title="Profile" subtitle="Manage your account and quit info." />

      <Card className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Signed in as</p>
        <p className="mt-1 text-sm font-semibold text-ink">{user?.email}</p>
        <Button variant="danger" onClick={handleLogout} className="mt-4 w-full">
          Log out
        </Button>
      </Card>

      <QuitInfoForm />
      <PasswordForm />

      <div className="mb-8" />
    </div>
  );
}

function QuitInfoForm() {
  const { data: profile, isLoading } = useProfile();
  const saveProfile = useSaveProfile();

  const [quitDate, setQuitDate] = useState('');
  const [reasons, setReasons] = useState([]);
  const [cigarettesPerDay, setCigarettesPerDay] = useState(0);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  const [costPerPack, setCostPerPack] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setQuitDate(new Date(profile.quit_date).toISOString().slice(0, 10));
    setReasons(profile.reasons || []);
    setCigarettesPerDay(Number(profile.cigarettes_per_day));
    setCigarettesPerPack(Number(profile.cigarettes_per_pack));
    setCostPerPack(Number(profile.cost_per_pack));
  }, [profile]);

  function toggleReason(reason) {
    setReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await saveProfile.mutateAsync({
        quitDate,
        reasons,
        cigarettesPerDay: Number(cigarettesPerDay),
        cigarettesPerPack: Number(cigarettesPerPack),
        costPerPack: Number(costPerPack),
      });
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your profile.'));
    }
  }

  if (isLoading || !profile) {
    return (
      <Card className="mt-4">
        <p className="text-sm text-ink-secondary">Loading your quit info…</p>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <p className="text-sm font-semibold text-ink">Quit info</p>
      <p className="mt-0.5 text-xs text-ink-secondary">
        Feeds your streak, savings, and clinician summary.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-5">
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

        <Field label="Why are you quitting?">
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
        {saved && !error && <p className="text-sm font-semibold text-brand-300">Saved.</p>}

        <Button type="submit" disabled={saveProfile.isPending} className="w-full">
          {saveProfile.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not change your password.'));
    }
  }

  return (
    <Card className="mt-4">
      <p className="text-sm font-semibold text-ink">Change password</p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="password"
          required
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input-glass"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password (min. 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-glass"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-glass"
        />

        <ErrorText>{error}</ErrorText>
        {success && !error && <p className="text-sm font-semibold text-brand-300">Password updated.</p>}

        <Button type="submit" disabled={changePassword.isPending} className="w-full">
          {changePassword.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Card>
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
