import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorText } from '../components/ui';
import { Brand } from './Login';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { email, password });
      login(data.token, data.user);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="safe-top flex min-h-screen flex-col justify-center bg-page px-6">
      <div className="mx-auto w-full max-w-sm">
        <Brand />
        <h1 className="mt-8 text-2xl font-bold text-ink">Start your quit</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Clarity pairs craving management with clinically grounded screening.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
