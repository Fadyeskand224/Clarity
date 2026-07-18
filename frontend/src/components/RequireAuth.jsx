import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth() {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) return <SplashLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user && !user.hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

export function RequireGuest() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <SplashLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

function SplashLoading() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-page">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-brand-400 shadow-[0_0_20px_-4px_rgba(45,212,191,0.6)]" />
    </div>
  );
}
