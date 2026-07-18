import { Link } from 'react-router-dom';
import { SESSIONS } from '../lib/sessionLibrary';
import { useBreathingHistory } from '../api/hooks';
import { PageHeader, Card } from '../components/ui';

export default function BreatheLibrary() {
  const { data } = useBreathingHistory();

  return (
    <div className="safe-top">
      <PageHeader title="Breathe" subtitle="Guided sessions for managing cravings in the moment." />

      {data?.totalCompleted > 0 && (
        <div className="animate-fade-up px-5 pb-2">
          <p className="text-xs font-semibold text-brand-300">
            {data.totalCompleted} craving{data.totalCompleted === 1 ? '' : 's'} worked through so far
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 pb-6">
        {SESSIONS.map((session, i) => (
          <Link key={session.id} to={`/breathe/${session.id}`} className="group block">
            <Card
              className="animate-fade-up text-white shadow-[0_10px_40px_-14px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_50px_-14px_rgba(0,0,0,0.8)] group-active:scale-[0.98]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`-m-4 flex items-center justify-between rounded-2xl bg-gradient-to-r p-4 ${session.accent} ${session.urgent ? 'ring-1 ring-orange-300/60' : ''}`}>
                <div>
                  <p className="text-lg font-bold">{session.title}</p>
                  <p className="text-sm opacity-90">{session.subtitle}</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {Math.round(session.durationSeconds / 60) || 1} min
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
