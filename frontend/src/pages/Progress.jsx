import { useState } from 'react';
import { useDashboard, downloadClinicianPdf } from '../api/hooks';
import { buildSavingsSeries } from '../lib/savingsSeries';
import SavingsChart from '../components/charts/SavingsChart';
import { PageHeader, Card, Button, ErrorText } from '../components/ui';

export default function Progress() {
  const { data, isLoading } = useDashboard();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  async function onExport() {
    setExportError('');
    setExporting(true);
    try {
      await downloadClinicianPdf();
    } catch {
      setExportError('Could not generate the PDF. Try again in a moment.');
    } finally {
      setExporting(false);
    }
  }

  if (isLoading || !data) {
    return <div className="safe-top px-5 py-10 text-center text-ink-secondary">Loading your progress…</div>;
  }

  const series = buildSavingsSeries(data.profile, data.quitStart, data.streakDays);

  return (
    <div className="safe-top animate-fade-up px-5">
      <PageHeader title="Progress" subtitle="Your recovery, visualized." />

      <Card className="mt-4">
        <p className="text-sm font-semibold text-ink">Money saved</p>
        <SavingsChart data={series} />
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Clinician summary</p>
            <p className="mt-0.5 text-xs text-ink-secondary">A one-page PDF to bring to your next visit.</p>
          </div>
        </div>
        <Button onClick={onExport} disabled={exporting} className="mt-3 w-full">
          {exporting ? 'Generating…' : 'Export PDF'}
        </Button>
        <div className="mt-2">
          <ErrorText>{exportError}</ErrorText>
        </div>
      </Card>

      <Card className="mt-4 mb-6">
        <p className="text-sm font-semibold text-ink">Health recovery timeline</p>
        <p className="mt-0.5 text-xs text-ink-secondary">
          Commonly cited recovery milestones (CDC / Smokefree.gov). Individual recovery varies.
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {data.healthMilestones.map((m) => (
            <li key={m.label} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  m.achieved
                    ? 'bg-gradient-to-br from-brand-400 to-cyan-glow text-[#01201d] shadow-[0_0_10px_-1px_rgba(45,212,191,0.8)]'
                    : 'bg-white/[0.06] text-ink-muted'
                }`}
              >
                {m.achieved ? '✓' : ''}
              </span>
              <div>
                <p className={`text-sm font-semibold ${m.achieved ? 'text-ink' : 'text-ink-muted'}`}>{m.label}</p>
                <p className="text-xs text-ink-secondary">{m.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mb-8 px-1 text-center text-xs text-ink-muted">
        Need more support? Call the CDC Quitline at{' '}
        <a href="tel:18007848669" className="font-semibold text-brand-300 hover:text-brand-200">
          1-800-QUIT-NOW
        </a>
      </p>
    </div>
  );
}
