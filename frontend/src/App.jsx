import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireGuest } from './components/RequireAuth';
import AppShell from './components/AppShell';
import AuroraBackground from './components/AuroraBackground';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import BreatheLibrary from './pages/BreatheLibrary';
import BreatheSession from './pages/BreatheSession';
import Progress from './pages/Progress';
import Journal from './pages/Journal';
import Fagerstrom from './pages/Fagerstrom';
import Medications from './pages/Medications';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuroraBackground />
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/onboarding" element={<Onboarding />} />

              <Route
                path="/"
                element={
                  <AppShell>
                    <Home />
                  </AppShell>
                }
              />
              <Route
                path="/breathe"
                element={
                  <AppShell>
                    <BreatheLibrary />
                  </AppShell>
                }
              />
              {/* Full-screen guided player — no bottom nav during a session */}
              <Route path="/breathe/:sessionId" element={<BreatheSession />} />

              <Route
                path="/progress"
                element={
                  <AppShell>
                    <Progress />
                  </AppShell>
                }
              />
              <Route
                path="/journal"
                element={
                  <AppShell>
                    <Journal />
                  </AppShell>
                }
              />
              <Route path="/fagerstrom" element={<Fagerstrom />} />
              <Route
                path="/medications"
                element={
                  <AppShell>
                    <Medications />
                  </AppShell>
                }
              />
              <Route
                path="/profile"
                element={
                  <AppShell>
                    <Profile />
                  </AppShell>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
