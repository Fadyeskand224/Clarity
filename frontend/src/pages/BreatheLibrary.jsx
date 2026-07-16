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
        <div className="px-5 pb-2">
          <p className="text-xs font-semibold text-brand-600">
            {data.totalCompleted} craving{data.totalCompleted === 1 ? '' : 's'} worked through so far
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 pb-6">
        {SESSIONS.map((session) => (
          <Link key={session.id} to={`/breathe/${session.id}`}>
            <Card
              className={`bg-gradient-to-r ${session.accent} border-none text-white ${
                session.urgent ? 'ring-2 ring-orange-300' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{session.title}</p>
                  <p className="text-sm opacity-90">{session.subtitle}</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
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
