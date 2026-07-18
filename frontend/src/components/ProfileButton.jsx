import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileButton() {
  const { user } = useAuth();
  const location = useLocation();
  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  if (location.pathname === '/profile') return null;

  return (
    <Link
      to="/profile"
      className="glass-panel fixed right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-brand-200 transition-all duration-200 hover:border-brand-400/40 hover:text-brand-100 active:scale-95"
      style={{ top: 'max(env(safe-area-inset-top), 0.75rem)' }}
      aria-label="Profile"
    >
      {initial}
    </Link>
  );
}
