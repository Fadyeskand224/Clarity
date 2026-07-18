import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorText } from '../components/ui';

export default function Login() {
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
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(data.user.hasProfile ? '/' : '/onboarding', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not log in. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="safe-top relative z-10 flex min-h-screen flex-col justify-center px-6">
      <div className="animate-fade-up mx-auto w-full max-w-sm">
        <Brand />
        <h1 className="mt-8 text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-secondary">Log in to pick up where you left off.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass"
          />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          New to Clarity?{' '}
          <Link to="/signup" className="font-semibold text-brand-300 hover:text-brand-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-glow text-lg font-bold text-[#01201d] shadow-[0_0_20px_-4px_rgba(45,212,191,0.7)]">
        C
      </div>
      <span className="text-lg font-bold text-ink">Clarity</span>
    </div>
  );
}
